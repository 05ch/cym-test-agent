import { CacheMetrics } from './context.js';

export interface ContextSegmentMetric {
  id: string;
  type: string;
  tokenCount: number;
  cacheable: boolean;
  priority: number;
}

export type AgentEvent =
  | { type: 'RUN_STARTED'; payload: { runId: string; evalCaseId: string; config: any } }
  | { type: 'CONTEXT_BUILT'; payload: { segments: ContextSegmentMetric[]; totalTokens: number; cacheStats: CacheMetrics } }
  | { type: 'CONTEXT_COMPACTED'; payload: { beforeTokens: number; afterTokens: number; prunedSegmentTypes: string[] } }
  | { type: 'MODEL_REQUEST_STARTED'; payload: { stepIndex: number; model: string; promptTokens: number } }
  | { type: 'REASONING_SUMMARY_CHUNK'; payload: { textDelta: string } }
  | { type: 'TOOL_REQUESTED'; payload: { toolName: string; args: any; requiredCapabilities: string[] } }
  | { type: 'TOOL_STARTED'; payload: { toolName: string; executionId: string } }
  | { type: 'TOOL_FINISHED'; payload: { toolName: string; executionId: string; durationMs: number; status: 'ok' | 'error'; stdoutRef?: string; result?: any } }
  | { type: 'ARTIFACT_CREATED'; payload: { artifactId: string; type: string; sha256: string; path: string; sizeBytes?: number } }
  | { type: 'ASSERTION_EVALUATED'; payload: { layer: 'hard' | 'behavioral' | 'efficiency'; rule: string; passed: boolean; score: number; details?: string } }
  | { type: 'RUN_FINISHED'; payload: { runId: string; finalScore: number; status: 'passed' | 'failed'; durationMs: number; error?: string } };

export type AgentEventType = AgentEvent['type'];
