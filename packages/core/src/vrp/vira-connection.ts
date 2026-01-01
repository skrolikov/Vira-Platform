import type { Message } from "./types";

export interface ViraReconnectOptions {
  /** Base delay before reconnect (ms). Default: 300 */
  baseDelayMs?: number;
  /** Max delay before reconnect (ms). Default: 5000 */
  maxDelayMs?: number;
  /** Random jitter added to delay (ms). Default: 250 */
  jitterMs?: number;
  /** Debounce window for reconnect scheduling (ms). Default: 150 */
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
  } = options;

  const reconnectOpts: Required<ViraReconnectOptions> = {
    baseDelayMs: reconnect?.baseDelayMs ?? 300,
    maxDelayMs: reconnect?.maxDelayMs ?? 5000,
    jitterMs: reconnect?.jitterMs ?? 250,
    debounceMs: reconnect?.debounceMs ?? 150,
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

  // Outbound buffer while not ready/open
  const outbox: string[] = [];

  // Client-local message counter (server ignores it; used only to satisfy Message schema)
  let clientMsgNo = 0;

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
  };

  const sendMsg = (msg: Omit<Message, "ts"> & { ts?: number }) => {
    // Ensure ts exists
    const full = { ...msg, ts: msg.ts ?? nowMs() } as any;
    sendRaw(JSON.stringify(full));
  };

  const scheduleReconnect = (reason: string, event?: CloseEvent) => {
    if (aborted) return;
    if (reconnectTimeoutId) {
      clearTimeout(reconnectTimeoutId);
      reconnectTimeoutId = null;
    }

    const base = Math.min(reconnectOpts.baseDelayMs * Math.pow(2, attempt), reconnectOpts.maxDelayMs);
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

    attempt = Math.min(attempt + 1, 10);
  };

  const applySubscriptions = () => {
    if (!ws || ws.readyState !== WebSocket.OPEN || !ready) return;
    if (desiredChannels.size === 0) return;
    const channels = Array.from(desiredChannels).filter(Boolean);
    if (channels.length === 0) return;
    ws.send(JSON.stringify({ type: "sub", channels }));
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
      newWs.send(
        JSON.stringify({
          type: "handshake",
          client: "vira-react",
          version: "0.1",
          authToken: authTokenOption || "",
          session: session || undefined,
          ts: nowMs(),
        })
      );

      onConnect?.();
    };

    newWs.onmessage = (evt) => {
      try {
        const msg = JSON.parse(evt.data as string) as Message;

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
                  ws.send(JSON.stringify({ type: "ping", ts: nowMs() }));
                }
              }, (msg as any).interval);
            }

            // now safe to flush buffered messages
            flushOutbox();
            break;
          }
          case "ping":
            ws?.send(JSON.stringify({ type: "pong", ts: nowMs() }));
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
        ws.send(JSON.stringify({ type: "sub", channels: [ch] }));
        log("sub +", ch);
      }
    },
    unsubscribe: (channel: string) => {
      const ch = ensureChannel(channel);
      if (!ch) return;
      desiredChannels.delete(ch);
      if (ws?.readyState === WebSocket.OPEN && ready) {
        ws.send(JSON.stringify({ type: "unsub", channels: [ch] }));
        log("unsub -", ch);
      }
    },
    sendEvent: (channel: string, name: string, payload: any, msgId?: string) => {
      const ch = ensureChannel(channel);
      if (!ch) return;
      clientMsgNo += 1;
      sendMsg({ type: "event", name, channel: ch, data: payload, versionNo: clientMsgNo, msgId } as any);
    },
    sendUpdate: (channel: string, payload: any, msgId?: string) => {
      const ch = ensureChannel(channel);
      if (!ch) return;
      clientMsgNo += 1;
      sendMsg({ type: "update", channel: ch, data: payload, versionNo: clientMsgNo, msgId } as any);
    },
    sendDiff: (channel: string, patch: any, msgId?: string) => {
      const ch = ensureChannel(channel);
      if (!ch) return;
      clientMsgNo += 1;
      sendMsg({ type: "diff", channel: ch, patch, versionNo: clientMsgNo, msgId } as any);
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


