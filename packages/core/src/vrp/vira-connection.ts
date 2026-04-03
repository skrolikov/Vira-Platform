import type { Message } from "./types";

enum OpCode {
  HELLO = 0,
  AUTH = 1,
  READY = 2,
  EVENT = 3,
  ERROR = 4,
  HEARTBEAT = 5,
}

type WireMessage = Record<string, any>;

function typeToOp(type: string): OpCode | undefined {
  switch (type) {
    case "handshake":
      return OpCode.AUTH;
    case "ack":
      return OpCode.READY;
    case "event":
    case "update":
    case "diff":
      return OpCode.EVENT;
    case "error":
      return OpCode.ERROR;
    case "ping":
    case "pong":
      return OpCode.HEARTBEAT;
    default:
      return undefined;
  }
}

function opToType(msg: WireMessage): string | undefined {
  if (typeof msg.type === "string" && msg.type) return msg.type;
  switch (msg.op) {
    case OpCode.AUTH:
      return "handshake";
    case OpCode.READY:
      return "ack";
    case OpCode.ERROR:
      return "error";
    case OpCode.HEARTBEAT:
      // HEARTBEAT is multiplexed, detect by legacy fallback
      if (msg.kind === "pong") return "pong";
      return "ping";
    case OpCode.EVENT:
      // EVENT can carry domain event or state payloads.
      // Prefer explicit legacy `type`, otherwise infer by payload shape.
      if (typeof msg.name === "string" && msg.name) return "event";
      if (msg.patch !== undefined) return "diff";
      if (msg.channel !== undefined && msg.d !== undefined) return "update";
      return "event";
    default:
      return undefined;
  }
}

function encodeWire(msg: WireMessage): WireMessage {
  const out: WireMessage = { ...msg };
  const op = typeToOp(String(msg.type || ""));
  if (op !== undefined) out.op = op;
  if (op === OpCode.EVENT && typeof msg.name === "string" && msg.name) {
    out.t = msg.name;
    out.d = msg.data;
  } else if (msg.data !== undefined) {
    out.d = msg.data;
  }
  return out;
}

function decodeWire(raw: WireMessage): Message {
  const type = opToType(raw);
  if (!type) return raw as Message;
  const msg: WireMessage = { ...raw, type };
  if (msg.data === undefined && msg.d !== undefined) {
    msg.data = msg.d;
  }
  if (!msg.name && typeof msg.t === "string") {
    msg.name = msg.t;
  }
  return msg as Message;
}

export interface ViraReconnectOptions {
  /** Base delay before reconnect (ms). Default: 400 */
  baseDelayMs?: number;
  /** Max delay before reconnect (ms). Default: 15000 */
  maxDelayMs?: number;
  /** Random jitter added to delay (ms). Default: 800 */
  jitterMs?: number;
  /** Debounce window for reconnect scheduling (ms). Default: 200 */
  debounceMs?: number;
}

export interface ViraConnectionOptions {
  url: string;
  onMessage?: (msg: Message) => void;
  onConnect?: () => void;
  onDisconnect?: (event?: CloseEvent) => void;
  onError?: (error: Error) => void;
  onSessionChange?: (session: string | null) => void;
  session?: string | null;
  authToken?: string;
  debug?: boolean;
  reconnect?: ViraReconnectOptions;
  /** Additional data to send in handshake (e.g., company_id, location_id) */
  handshakeData?: Record<string, any>;
}

export interface ViraConnection {
  /** Subscribe a channel (idempotent). */
  subscribe: (channel: string) => void;
  /** Unsubscribe a channel (best-effort). */
  unsubscribe: (channel: string) => void;
  /** Send event to an explicit channel. */
  sendEvent: (channel: string, name: string, payload: any, msgId?: string) => void;
  /** Send full update to an explicit channel. */
  sendUpdate: (channel: string, payload: any, msgId?: string) => void;
  /** Send diff patch to an explicit channel. */
  sendDiff: (channel: string, patch: any, msgId?: string) => void;
  /** Close connection and stop reconnecting. */
  close: () => void;
  /** Current session (if any). */
  getSession: () => string | null;
  /** Whether socket is open and handshake is acknowledged. */
  isReady: () => boolean;
}

function normalizeWsUrl(urlOption: string): string {
  // If already ws(s), trust caller (allows passing full ws://.../ws)
  if (urlOption.startsWith("ws://") || urlOption.startsWith("wss://")) {
    return urlOption;
  }
  const trimmed = urlOption.replace(/\/+$/, "");
  return trimmed.replace(/^http/, "ws") + "/ws";
}

function nowMs() {
  return Date.now();
}

export function createViraConnection(options: ViraConnectionOptions): ViraConnection {
  const {
    url: urlOption,
    onMessage,
    onConnect,
    onDisconnect,
    onError,
    onSessionChange,
    session: initialSession,
    authToken: authTokenOption,
    debug = false,
    reconnect,
    handshakeData,
  } = options;

  // Reconnect storm: jitter размазывает 200+ клиентов по времени.
  // baseDelayMs=100 — быстрый reconnect для обычного пользователя.
  // jitterMs=800 — остаётся высоким для защиты от reconnect storm (200+ клиентов).
  const reconnectOpts: Required<ViraReconnectOptions> = {
    baseDelayMs: reconnect?.baseDelayMs ?? 100,
    maxDelayMs: reconnect?.maxDelayMs ?? 15000,
    jitterMs: reconnect?.jitterMs ?? 800,
    debounceMs: reconnect?.debounceMs ?? 100,
  };

  const url = normalizeWsUrl(urlOption);

  let ws: WebSocket | null = null;
  let session: string | null = initialSession || null;

  // "Ready" means: ws is OPEN and handshake ACK received
  let ready = false;
  let aborted = false;
  let isConnecting = false;

  // Subscriptions we want to keep (re-applied after reconnect)
  const desiredChannels = new Set<string>();

  // Outbound buffer while not ready/open (bounded — backpressure)
  const OUTBOX_MAX = 1000;
  const outbox: string[] = [];

  // reconnect state
  let attempt = 0;
  let reconnectTimeoutId: any = null;
  let pingIntervalId: any = null;
  let lastReconnectScheduledAt = 0;

  const log = (...args: any[]) => {
    if (!debug) return;
    // eslint-disable-next-line no-console
    console.debug("[VRP]", ...args);
  };

  const flushOutbox = () => {
    if (!ws || ws.readyState !== WebSocket.OPEN || !ready) return;
    while (outbox.length > 0) {
      const raw = outbox.shift();
      if (!raw) continue;
      try {
        ws.send(raw);
      } catch {
        // If send fails mid-flush, requeue and bail
        outbox.unshift(raw);
        return;
      }
    }
  };

  const sendRaw = (raw: string) => {
    if (ws?.readyState === WebSocket.OPEN && ready) {
      try {
        ws.send(raw);
        return;
      } catch {
        // fall through to buffer
      }
    }
    outbox.push(raw);
    while (outbox.length > OUTBOX_MAX) {
      outbox.shift();
    }
  };

  const sendMsg = (msg: Omit<Message, "ts"> & { ts?: number }) => {
    // Ensure ts exists
    const full = { ...msg, ts: msg.ts ?? nowMs() } as any;
    sendRaw(JSON.stringify(encodeWire(full)));
  };

  const scheduleReconnect = (reason: string, event?: CloseEvent) => {
    if (aborted) return;
    attempt += 1;
    if (attempt > 10) {
      aborted = true;
      onError?.(new Error("VRP: max reconnect attempts exceeded"));
      log("reconnect aborted (max attempts)", { attempt });
      return;
    }
    if (reconnectTimeoutId) {
      clearTimeout(reconnectTimeoutId);
      reconnectTimeoutId = null;
    }

    const base = Math.min(reconnectOpts.baseDelayMs * Math.pow(2, attempt - 1), reconnectOpts.maxDelayMs);
    const jitter = Math.floor(Math.random() * reconnectOpts.jitterMs);
    const delay = base + jitter;

    const now = nowMs();
    // Debounce reconnect scheduling to avoid rapid thrash
    const sinceLast = now - lastReconnectScheduledAt;
    const finalDelay = sinceLast < reconnectOpts.debounceMs ? reconnectOpts.debounceMs : delay;
    lastReconnectScheduledAt = now;

    log("reconnect scheduled", { reason, code: event?.code, attempt, delay: finalDelay });
    reconnectTimeoutId = setTimeout(() => {
      reconnectTimeoutId = null;
      if (!aborted) connect();
    }, finalDelay);
  };

  const applySubscriptions = () => {
    if (!ws || ws.readyState !== WebSocket.OPEN || !ready) return;
    if (desiredChannels.size === 0) return;
    const channels = Array.from(desiredChannels).filter(Boolean);
    if (channels.length === 0) return;
    ws.send(JSON.stringify(encodeWire({ type: "sub", channels })));
    log("sub ->", channels);
  };

  const connect = () => {
    if (aborted || isConnecting) return;

    // close any existing socket
    if (ws) {
      const oldWs = ws;
      ws = null;
      try {
        if (oldWs.readyState === WebSocket.OPEN || oldWs.readyState === WebSocket.CONNECTING) {
          oldWs.close();
        }
      } catch {
        // ignore
      }
    }

    ready = false;
    isConnecting = true;
    const newWs = new WebSocket(url);
    ws = newWs;

    newWs.onopen = () => {
      isConnecting = false;
      log("open");

      // Send handshake first
      const handshakeMsg: any = {
        type: "handshake",
        client: "vira-react",
        version: "0.1",
        authToken: authTokenOption || "",
        session: session || undefined,
        ts: nowMs(),
      };
      
      // Include handshakeData if provided
      if (handshakeData && Object.keys(handshakeData).length > 0) {
        handshakeMsg.data = handshakeData;
      }
      
      newWs.send(JSON.stringify(encodeWire(handshakeMsg)));

      onConnect?.();
    };

    newWs.onmessage = (evt) => {
      try {
        const msg = decodeWire(JSON.parse(evt.data as string) as WireMessage);

        switch (msg.type) {
          case "ack": {
            // reset reconnect attempt on successful ack
            attempt = 0;
            if (msg.session) {
              const old = session;
              session = msg.session;
              if (old !== session) onSessionChange?.(session);
            }
            ready = true;

            // apply subscriptions + ping interval
            applySubscriptions();

            if ((msg as any).interval) {
              clearInterval(pingIntervalId);
              pingIntervalId = setInterval(() => {
                if (ws?.readyState === WebSocket.OPEN) {
                  ws.send(JSON.stringify(encodeWire({ type: "ping", ts: nowMs() })));
                }
              }, (msg as any).interval);
            }

            // now safe to flush buffered messages
            flushOutbox();
            break;
          }
          case "ping":
            ws?.send(JSON.stringify(encodeWire({ type: "pong", ts: nowMs() })));
            break;
          case "error":
            onError?.(new Error(msg.message || "VRP error"));
            if ((msg as any).retry === false) {
              aborted = true;
              try {
                ws?.close();
              } catch {
                // ignore
              }
            }
            // Also forward error messages with channel to pool for routing to subscribers
            // This allows error responses to specific events (e.g., auth.login) to reach their listeners
            if ((msg as any).channel && (msg as any).msgId) {
              onMessage?.(msg);
            }
            break;
          default:
            // Forward all messages (pool will route by channel)
            onMessage?.(msg);
        }
      } catch {
        // ignore malformed
      }
    };

    newWs.onclose = (event) => {
      ws = null;
      isConnecting = false;
      ready = false;
      clearInterval(pingIntervalId);
      if (reconnectTimeoutId) {
        clearTimeout(reconnectTimeoutId);
        reconnectTimeoutId = null;
      }

      onDisconnect?.(event);

      if (!aborted) {
        scheduleReconnect("close", event);
      } else {
        log("closed (aborted)", { code: event.code, reason: event.reason });
      }
    };

    newWs.onerror = () => {
      isConnecting = false;
      // If error happens while open, surface it; onclose will handle reconnect
      if (newWs.readyState === WebSocket.OPEN) {
        onError?.(new Error("WebSocket error"));
      }
    };
  };

  // start immediately
  connect();

  const ensureChannel = (ch: string) => String(ch || "").trim();

  return {
    subscribe: (channel: string) => {
      const ch = ensureChannel(channel);
      if (!ch) return;
      desiredChannels.add(ch);
      if (ws?.readyState === WebSocket.OPEN && ready) {
        ws.send(JSON.stringify(encodeWire({ type: "sub", channels: [ch] })));
        log("sub +", ch);
      }
    },
    unsubscribe: (channel: string) => {
      const ch = ensureChannel(channel);
      if (!ch) return;
      desiredChannels.delete(ch);
      if (ws?.readyState === WebSocket.OPEN && ready) {
        ws.send(JSON.stringify(encodeWire({ type: "unsub", channels: [ch] })));
        log("unsub -", ch);
      }
    },
    sendEvent: (channel: string, name: string, payload: any, msgId?: string) => {
      const ch = ensureChannel(channel);
      if (!ch) return;
      // versionNo задаёт только сервер; клиент шлёт msgId для идемпотентности
      sendMsg({ type: "event", name, channel: ch, data: payload, msgId } as any);
    },
    sendUpdate: (channel: string, payload: any, msgId?: string) => {
      const ch = ensureChannel(channel);
      if (!ch) return;
      sendMsg({ type: "update", channel: ch, data: payload, msgId } as any);
    },
    sendDiff: (channel: string, patch: any, msgId?: string) => {
      const ch = ensureChannel(channel);
      if (!ch) return;
      sendMsg({ type: "diff", channel: ch, patch, msgId } as any);
    },
    close: () => {
      aborted = true;
      ready = false;
      clearInterval(pingIntervalId);
      if (reconnectTimeoutId) clearTimeout(reconnectTimeoutId);
      reconnectTimeoutId = null;
      if (ws) {
        const old = ws;
        ws = null;
        try {
          old.close(1000, "Client closing");
        } catch {
          // ignore
        }
      }
    },
    getSession: () => session,
    isReady: () => Boolean(ws && ws.readyState === WebSocket.OPEN && ready),
  };
}


