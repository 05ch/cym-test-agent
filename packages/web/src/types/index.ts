import type {
  EvalDataset,
  EvalCase,
  ExperimentRun,
  CompositeScoreBreakdown,
  ReproductionBundle,
  Session,
  SessionCheckpoint,
  Artifact,
  EvalAssertion,
  Capability
} from '@testagent/protocol';

export type {
  EvalDataset,
  EvalCase,
  ExperimentRun,
  CompositeScoreBreakdown,
  ReproductionBundle,
  Session,
  SessionCheckpoint,
  Artifact,
  EvalAssertion,
  Capability
};

export type DomainType = 'BUILD' | 'RUN' | 'EVALUATE' | 'GOVERN';

export interface SkillPackage {
  id: string;
  name: string;
  version: string;
  description: string;
  manifest: {
    name: string;
    version: string;
    description: string;
    dependencies: string[];
    requiredPermissions: string[];
  };
  skillMd: string;
  schemaJson: string;
  fixturesCount: number;
  evalsCount: number;
}

export interface ToolContract {
  name: string;
  version: string;
  description: string;
  requiredCapability: Capability;
  inputSchema: Record<string, any>;
  outputSchema: Record<string, any>;
  samplePayload: Record<string, any>;
}

export interface DAGNode {
  id: string;
  name: string;
  stage: 'input' | 'gap_analysis' | 'generation' | 'sandbox' | 'diagnostics' | 'patch' | 'test' | 'score';
  status: 'idle' | 'running' | 'completed' | 'failed' | 'waiting_approval';
  durationMs: number;
  tokensUsed?: number;
  reasoningSummary: string;
  toolDetails?: {
    name: string;
    args: Record<string, any>;
    requiredCapability?: string;
  };
}

export interface MutantDetail {
  id: string;
  file: string;
  line: number;
  originalCode: string;
  mutatedCode: string;
  mutationType: 'CONDITION_INVERSION' | 'BOUNDARY_MUTATION' | 'RETURN_VALUE' | 'ARITHMETIC';
  status: 'KILLED' | 'SURVIVED';
  killedByTest?: string;
}

export interface SandboxPoolStatus {
  id: string;
  type: 'local' | 'docker' | 'firecracker';
  status: 'healthy' | 'busy' | 'offline';
  activeInstances: number;
  maxInstances: number;
  avgLatencyMs: number;
  memoryUsageMb: number;
}

export interface ProviderConfig {
  id: string;
  provider: 'Anthropic' | 'OpenAI' | 'Gemini' | 'VLLM-Local';
  modelId: string;
  promptCachingStrategy: 'explicit_breakpoint' | 'automatic_prefix' | 'none';
  reasoningEffort: 'low' | 'medium' | 'high';
  compactionThresholdTokens: number;
  maxContextTokens: number;
  enabled: boolean;
}

export interface AuditLog {
  id: string;
  timestamp: number;
  userOrAgent: string;
  action: string;
  capability: string;
  status: 'ALLOWED' | 'DENIED' | 'PENDING_APPROVAL';
  details: string;
}
