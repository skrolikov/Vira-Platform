import type { Message } from "./types";
import { createViraConnection, type ViraConnection, type ViraReconnectOptions } from "./vira-connection";

export interface ViraPoolStatus {
  connected: boolean;
  error: Error | null;
  session: string | null;
}

export type ViraPoolStatusListener = (status: ViraPoolStatus) => void;
export type ViraChannelListener = (msg: Message) => void;

export interface ViraPoolOptions {
  url: string;
  authToken?: string;
  debug?: boolean;
  /** Close underlying socket after this idle time when there are no listeners. Default: 15000ms */
  idleCloseMs?: number;
  reconnect?: ViraReconnectOptions;
  /** Additional data to send in handshake (e.g., company_id, location_id) */
  handshakeData?: Record<string, any>;
}

export interface ViraConnectionPool {
  /** Subscribe to a channel and start receiving update/diff/event for it. Returns unsubscribe function. */
  subscribe(channel: string, listener: ViraChannelListener): () => void;
  /** Listen to connection status changes (shared). Returns unsubscribe function. */
  onStatus(listener: ViraPoolStatusListener): () => void;
  /** Send messages */
  sendEvent(channel: string, name: string, payload: any, msgId?: string): void;
  sendUpdate(channel: string, payload: any, msgId?: string): void;
  sendDiff(channel: string, patch: any, msgId?: string): void;
  /** Current status */
  getStatus(): ViraPoolStatus;
}

class ViraConnectionPoolImpl implements ViraConnectionPool {
  private readonly url: string;
  private readonly authToken: string;
  private debug: boolean;
  private readonly idleCloseMs: number;
  private readonly reconnect?: ViraReconnectOptions;
  private readonly handshakeData?: Record<string, any>;

  private conn: ViraConnection | null = null;
  private session: string | null = null;

  private connected = false;
  private error: Error | null = null;
  private statusListeners = new Set<ViraPoolStatusListener>();

  // Per-channel listener sets & refcounts
  private channelListeners = new Map<string, Set<ViraChannelListener>>();
  private channelRefCount = new Map<string, number>();

  private idleTimer: any = null;

  constructor(opts: ViraPoolOptions) {
    this.url = opts.url;
    this.authToken = opts.authToken || "";
    this.debug = Boolean(opts.debug);
    this.idleCloseMs = opts.idleCloseMs ?? 15000;
    this.reconnect = opts.reconnect;
    this.handshakeData = opts.handshakeData;
  }

  private log(...args: any[]) {
    if (!this.debug) return;
    // eslint-disable-next-line no-console
    console.debug("[VRP:POOL]", ...args);
  }

  private notifyStatus() {
    const status = this.getStatus();
    this.statusListeners.forEach((l) => {
      try {
        l(status);
      } catch {
        // ignore
      }
    });
  }

  private ensureConn() {
    if (this.conn) return;
    this.log("create connection", { url: this.url });

    this.conn = createViraConnection({
      url: this.url,
      authToken: this.authToken,
      session: this.session,
      debug: this.debug,
      reconnect: this.reconnect,
      handshakeData: this.handshakeData,
      onConnect: () => {
        // Note: connect fires on WS open; "ready" happens after ack, but for UI it's fine.
        this.connected = true;
        this.error = null;
        this.notifyStatus();
      },
      onDisconnect: () => {
        this.connected = false;
        this.notifyStatus();
      },
      onError: (err) => {
        this.error = err;
        this.notifyStatus();
      },
      onSessionChange: (s) => {
        this.session = s;
        this.notifyStatus();
      },
      onMessage: (msg) => {
        // route only channel-bearing messages
        const anyMsg: any = msg as any;
        const ch = anyMsg.channel;
        if (!ch) return;
        const set = this.channelListeners.get(ch);
        if (!set || set.size === 0) return;
        set.forEach((listener) => {
          try {
            listener(msg);
          } catch {
            // ignore user listener errors
          }
        });
      },
    });

    // Apply current wanted subscriptions
    for (const ch of this.channelRefCount.keys()) {
      this.conn.subscribe(ch);
    }
  }

  private cancelIdleClose() {
    if (this.idleTimer) {
      clearTimeout(this.idleTimer);
      this.idleTimer = null;
    }
  }

  private scheduleIdleCloseIfNeeded() {
    const totalListeners = Array.from(this.channelListeners.values()).reduce((acc, s) => acc + s.size, 0);
    if (totalListeners > 0) return;
    if (!this.conn) return;

    this.cancelIdleClose();
    this.idleTimer = setTimeout(() => {
      this.idleTimer = null;
      const stillEmpty = Array.from(this.channelListeners.values()).every((s) => s.size === 0);
      if (!stillEmpty) return;
      this.log("idle close");
      try {
        this.conn?.close();
      } catch {
        // ignore
      }
      this.conn = null;
      this.connected = false;
      this.notifyStatus();
    }, this.idleCloseMs);
  }

  subscribe(channel: string, listener: ViraChannelListener): () => void {
    const ch = String(channel || "").trim();
    if (!ch) return () => void 0;

    this.cancelIdleClose();
    this.ensureConn();

    let set = this.channelListeners.get(ch);
    if (!set) {
      set = new Set<ViraChannelListener>();
      this.channelListeners.set(ch, set);
    }
    set.add(listener);

    const prev = this.channelRefCount.get(ch) || 0;
    this.channelRefCount.set(ch, prev + 1);
    if (prev === 0) {
      this.conn?.subscribe(ch);
      this.log("sub ref +", ch);
    }

    return () => {
      const curSet = this.channelListeners.get(ch);
      curSet?.delete(listener);
      if (curSet && curSet.size === 0) {
        this.channelListeners.delete(ch);
      }

      const cur = this.channelRefCount.get(ch) || 0;
      const next = Math.max(0, cur - 1);
      if (next === 0) {
        this.channelRefCount.delete(ch);
        this.conn?.unsubscribe(ch);
        this.log("sub ref -", ch);
      } else {
        this.channelRefCount.set(ch, next);
      }

      this.scheduleIdleCloseIfNeeded();
    };
  }

  onStatus(listener: ViraPoolStatusListener): () => void {
    this.statusListeners.add(listener);
    // emit current immediately
    try {
      listener(this.getStatus());
    } catch {
      // ignore
    }
    return () => {
      this.statusListeners.delete(listener);
    };
  }

  sendEvent(channel: string, name: string, payload: any, msgId?: string) {
    const ch = String(channel || "").trim();
    if (!ch) return;
    this.ensureConn();
    this.conn?.sendEvent(ch, name, payload, msgId);
  }

  sendUpdate(channel: string, payload: any, msgId?: string) {
    const ch = String(channel || "").trim();
    if (!ch) return;
    this.ensureConn();
    this.conn?.sendUpdate(ch, payload, msgId);
  }

  sendDiff(channel: string, patch: any, msgId?: string) {
    const ch = String(channel || "").trim();
    if (!ch) return;
    this.ensureConn();
    this.conn?.sendDiff(ch, patch, msgId);
  }

  getStatus(): ViraPoolStatus {
    return {
      connected: this.connected,
      error: this.error,
      session: this.session,
    };
  }
}

const pools = new Map<string, ViraConnectionPoolImpl>();

function poolKey(url: string, authToken?: string, handshakeData?: Record<string, any>) {
  // Include handshakeData in key to ensure separate pools for different contexts
  const dataKey = handshakeData ? JSON.stringify(handshakeData) : "";
  return `${url}::${authToken || ""}::${dataKey}`;
}

/** Global singleton pool per (url, authToken, handshakeData). */
export function getViraConnectionPool(options: ViraPoolOptions): ViraConnectionPool {
  const key = poolKey(options.url, options.authToken, options.handshakeData);
  const existing = pools.get(key);
  if (existing) {
    // If pool exists but handshakeData changed, we need a new pool
    // But since key includes handshakeData, different handshakeData = different key = new pool
    return existing;
  }
  const pool = new ViraConnectionPoolImpl(options);
  pools.set(key, pool);
  return pool;
}


