export interface ExecRequest {
  cmd: string;
  args: string[];
  cwd?: string;
  env?: Record<string, string>;
  timeoutMs?: number;
  maxBufferBytes?: number;
}

export interface ExecResult {
  exitCode: number;
  stdout: string;
  stderr: string;
  durationMs: number;
  timedOut: boolean;
}

export interface SandboxBackend {
  id: string;
  type: 'local' | 'docker' | 'firecracker';
  initialize(repoSnapshotPath: string): Promise<void>;
  exec(request: ExecRequest): Promise<ExecResult>;
  readFile(relativePath: string): Promise<Uint8Array>;
  writeFile(relativePath: string, content: Uint8Array): Promise<void>;
  applyPatch(patchContent: string): Promise<{ success: boolean; error?: string }>;
  createCheckpoint(): Promise<string>;
  restoreCheckpoint(checkpointId: string): Promise<void>;
  destroy(): Promise<void>;
}
