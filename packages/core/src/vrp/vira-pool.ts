import type { Message } from "./types";
import { createViraConnection, type ViraConnection, type ViraReconnectOptions } from "./vira-connection";

/** Должен совпадать с frontend/src/utils/wsConfig LAST_EVENT_ID_KEY */
const LAST_EVENT_ID_KEY = "vrp_last_event_id";

/** FNV-1a 32-bit — для pool key без хранения JWT в строке ключа/логах */
function fnv1aHash32(input: string): string {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h.toString(16);
}

/** Обновляет last_event_id для resume на reconnect (канал event_log и явное event_id). */
function tryPersistLastEventId(msg: any): void {
  if (typeof localStorage === "undefined") return;
  try {
    const ch = msg?.channel;
    const t = msg?.type;
    let id: string | null = null;

    if (typeof ch === "string" && (ch === "event_log:" || ch.startsWith("event_log"))) {
      if (t === "replay" && Array.isArray(msg.data) && msg.data.length > 0) {
        const last = msg.data[msg.data.length - 1];
        if (last && typeof last.id === "string") id = last.id;
      } else if (msg.data != null && typeof msg.data === "object" && !Array.isArray(msg.data)) {
        const row = msg.data as Record<string, unknown>;
        if (typeof row.id === "string") id = row.id;
        else if (typeof row.event_id === "string") id = row.event_id;
      }
    }

    if (typeof msg.event_id === "string") id = msg.event_id;

    if (id && id.length > 0) {
      localStorage.setItem(LAST_EVENT_ID_KEY, id);
    }
  } catch {
    /* ignore */
  }
}

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
  /** Close underlying socket after this idle time when there are no listeners. Default: 60000ms */
  idleCloseMs?: number;
  reconnect?: ViraReconnectOptions;
  /** Additional data to send in handshake (e.g., company_id, location_id) */
  handshakeData?: Record<string, any>;
}

export interface ViraConnectionPool {
  /** Subscribe to a channel and start receiving update/diff/event for it. Returns unsubscribe function. */
  subscribe(channel: string, listener: ViraChannelListener): () => void;
  /**
   * Passively listen to messages for a channel WITHOUT holding a subscription or
   * incrementing the refcount. The listener receives messages only when at least
   * one "active" subscriber (via subscribe()) exists for the channel.
   * Use this for monitoring/analytics that must not prevent the channel from
   * being unsubscribed when real consumers leave.
   */
  subscribePassive(channel: string, listener: ViraChannelListener): () => void;
  /** Listen to connection status changes (shared). Returns unsubscribe function. */
  onStatus(listener: ViraPoolStatusListener): () => void;
  /** Send messages */
  sendEvent(channel: string, name: string, payload: any, msgId?: string): void;
  sendUpdate(channel: string, payload: any, msgId?: string): void;
  sendDiff(channel: string, patch: any, msgId?: string): void;
  /** Current status */
  getStatus(): ViraPoolStatus;
  /** Close connection and stop reconnecting */
  close(): void;
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
  // Passive listeners — observe messages without holding a subscription
  private passiveListeners = new Map<string, Set<ViraChannelListener>>();

  private idleTimer: any = null;
  /** Защита от двойного ensureConn в одном тике / при реентерах */
  private connecting = false;

  constructor(opts: ViraPoolOptions) {
    this.url = opts.url;
    this.authToken = opts.authToken || "";
    this.debug = Boolean(opts.debug);
    this.idleCloseMs = opts.idleCloseMs ?? 60_000;
    this.reconnect = opts.reconnect;
    this.handshakeData = opts.handshakeData;
  }

  private log(...args: any[]) {
    if (!this.debug) return;
    // eslint-disable-next-line no-console
    console.log('[VRP_POOL]', ...args);
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

  /**
   * Не открываем «пустой» сокет: с JWT нужен tenant (company_id) в handshake.
   * Публичный VRP: явный handshakeData === {} (usePublicSubscriptionPlans и т.п.).
   * Без JWT не поднимаем WS без company_id — убирает handshake без данных в логах.
   */
  private canConnect(): boolean {
    const h = this.handshakeData;
    const token = this.authToken;
    const isPublicExplicit = h !== undefined && Object.keys(h).length === 0;
    if (isPublicExplicit) return true;

    const cid = h && (h as any).company_id;
    const hasCompany = typeof cid === "string" && cid.length > 0;
    if (token) {
      return hasCompany;
    }
    // Pre-auth flows (login/register/restore) legitimately use auth:* without tenant context.
    // Allow WS only when there is an explicit auth:* active subscription.
    if (this.channelRefCount.get("auth:")) return true;
    return hasCompany;
  }

  private ensureConn() {
    if (this.conn) return;
    if (this.connecting) return;
    if (!this.canConnect()) {
      this.log("skip connect until JWT + company_id in handshake (or public {})", {
        url: this.url,
        hasToken: Boolean(this.authToken),
      });
      return;
    }
    this.connecting = true;
    try {
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
          tryPersistLastEventId(msg as any);
          // route only channel-bearing messages
          const anyMsg: any = msg as any;
          const ch = anyMsg.channel;
          if (this.debug && ch) {
            this.log('routing message', { type: msg.type, channel: ch, hasListeners: this.channelListeners.has(ch), listenerCount: this.channelListeners.get(ch)?.size || 0 });
          }
          if (!ch) return;
          const set = this.channelListeners.get(ch);
          if (!set || set.size === 0) {
            if (this.debug) {
              this.log('no listeners for channel', ch);
            }
            // Passive: сообщения без активного refcount — только локальные observer'ы;
            // серверная подписка идёт через активные subscribe() на том же канале.
            const passiveSet = this.passiveListeners.get(ch);
            if (passiveSet && passiveSet.size > 0) {
              passiveSet.forEach((listener) => { try { listener(msg); } catch { /* ignore */ } });
            }
            return;
          }
          set.forEach((listener) => {
            try {
              listener(msg);
            } catch {
              // ignore user listener errors
            }
          });
          const passiveSet = this.passiveListeners.get(ch);
          if (passiveSet && passiveSet.size > 0) {
            passiveSet.forEach((listener) => { try { listener(msg); } catch { /* ignore */ } });
          }
        },
      });
    } finally {
      this.connecting = false;
    }

    // Apply current wanted subscriptions
    for (const ch of this.channelRefCount.keys()) {
      this.conn!.subscribe(ch);
    }
  }

  /** Не открывать сокет ради send*, если никто не подписан — иначе idleClose и дёргание */
  private hasActiveSubscriptions(): boolean {
    for (const n of this.channelRefCount.values()) {
      if (n > 0) return true;
    }
    return false;
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
      this.log("subscribing to channel", ch);
      this.conn?.subscribe(ch);
      this.log("sub ref +", ch);
    } else {
      this.log("reusing subscription", ch, "refcount:", prev + 1);
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

  subscribePassive(channel: string, listener: ViraChannelListener): () => void {
    const ch = String(channel || "").trim();
    if (!ch) return () => void 0;

    let set = this.passiveListeners.get(ch);
    if (!set) {
      set = new Set<ViraChannelListener>();
      this.passiveListeners.set(ch, set);
    }
    set.add(listener);

    return () => {
      const curSet = this.passiveListeners.get(ch);
      curSet?.delete(listener);
      if (curSet && curSet.size === 0) {
        this.passiveListeners.delete(ch);
      }
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
    if (!this.hasActiveSubscriptions()) {
      this.log("sendEvent skipped: no active subscribers on pool", { channel: ch, name });
      return;
    }
    this.ensureConn();
    this.conn?.sendEvent(ch, name, payload, msgId);
  }

  sendUpdate(channel: string, payload: any, msgId?: string) {
    const ch = String(channel || "").trim();
    if (!ch) return;
    if (!this.hasActiveSubscriptions()) {
      this.log("sendUpdate skipped: no active subscribers on pool", { channel: ch });
      return;
    }
    this.ensureConn();
    this.conn?.sendUpdate(ch, payload, msgId);
  }

  sendDiff(channel: string, patch: any, msgId?: string) {
    const ch = String(channel || "").trim();
    if (!ch) return;
    if (!this.hasActiveSubscriptions()) {
      this.log("sendDiff skipped: no active subscribers on pool", { channel: ch });
      return;
    }
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

  close(): void {
    this.cancelIdleClose();
    // Clear all listeners
    this.channelListeners.clear();
    this.channelRefCount.clear();
    this.statusListeners.clear();
    // Close connection
    if (this.conn) {
      try {
        this.conn.close();
      } catch {
        // ignore
      }
      this.conn = null;
    }
    this.connecting = false;
    this.connected = false;
    this.session = null;
    this.error = null;
  }
}

const pools = new Map<string, ViraConnectionPoolImpl>();

/**
 * Tenant scope only — used for pool identity (not last_event_id / resume tokens).
 * Otherwise resume metadata changes would fork multiple sockets per user.
 */
function tenantFingerprint(h?: Record<string, any>): string {
  if (!h || Object.keys(h).length === 0) return '';
  const c = h.company_id != null ? String(h.company_id) : '';
  const e = h.employee_id != null ? String(h.employee_id) : '';
  const l = h.location_id != null ? String(h.location_id) : '';
  if (!c && !e && !l) return '';
  return `${c}|${e}|${l}`;
}

function poolKey(url: string, authToken: string | undefined, fp: string) {
  const tok = authToken ? fnv1aHash32(authToken) : "";
  return `${url}::${tok}::${fp}`;
}

function getHandshakeDataFromStorage(): Record<string, any> | undefined {
  // Должно совпадать с актуальным JWT/сессией: приложение обязано обновлять `user` при setAuthData/refresh.
  // Иначе риск рассинхрона company_id (см. auth.ts + login flow).
  try {
    const userStr = (typeof localStorage !== 'undefined') ? localStorage.getItem('user') : null;
    if (!userStr) return undefined;
    const user = JSON.parse(userStr);
    if (!user || !user.company_id) return undefined;
    const base: Record<string, any> = {
      company_id: user.company_id,
      location_id: user.location_id,
      employee_id: user.employee_id,
    };
    const lastEventId =
      typeof localStorage !== 'undefined' ? localStorage.getItem(LAST_EVENT_ID_KEY) : null;
    if (lastEventId) {
      base.last_event_id = lastEventId;
    }
    return base;
  } catch {
    return undefined;
  }
}

/**
 * Merge explicit handshake with persisted user + last_event_id.
 * Explicit `{}` = public / no tenant (do not merge storage or events resume).
 */
function resolveHandshakeData(options: ViraPoolOptions): Record<string, any> | undefined {
  if (options.handshakeData !== undefined) {
    if (Object.keys(options.handshakeData).length === 0) {
      return options.handshakeData;
    }
    const fromStorage = getHandshakeDataFromStorage();
    return { ...(fromStorage || {}), ...options.handshakeData };
  }
  return getHandshakeDataFromStorage();
}

/** Global singleton pool per (url, authToken, tenant). handshake is merged from storage + options. */
export function getViraConnectionPool(options: ViraPoolOptions): ViraConnectionPool {
  const handshakeData = resolveHandshakeData(options);
  const key = poolKey(options.url, options.authToken, tenantFingerprint(handshakeData));

  const existing = pools.get(key);
  if (existing) {
    return existing;
  }
  const pool = new ViraConnectionPoolImpl({
    ...options,
    handshakeData,
  });
  pools.set(key, pool);
  return pool;
}

/**
 * Close all VRP connection pools
 */
export function closeAllViraPools(): void {
  for (const pool of pools.values()) {
    try {
      pool.close();
    } catch {
      // ignore errors
    }
  }
  pools.clear();
}


