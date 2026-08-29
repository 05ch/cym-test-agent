export interface ProtocolEnvelope<T = any> {
  protocolVersion: number; // 协商版本号 (e.g. 2)
  traceId: string;
  eventId: string;
  timestamp: number;
  sessionId?: string;
  runId?: string;
  type: string;
  payload: T;
}

export interface HandshakeRequest {
  clientType: 'tui' | 'web';
  clientVersion: string;
  supportedProtocols: number[];
}

export interface HandshakeResponse {
  acceptedProtocol: number;
  daemonVersion: string;
  capabilities: {
    sandboxes: string[];
    models: string[];
  };
}
