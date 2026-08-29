export type SegmentLifecycle = 'durable' | 'working' | 'ephemeral';

export type SegmentType =
  | 'system'
  | 'skills'
  | 'repo_map'
  | 'chat_history'
  | 'tool_results'
  | 'scratchpad';

export interface ContextSegment {
  id: string;
  type: SegmentType;
  content: string;
  tokenCount: number;
  lifecycle: SegmentLifecycle;
  cacheable: boolean;
  priority: number; // 0 (最高优先级，不可被裁剪) - 100 (最先被丢弃)
}

export interface CacheMetrics {
  inputTokens: number;
  cacheReadTokens?: number;
  cacheWriteTokens?: number;
  uncachedTokens: number;
  estimatedSavedCostUsd?: number;
}
