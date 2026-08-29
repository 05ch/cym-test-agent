export interface EvalDataset {
  id: string;
  name: string;
  version: string;
  description?: string;
  createdAt: number;
}

export interface EvalCase {
  id: string;
  datasetId: string;
  name: string;
  repoCommitSha: string;
  targetFiles: string[]; // JSON Array in DB
  taskPrompt: string;
  constraints: string[]; // JSON Array in DB
}

export interface ReproductionBundle {
  repoCommitSha: string;
  worktreeDiff: string;
  prompt: string;
  modelId: string;
  modelConfig: {
    temperature: number;
    reasoningEffort?: 'low' | 'medium' | 'high';
    maxTokens?: number;
  };
  seed: number;
  skillVersion: string;
  toolVersions: Record<string, string>;
  sandboxBackend: string;
  contextStrategy: string;
}

export interface CompositeScoreBreakdown {
  correctness: number;    // 0.40 weight: compile & tests pass
  mutationPower: number;  // 0.25 weight: mutation killed rate
  scopeDiscipline: number;// 0.15 weight: respect file boundaries
  efficiency: number;     // 0.10 weight: token cost & rounds
  stability: number;      // 0.10 weight: repeat pass rate
  compositeScore: number; // 0 - 100 or 0.0 - 1.0
}

export interface ExperimentRun {
  id: string;
  evalCaseId: string;
  experimentTag: string;
  modelId: string;
  skillVersion: string;
  contextStrategy: string;
  sandboxBackend: string;
  status: 'running' | 'passed' | 'failed';
  compositeScore?: number;
  scoreBreakdown?: CompositeScoreBreakdown;
  reproductionBundle: ReproductionBundle;
  createdAt: number;
  finishedAt?: number;
  durationMs?: number;
}

export interface Session {
  id: string;
  runId: string;
  parentSessionId?: string;
  forkedFromStep?: number;
  createdAt: number;
}

export interface SessionCheckpoint {
  id: string;
  sessionId: string;
  stepIndex: number;
  checkpointState: string; // JSON / Lightweight pointer
  createdAt: number;
}

export interface Artifact {
  id: string;
  runId: string;
  artifactType: 'patch' | 'stdout' | 'coverage' | 'snapshot';
  filePath: string;
  sha256Hash: string;
  sizeBytes: number;
  content?: string;
  createdAt: number;
}

export interface EvalAssertion {
  id: string;
  runId: string;
  layer: 'hard' | 'behavioral' | 'efficiency';
  ruleName: string;
  status: 'passed' | 'failed';
  score: number;
  diagnosticMessage?: string;
}
