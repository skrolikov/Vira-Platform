// Vira Reactive Protocol message types
export type Message =
  | { type: 'handshake'; client: string; version: string; authToken?: string; session?: string; ts: number }
  | { type: 'ack'; session: string; interval?: number; version?: string; ts?: number }
  | { type: 'sub'; channels: string[] }
  | { type: 'unsub'; channels: string[] }
  | { type: 'sub_ack'; channels: string[] }
  | { type: 'unsub_ack'; channels: string[] }
  | { type: 'update'; channel: string; data: any; versionNo: number; ts: number; msgId?: string }
  | { type: 'diff'; channel: string; patch: any; versionNo: number; ts: number; msgId?: string }
  | { type: 'event'; name: string; channel: string; data: any; versionNo: number; ts: number; msgId?: string }
  | { type: 'ping'; ts: number }
  | { type: 'pong'; ts: number }
  | { type: 'error'; code: string; message: string; retry?: boolean };

