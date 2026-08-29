import { ContextSegment } from './context.js';
import { AgentEvent } from './events.js';

export interface ModelCapabilities {
  nativeToolCalling: boolean;
  parallelToolExecution: boolean;
  supportsReasoningSummary: boolean;
  promptCachingStrategy: 'explicit_breakpoint' | 'automatic_prefix' | 'none';
  maxContextWindow: number;
  supportsContextCompaction: boolean;
}

export interface ModelProviderAdapter {
  id: string;
  getCapabilities(modelName: string): ModelCapabilities;
  generateStream(
    request: {
      segments: ContextSegment[];
      tools: any[];
      temperature?: number;
      reasoningEffort?: 'low' | 'medium' | 'high';
    }
  ): AsyncIterable<AgentEvent>;
}
