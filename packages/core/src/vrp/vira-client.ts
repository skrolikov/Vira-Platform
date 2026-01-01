import type { Message } from './types';

export interface ViraClientOptions {
  url: string;
  channel: string;
  onMessage?: (msg: Message) => void;
  onConnect?: () => void;
  onDisconnect?: (event?: CloseEvent) => void;
  onError?: (error: Error) => void;
  onSessionChange?: (session: string | null) => void;
  session?: string | null;
  authToken?: string;
}

export interface ViraClient {
  sendEvent: (name: string, payload: any, msgId?: string) => void;
  sendUpdate: (payload: any, msgId?: string) => void;
  sendDiff: (patch: any, msgId?: string) => void;
  subscribe: (channel: string) => void;
  unsubscribe: (channel: string) => void;
  close: () => void;
  getVersion: () => number;
  getSession: () => string | null;
}

export function createViraClient(options: ViraClientOptions): ViraClient {
  const {
    url: urlOption,
    channel,
    onMessage,
    onConnect,
    onDisconnect,
    onError,
    onSessionChange,
    session: initialSession,
    authToken: authTokenOption,
  } = options;

  // Build WebSocket URL from HTTP URL if needed
  const url = urlOption.startsWith('ws') ? urlOption : urlOption.replace(/^http/, 'ws') + '/ws';

  let ws: WebSocket | null = null;
  let session: string | null = initialSession || null;
  let version = 0;
  let lastSentVersion = 0;
  const buffer: Array<{ send: () => boolean; ver: number }> = [];
  let aborted = false;
  let isConnecting = false;
  let timeout = 500;
  let pingIntervalId: any = null;
  let reconnectTimeoutId: any = null;

  const sendMessage = (
    msg: {
      type: 'update' | 'diff' | 'event';
      channel: string;
      data?: any;
      patch?: any;
      name?: string;
      msgId?: string;
    }
  ) => {
    const ver = ++version; // Increment locally - client is source of intent
    const fullMsg = { ...msg, versionNo: ver, ts: Date.now() };
    const send = () => {
      if (ws?.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(fullMsg));
        return true;
      }
      return false;
    };
    if (send()) {
      lastSentVersion = Math.max(lastSentVersion, ver);
    } else {
      buffer.push({ send, ver });
    }
  };

  const connect = () => {
    if (aborted || isConnecting) return;

    // Close existing connection if any
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

    isConnecting = true;
    const newWs = new WebSocket(url);
    ws = newWs;
    let pendingSub = false; // Track if we're waiting for ack before sub

    newWs.onopen = () => {
      isConnecting = false;
      newWs.send(
        JSON.stringify({
          type: 'handshake',
          client: 'vira-react',
          version: '0.1',
          authToken: authTokenOption || '',
          session: session || undefined,
          ts: Date.now(),
        })
      );
      // Don't send sub immediately - wait for ack to avoid race condition
      pendingSub = true;
      onConnect?.();
    };

    newWs.onmessage = (evt) => {
      try {
        const msg = JSON.parse(evt.data as string) as Message;

        switch (msg.type) {
          case 'ack':
            if (msg.session) {
              const oldSession = session;
              session = msg.session;
              if (oldSession !== session) {
                onSessionChange?.(session);
              }
              timeout = 500; // Reset timeout on successful connection
              // Now that we have ack, send subscription
              if (pendingSub && ws?.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({ type: 'sub', channels: [channel] }));
                pendingSub = false;
              }
              // Set up ping interval if provided
              if (msg.interval) {
                clearInterval(pingIntervalId);
                pingIntervalId = setInterval(() => {
                  if (ws?.readyState === WebSocket.OPEN) {
                    ws.send(JSON.stringify({ type: 'ping', ts: Date.now() }));
                  }
                }, msg.interval);
              }
            }
            break;

          case 'error':
            onError?.(new Error(msg.message || 'Unknown error'));
            if (msg.retry === false) {
              // Fatal error: close and prevent reconnect
              ws = null;
              newWs.close();
              aborted = true;
              return;
            }
            // retry=true -> keep connection alive and allow reconnection flow
            break;

          case 'update':
          case 'event':
            if (msg.channel === channel) {
              // Check for stale message BEFORE updating version
              if (msg.versionNo != null && msg.versionNo < version) return; // Stale message
              // Update version from server - CRITICAL: use Math.max to handle versionNo properly
              if (msg.versionNo != null) {
                version = Math.max(version, msg.versionNo);
              }
              onMessage?.(msg);
            }
            break;

          case 'diff':
            if (msg.channel === channel) {
              // Check for stale message BEFORE updating version
              if (msg.versionNo != null && msg.versionNo < version) return; // Stale message
              // Update version from server - CRITICAL: use Math.max to handle versionNo properly
              if (msg.versionNo != null) {
                version = Math.max(version, msg.versionNo);
              }
              onMessage?.(msg);
            }
            break;

          case 'ping':
            ws?.send(JSON.stringify({ type: 'pong', ts: Date.now() }));
            break;

          case 'pong':
            // Server acknowledged our pong, connection is healthy
            break;

          case 'sub_ack':
            // Subscription acknowledged - now safe to flush buffered messages
            if (ws?.readyState === WebSocket.OPEN) {
              const buffered = buffer.splice(0);
              buffered.forEach(({ send, ver }) => {
                if (ver <= lastSentVersion) return;
                const sent = send();
                if (sent) {
                  lastSentVersion = Math.max(lastSentVersion, ver);
                }
              });
            }
            break;

          case 'unsub_ack':
            // Unsubscription acknowledged
            break;
        }
      } catch {
        // ignore malformed
      }
    };

    newWs.onclose = (event) => {
      ws = null;
      isConnecting = false;
      clearInterval(pingIntervalId);
      if (reconnectTimeoutId) {
        clearTimeout(reconnectTimeoutId);
        reconnectTimeoutId = null;
      }

      if (aborted) {
        onDisconnect?.(event);
        return;
      }

      // Notify about disconnect
      onDisconnect?.(event);

      // Codes 1000 (normal), 1001 (going away), 1005 (no status), 1006 (abnormal) are expected during reconnects
      const normalCodes = [1000, 1001, 1005, 1006];
      if (!normalCodes.includes(event.code)) {
        // Only log unexpected closes (already handled by onDisconnect)
      }

      reconnectTimeoutId = setTimeout(() => {
        if (!aborted) {
          connect();
        }
      }, timeout);
      timeout = Math.min(timeout * 2, 5000);
    };

    newWs.onerror = (error) => {
      isConnecting = false;
      // Errors during connection setup are normal and will trigger onclose
      // Only log if connection was already established
      if (newWs.readyState === WebSocket.OPEN) {
        onError?.(new Error('WebSocket error'));
      }
      // Don't close immediately - let onclose handle reconnection
    };
  };

  // Start connection
  connect();

  return {
    sendEvent: (name: string, payload: any, msgId?: string) => {
      sendMessage({ type: 'event', name, channel, data: payload, msgId });
    },
    sendUpdate: (payload: any, msgId?: string) => {
      sendMessage({ type: 'update', channel, data: payload, msgId });
    },
    sendDiff: (patch: any, msgId?: string) => {
      sendMessage({ type: 'diff', channel, patch, msgId });
    },
    subscribe: (ch: string) => {
      if (ws?.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'sub', channels: [ch] }));
      }
    },
    unsubscribe: (ch: string) => {
      if (ws?.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'unsub', channels: [ch] }));
      }
    },
    close: () => {
      aborted = true;
      clearInterval(pingIntervalId);
      if (reconnectTimeoutId) {
        clearTimeout(reconnectTimeoutId);
      }
      if (ws) {
        const oldWs = ws;
        ws = null;
        try {
          oldWs.close(1000, 'Client closing');
        } catch {
          // ignore
        }
      }
    },
    getVersion: () => version,
    getSession: () => session,
  };
}

