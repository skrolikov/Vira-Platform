import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import {
  createViraClient,
  deepMerge,
  getViraConnectionPool,
  type ViraClient,
  type Message,
  type ViraConnectionPool,
  type ViraPoolStatus,
} from '@vira-ui/core';

export interface UseViraStateOptions<T = any> {
  /** Initial value for the state */
  initial?: T | null;
  /** Enable msgId support for idempotency */
  enableMsgId?: boolean;
  /** Callback when connection opens */
  onOpen?: () => void;
  /** Callback when connection closes */
  onClose?: (event: CloseEvent) => void;
  /** Callback when connection error occurs */
  onError?: (error: Error) => void;
  /** Use deep merge for diff patches (default: true) */
  deepMerge?: boolean;
  /** API URL (defaults to VITE_API_URL env or 'http://localhost:8080') */
  apiUrl?: string;
  /** Auth token for handshake */
  authToken?: string;
  /** Additional data to send in handshake (e.g., company_id, location_id) */
  handshakeData?: Record<string, any>;
  /** Disable connection pooling (fallback to 1 WS per channel). Default: false */
  disablePooling?: boolean;
  /** Enable debug logs for VRP (console.debug). Default: env VITE_VRP_DEBUG === 'true' */
  debug?: boolean;
}

/**
 * Unified hook for Vira Reactive Protocol state management.
 * Replaces both useViraState and useViraStream.
 *
 * @example
 * ```tsx
 * // Basic usage
 * const { data, sendUpdate } = useViraState<MyType>('my-channel');
 *
 * // With options
 * const { data, sendUpdate, sendDiff } = useViraState<User>('user:123', {
 *   initial: { name: 'Guest' },
 *   enableMsgId: true,
 *   onOpen: () => console.log('Connected'),
 *   deepMerge: true
 * });
 * ```
 */
export function useViraState<T = any, C extends string = string>(
  channel: C,
  initialOrOptions?: T | null | UseViraStateOptions<T>
): {
  /** Current state data */
  data: T | null;
  /** Send an event to the server */
  sendEvent: (name: string, payload: any, msgId?: string) => void;
  /** Send a full update (replaces state) */
  sendUpdate: (payload: T, msgId?: string) => void;
  /** Send a partial diff (merges with current state) */
  sendDiff: (patch: Partial<T>, msgId?: string) => void;
  /** Connection status */
  isConnected: boolean;
  /** Connection error, if any */
  error: Error | null;
} {
  // Parse options (backward compatibility: second param can be initial value or options)
  const options: UseViraStateOptions<T> = useMemo(() => {
    if (initialOrOptions === null || initialOrOptions === undefined) {
      return {};
    }
    // If it's an object with known option keys, treat as options
    if (
      typeof initialOrOptions === 'object' &&
      !Array.isArray(initialOrOptions) &&
      ('enableMsgId' in initialOrOptions ||
        'onOpen' in initialOrOptions ||
        'onClose' in initialOrOptions ||
        'onError' in initialOrOptions ||
        'deepMerge' in initialOrOptions ||
        'initial' in initialOrOptions ||
        'apiUrl' in initialOrOptions ||
        'authToken' in initialOrOptions ||
        'handshakeData' in initialOrOptions ||
        'disablePooling' in initialOrOptions ||
        'debug' in initialOrOptions)
    ) {
      return initialOrOptions as UseViraStateOptions<T>;
    }
    // Otherwise, treat as initial value (backward compatibility)
    return { initial: initialOrOptions as T | null };
  }, [initialOrOptions]);

  const {
    initial = null,
    enableMsgId = false,
    onOpen,
    onClose,
    onError,
    deepMerge: useDeepMerge = true,
    apiUrl: apiUrlOption,
    authToken: authTokenOption,
    handshakeData: handshakeDataOption,
    disablePooling = false,
    debug: debugOption,
  } = options;

  const [data, setData] = useState<T | null>(initial);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  type Transport = {
    sendEvent: (name: string, payload: any, msgId?: string) => void;
    sendUpdate: (payload: T, msgId?: string) => void;
    sendDiff: (patch: Partial<T>, msgId?: string) => void;
  };

  const transportRef = useRef<Transport | null>(null);
  const clientRef = useRef<ViraClient | null>(null); // legacy non-pooled mode only
  const sessionRef = useRef<string | null>(null);
  const msgIdCounterRef = useRef(0);
  const wasConnectedRef = useRef(false);
  const lastErrorRef = useRef<Error | null>(null);

  // Use provided apiUrl or fallback to env or default
  // Note: import.meta is only available in ESM, so we check safely
  const apiUrl = useMemo(() => {
    if (apiUrlOption) return apiUrlOption;
    // Try to get from env if available (Vite/bundler environment)
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const env = (globalThis as any).import?.meta?.env || (globalThis as any).process?.env;
      if (env?.VITE_API_URL) return env.VITE_API_URL;
    } catch {
      // Ignore if import.meta is not available
    }
    return 'http://localhost:8080';
  }, [apiUrlOption]);

  // Get authToken from options or try to get from env
  const authToken = useMemo(() => {
    if (authTokenOption !== undefined) return authTokenOption;
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const env = (globalThis as any).import?.meta?.env || (globalThis as any).process?.env;
      return env?.VITE_AUTH_TOKEN || '';
    } catch {
      return '';
    }
  }, [authTokenOption]);

  const debug = useMemo(() => {
    if (debugOption !== undefined) return Boolean(debugOption);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const env = (globalThis as any).import?.meta?.env || (globalThis as any).process?.env;
      return String(env?.VITE_VRP_DEBUG || '').toLowerCase() === 'true';
    } catch {
      return false;
    }
  }, [debugOption]);

  // Create a stable key for handshakeData to avoid unnecessary pool recreation
  // Use values from handshakeData instead of the object reference
  const handshakeDataKey = useMemo(() => {
    if (!handshakeDataOption) return '';
    try {
      return JSON.stringify(handshakeDataOption);
    } catch {
      return '';
    }
  }, [
    handshakeDataOption?.company_id,
    handshakeDataOption?.location_id,
    handshakeDataOption?.employee_id,
  ]);
  
  const pool: ViraConnectionPool | null = useMemo(() => {
    if (disablePooling) return null;
    return getViraConnectionPool({ url: apiUrl, authToken, handshakeData: handshakeDataOption, debug });
  }, [disablePooling, apiUrl, authToken, handshakeDataKey, debug]);




  useEffect(() => {
    if (!channel) return;

    const handleMessage = (msg: Message) => {
      switch (msg.type) {
        case 'update':
        case 'event':
          if (msg.channel === channel) {
            setData((prev) => {
              if (!prev) {
                return msg.data as T;
              }

              if (typeof prev === 'object' && typeof msg.data === 'object') {
                let mergedData;
                if (useDeepMerge) {
                  mergedData = deepMerge(prev as Record<string, any>, msg.data as Record<string, any>) as T;
                } else {
                  mergedData = { ...(prev as any), ...(msg.data as any) };
                }
                return mergedData;
              }

              return msg.data as T;
            });
          }
          break;

        case 'diff':
          if (msg.channel === channel && msg.patch) {
            setData((prev) => {
              if (!prev) {
                return msg.patch as T;
              }

              if (typeof prev === 'object' && typeof msg.patch === 'object') {
                let mergedData;
                if (useDeepMerge) {
                  mergedData = deepMerge(prev as Record<string, any>, msg.patch as Record<string, any>) as T;
                } else {
                  mergedData = { ...(prev as any), ...(msg.patch as any) };
                }
                return mergedData;
              }

              return prev;
            });
          }
          break;
      }
    };

    // --- Pooled mode (default) ---
    if (pool) {
      // Subscribe to messages for this channel
      const unsubChannel = pool.subscribe(channel, handleMessage);

      // Track shared connection status
      const unsubStatus = pool.onStatus((status: ViraPoolStatus) => {
        setError(status.error);
        setIsConnected(status.connected);

        // Fire callbacks only on transitions
        if (status.connected && !wasConnectedRef.current) {
          wasConnectedRef.current = true;
          onOpen?.();
        }
        if (!status.connected && wasConnectedRef.current) {
          wasConnectedRef.current = false;
          // We don't get a real CloseEvent from pooled status, so we pass a lightweight synthetic object
          const synthetic = (typeof CloseEvent !== 'undefined'
            ? new CloseEvent('close', { code: 1001, reason: 'pooled disconnect' })
            : ({ code: 1001, reason: 'pooled disconnect' } as any)) as any;
          onClose?.(synthetic);
        }
        if (status.error) {
          if (lastErrorRef.current !== status.error) {
            lastErrorRef.current = status.error;
            onError?.(status.error);
          }
        } else {
          lastErrorRef.current = null;
        }
      });

      // Wire transport for send* APIs
      transportRef.current = {
        sendEvent: (name, payload, msgId) => pool.sendEvent(channel, name, payload, msgId),
        sendUpdate: (payload, msgId) => pool.sendUpdate(channel, payload, msgId),
        sendDiff: (patch, msgId) => pool.sendDiff(channel, patch, msgId),
      };

      return () => {
        unsubStatus();
        unsubChannel();
        transportRef.current = null;
        setIsConnected(false);
        setError(null);
      };
    }

    // --- Legacy mode (1 WS per channel) ---
    const handleConnect = () => {
      setIsConnected(true);
      setError(null);
      if (!wasConnectedRef.current) {
        wasConnectedRef.current = true;
      }
      onOpen?.();
    };

    const handleDisconnect = (event?: CloseEvent) => {
      setIsConnected(false);
      wasConnectedRef.current = false;
      onClose?.(event!);
    };

    const handleError = (err: Error) => {
      setError(err);
      onError?.(err);
    };

    const client = createViraClient({
      url: apiUrl,
      channel,
      onMessage: handleMessage,
      onConnect: handleConnect,
      onDisconnect: handleDisconnect,
      onError: handleError,
      session: sessionRef.current,
      authToken,
      onSessionChange: (newSession: string | null) => {
        sessionRef.current = newSession;
      },
    });

    clientRef.current = client;
    transportRef.current = {
      sendEvent: (name, payload, msgId) => client.sendEvent(name, payload, msgId),
      sendUpdate: (payload, msgId) => client.sendUpdate(payload, msgId),
      sendDiff: (patch, msgId) => client.sendDiff(patch, msgId),
    };

    return () => {
      client.close();
      clientRef.current = null;
      transportRef.current = null;
      setIsConnected(false);
      setError(null);
    };
  }, [channel, apiUrl, authToken, onOpen, onClose, onError, useDeepMerge, pool]);

  // Generate msgId if enabled
  const generateMsgId = useCallback((): string | undefined => {
    if (!enableMsgId) return undefined;
    msgIdCounterRef.current++;
    return `${channel}:${Date.now()}:${msgIdCounterRef.current}`;
  }, [channel, enableMsgId]);

  const sendEvent = useCallback(
    (name: string, payload: any, msgId?: string) => {
      transportRef.current?.sendEvent(name, payload, msgId ?? generateMsgId());
    },
    [generateMsgId]
  );

  const sendUpdate = useCallback(
    (payload: T, msgId?: string) => {
      transportRef.current?.sendUpdate(payload, msgId ?? generateMsgId());
    },
    [generateMsgId]
  );

  const sendDiff = useCallback(
    (patch: Partial<T>, msgId?: string) => {
      transportRef.current?.sendDiff(patch, msgId ?? generateMsgId());
    },
    [generateMsgId]
  );

  return {
    data,
    sendEvent,
    sendUpdate,
    sendDiff,
    isConnected,
    error,
  };
}

/**
 * Legacy hook - use useViraState instead.
 * @deprecated Use useViraState with options instead
 */
export function useViraStream<T = any, C extends string = string>(
  channel: C,
  options?: UseViraStateOptions<T>
) {
  return useViraState<T, C>(channel, { ...options, initial: null });
}
