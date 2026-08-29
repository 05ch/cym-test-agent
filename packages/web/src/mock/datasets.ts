import {
  EvalDataset,
  EvalCase,
  ExperimentRun,
  CompositeScoreBreakdown,
  calculateCompositeScore
} from '@testagent/protocol';
import {
  SkillPackage,
  ToolContract,
  DAGNode,
  MutantDetail,
  SandboxPoolStatus,
  ProviderConfig,
  AuditLog
} from '../types/index.js';

export const MOCK_DATASETS: EvalDataset[] = [
  {
    id: 'ds_payment_core',
    name: 'payment-core-eval',
    version: '1.2.0',
    description: '核心支付网关并发幂等、重试与边界防护评测集',
    createdAt: Date.now() - 86400000 * 3
  },
  {
    id: 'ds_auth_service',
    name: 'auth-token-refresh-eval',
    version: '2.0.0',
    description: 'JWT 双 Token 刷新并发竞态与过期撤回用例集',
    createdAt: Date.now() - 86400000 * 7
  },
  {
    id: 'ds_order_saga',
    name: 'order-saga-orchestrator-eval',
    version: '1.0.4',
    description: '分布式订单 Saga 事务回滚补偿与超时熔断评测集',
    createdAt: Date.now() - 86400000 * 12
  }
];

export const MOCK_EVAL_CASES: EvalCase[] = [
  {
    id: 'case_payment_01',
    datasetId: 'ds_payment_core',
    name: 'PaymentProcessor 并发幂等与网关重试补充测试',
    repoCommitSha: '98f12a4c8e7b1a2d',
    targetFiles: ['src/payment/PaymentProcessor.ts', 'src/security/RateLimiter.ts'],
    taskPrompt: '为 PaymentProcessor 补充单测，重点覆盖高并发下的 Idempotency Key 冲突隔离、负数金额防护、以及网关 ETIMEDOUT 超时指数退避重试。',
    constraints: ['禁止修改 src/ 目录下的任何生产代码', '仅允许在 tests/payment/ 下新增或修改测试文件', '测试框架必须使用 Vitest']
  },
  {
    id: 'case_auth_01',
    datasetId: 'ds_auth_service',
    name: 'RefreshTokenHandler 双并发刷新竞态防护测试',
    repoCommitSha: 'a41f90bc128e453d',
    targetFiles: ['src/auth/TokenManager.ts', 'src/auth/RedisSessionStore.ts'],
    taskPrompt: '补充并发调用 /auth/refresh 时单次消耗 RefreshToken 的互斥锁测试及黑名单命中测试。',
    constraints: ['禁止修改生产代码', '测试通过率 100%', '变异测试击杀率需达到 80% 以上']
  },
  {
    id: 'case_order_01',
    datasetId: 'ds_order_saga',
    name: 'SagaCoordinator 补偿事务部分失败熔断测试',
    repoCommitSha: '7c823ea99d0124f1',
    targetFiles: ['src/saga/SagaCoordinator.ts'],
    taskPrompt: '覆盖在库存释放失败时触发的人工介入补偿逻辑及超时重试阈值限制。',
    constraints: ['禁止修改生产代码', '严禁外部网络请求']
  }
];

export const MOCK_SKILL_PACKAGES: SkillPackage[] = [
  {
    id: 'skill_vitest_agent',
    name: 'vitest-unit-generator',
    version: '2.1.0',
    description: '面向 TypeScript/Vitest 的高质量单测生成与边界挖掘能力包',
    manifest: {
      name: 'vitest-unit-generator',
      version: '2.1.0',
      description: 'Generates robust Vitest unit tests with automatic mocking and edge case coverage.',
      dependencies: ['ast_analyzer@1.0', 'sandbox_exec@2.0'],
      requiredPermissions: ['fs.read:repo', 'fs.write:tests/**', 'process.spawn:test-runner']
    },
    skillMd: `# Vitest Unit Generator Skill
You are an expert TypeScript testing agent specializing in Vitest.
Follow strict AAA pattern (Arrange, Act, Assert).
Never modify files outside tests/**.
Ensure full isolation with vi.fn() and proper teardown.`,
    schemaJson: `{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "properties": {
    "targetFile": { "type": "string" },
    "focusFunctions": { "type": "array", "items": { "type": "string" } },
    "edgeCases": { "type": "array", "items": { "type": "string" } }
  },
  "required": ["targetFile"]
}`,
    fixturesCount: 8,
    evalsCount: 14
  },
  {
    id: 'skill_mutation_pro',
    name: 'mutation-killer-pro',
    version: '1.4.2',
    description: '自动分析业务代码 AST 弱点，生成可精准击杀变异的高置信断言测试',
    manifest: {
      name: 'mutation-killer-pro',
      version: '1.4.2',
      description: 'Specialized in generating assertive tests that kill tricky code mutants.',
      dependencies: ['mutation_injector@1.2'],
      requiredPermissions: ['fs.read:repo', 'fs.write:tests/**']
    },
    skillMd: `# Mutation Killer Pro Skill
Focus intensely on boundary conditions: null/undefined checks, conditional flips (< vs <=), off-by-one errors.`,
    schemaJson: `{"type": "object", "properties": {"targetMutants": {"type": "array"}}}`,
    fixturesCount: 5,
    evalsCount: 9
  }
];

export const MOCK_TOOL_CONTRACTS: ToolContract[] = [
  {
    name: 'ast_analyzer',
    version: '1.2.0',
    description: '解析 TypeScript/Go 源码 AST，提取导出函数、分支复杂度及未覆盖代码块',
    requiredCapability: 'fs.read:repo',
    inputSchema: {
      type: 'object',
      properties: {
        targetFilePath: { type: 'string', description: '待分析的源文件相对路径' },
        depth: { type: 'number', default: 2 }
      },
      required: ['targetFilePath']
    },
    outputSchema: {
      type: 'object',
      properties: {
        functions: { type: 'array' },
        uncoveredBranches: { type: 'array' },
        complexityScore: { type: 'number' }
      }
    },
    samplePayload: { targetFilePath: 'src/payment/PaymentProcessor.ts', depth: 2 }
  },
  {
    name: 'sandbox_exec',
    version: '2.0.0',
    description: '在受限沙箱中安全拉起测试执行器进程，捕获退出码与实时 Stdout 流',
    requiredCapability: 'process.spawn:test-runner',
    inputSchema: {
      type: 'object',
      properties: {
        cmd: { type: 'string' },
        args: { type: 'array', items: { type: 'string' } },
        timeoutMs: { type: 'number', default: 30000 }
      },
      required: ['cmd', 'args']
    },
    outputSchema: {
      type: 'object',
      properties: {
        exitCode: { type: 'number' },
        stdout: { type: 'string' },
        stderr: { type: 'string' },
        durationMs: { type: 'number' }
      }
    },
    samplePayload: { cmd: 'vitest', args: ['run', 'tests/payment/PaymentProcessor.test.ts'], timeoutMs: 15000 }
  },
  {
    name: 'git_patch_apply',
    version: '1.0.0',
    description: '向指定沙箱 Worktree 原子性应用 Git Unified Diff 补丁',
    requiredCapability: 'fs.write:tests/**',
    inputSchema: {
      type: 'object',
      properties: {
        patchContent: { type: 'string' },
        allowOutOfScope: { type: 'boolean', default: false }
      },
      required: ['patchContent']
    },
    outputSchema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        modifiedFiles: { type: 'array', items: { type: 'string' } },
        error: { type: 'string' }
      }
    },
    samplePayload: { patchContent: '--- a/tests/payment/...\\n+++ b/tests/payment/...' }
  }
];

export const MOCK_DAG_NODES: DAGNode[] = [
  {
    id: 'node_1',
    name: '1. 评测用例定义 (Eval Case Definition)',
    stage: 'input',
    status: 'completed',
    durationMs: 120,
    tokensUsed: 420,
    reasoningSummary: '加载 payment-core-eval@1.2 规范与约束条件 (禁止修改 src/ 目录)'
  },
  {
    id: 'node_2',
    name: '2. AST 解析与差距分析 (Gap Analysis)',
    stage: 'gap_analysis',
    status: 'completed',
    durationMs: 380,
    tokensUsed: 650,
    reasoningSummary: '提取 PaymentProcessor.ts 关键分支：未覆盖幂等键碰撞与网络超时重试机制',
    toolDetails: {
      name: 'ast_analyzer',
      args: { targetFilePath: 'src/payment/PaymentProcessor.ts' }
    }
  },
  {
    id: 'node_3',
    name: '3. 候选测试用例生成 (Candidate Generation)',
    stage: 'generation',
    status: 'completed',
    durationMs: 1120,
    tokensUsed: 1480,
    reasoningSummary: '构建 3 组 Vitest 单元测试用例，覆盖并发幂等校验、负数金额边界防护与指数退避重试'
  },
  {
    id: 'node_4',
    name: '4. 沙箱环境补丁应用 (Patch Sandbox)',
    stage: 'patch',
    status: 'completed',
    durationMs: 85,
    tokensUsed: 110,
    reasoningSummary: '原子写入 tests/payment/PaymentProcessor.test.ts (+48 行)',
    toolDetails: {
      name: 'git_patch_apply',
      args: { patchContent: 'diff --git a/tests/...' },
      requiredCapability: 'fs.write:tests/**'
    }
  },
  {
    id: 'node_5',
    name: '5. 沙箱测试执行 (Sandbox Test Runner)',
    stage: 'test',
    status: 'completed',
    durationMs: 624,
    tokensUsed: 310,
    reasoningSummary: 'Vitest 执行完成：3/3 测试通过，耗时 312ms，进程退出码 0',
    toolDetails: {
      name: 'sandbox_exec',
      args: { cmd: 'vitest', args: ['run', 'tests/payment/PaymentProcessor.test.ts'] },
      requiredCapability: 'process.spawn:test-runner'
    }
  },
  {
    id: 'node_6',
    name: '6. 变异击杀与三层断言质量评测 (Mutation & Eval)',
    stage: 'score',
    status: 'completed',
    durationMs: 1450,
    tokensUsed: 860,
    reasoningSummary: '注入 4 处 AST 变异点，击杀 3 处变异 (75.0% Kill Rate)，硬断言与范围约束满分通过'
  }
];

export const MOCK_MUTANTS: MutantDetail[] = [
  {
    id: 'mut_1',
    file: 'src/payment/PaymentProcessor.ts',
    line: 42,
    originalCode: 'if (amount <= 0) throw new Error("INVALID_AMOUNT");',
    mutatedCode: 'if (false) throw new Error("INVALID_AMOUNT");',
    mutationType: 'CONDITION_INVERSION',
    status: 'KILLED',
    killedByTest: 'should safely reject negative or zero payment amounts (Boundary Check)'
  },
  {
    id: 'mut_2',
    file: 'src/payment/PaymentProcessor.ts',
    line: 78,
    originalCode: 'if (this.idempotencyStore.has(order.idempotencyKey))',
    mutatedCode: 'if (!this.idempotencyStore.has(order.idempotencyKey))',
    mutationType: 'CONDITION_INVERSION',
    status: 'KILLED',
    killedByTest: 'should successfully process idempotency key on concurrent payments'
  },
  {
    id: 'mut_3',
    file: 'src/payment/PaymentProcessor.ts',
    line: 115,
    originalCode: 'while (retryCount < 3)',
    mutatedCode: 'while (retryCount < 0)',
    mutationType: 'BOUNDARY_MUTATION',
    status: 'KILLED',
    killedByTest: 'should handle gateway network timeout and retry with exponential backoff'
  },
  {
    id: 'mut_4',
    file: 'src/security/RateLimiter.ts',
    line: 24,
    originalCode: 'this.tokens -= cost;',
    mutatedCode: 'this.tokens += cost;',
    mutationType: 'ARITHMETIC',
    status: 'SURVIVED'
  }
];

export const MOCK_RUN_MATRIX: ExperimentRun[] = [
  {
    id: 'run_claude_v2',
    evalCaseId: 'case_payment_01',
    experimentTag: 'Claude-3.7-Sonnet (Prompt v2.1 + Vitest-Pkg)',
    modelId: 'claude-3-7-sonnet',
    skillVersion: 'vitest-unit-generator@2.1.0',
    contextStrategy: 'Durable-Cache + Sliding-Window',
    sandboxBackend: 'Local-Process-Sandbox',
    status: 'passed',
    compositeScore: 90.75,
    scoreBreakdown: calculateCompositeScore({
      correctness: 100,
      mutationPower: 75,
      scopeDiscipline: 100,
      efficiency: 88,
      stability: 95
    }),
    reproductionBundle: {
      repoCommitSha: '98f12a4c8e7b1a2d',
      worktreeDiff: 'tests/payment/PaymentProcessor.test.ts (+48 lines)',
      prompt: 'Prompt Template v2.1 (Chain-of-Thought + AAA Template)',
      modelId: 'claude-3-7-sonnet',
      modelConfig: { temperature: 0.2, reasoningEffort: 'high' },
      seed: 42,
      skillVersion: 'vitest-unit-generator@2.1.0',
      toolVersions: { ast_analyzer: '1.2.0', sandbox_exec: '2.0.0' },
      sandboxBackend: 'local',
      contextStrategy: 'durable-working'
    },
    createdAt: Date.now() - 3600000 * 2,
    finishedAt: Date.now() - 3600000 * 2 + 4200,
    durationMs: 4200
  },
  {
    id: 'run_gpt4o_v2',
    evalCaseId: 'case_payment_01',
    experimentTag: 'GPT-4o (Prompt v2.1 + Vitest-Pkg)',
    modelId: 'gpt-4o',
    skillVersion: 'vitest-unit-generator@2.1.0',
    contextStrategy: 'Full-History',
    sandboxBackend: 'Local-Process-Sandbox',
    status: 'passed',
    compositeScore: 84.50,
    scoreBreakdown: calculateCompositeScore({
      correctness: 100,
      mutationPower: 50,
      scopeDiscipline: 100,
      efficiency: 85,
      stability: 90
    }),
    reproductionBundle: {
      repoCommitSha: '98f12a4c8e7b1a2d',
      worktreeDiff: 'tests/payment/PaymentProcessor.test.ts (+36 lines)',
      prompt: 'Prompt Template v2.1',
      modelId: 'gpt-4o',
      modelConfig: { temperature: 0.2 },
      seed: 42,
      skillVersion: 'vitest-unit-generator@2.1.0',
      toolVersions: { ast_analyzer: '1.2.0', sandbox_exec: '2.0.0' },
      sandboxBackend: 'local',
      contextStrategy: 'full-history'
    },
    createdAt: Date.now() - 3600000 * 5,
    finishedAt: Date.now() - 3600000 * 5 + 5600,
    durationMs: 5600
  },
  {
    id: 'run_deepseek_v3',
    evalCaseId: 'case_payment_01',
    experimentTag: 'DeepSeek-R1 (Local VLLM)',
    modelId: 'deepseek-r1',
    skillVersion: 'vitest-unit-generator@2.1.0',
    contextStrategy: 'Ephemeral-Compacted',
    sandboxBackend: 'Docker-Isolated-Sandbox',
    status: 'passed',
    compositeScore: 88.20,
    scoreBreakdown: calculateCompositeScore({
      correctness: 100,
      mutationPower: 75,
      scopeDiscipline: 100,
      efficiency: 72,
      stability: 85
    }),
    reproductionBundle: {
      repoCommitSha: '98f12a4c8e7b1a2d',
      worktreeDiff: 'tests/payment/PaymentProcessor.test.ts (+52 lines)',
      prompt: 'Prompt Template v2.1',
      modelId: 'deepseek-r1',
      modelConfig: { temperature: 0.6 },
      seed: 42,
      skillVersion: 'vitest-unit-generator@2.1.0',
      toolVersions: { ast_analyzer: '1.2.0', sandbox_exec: '2.0.0' },
      sandboxBackend: 'docker',
      contextStrategy: 'ephemeral'
    },
    createdAt: Date.now() - 3600000 * 12,
    finishedAt: Date.now() - 3600000 * 12 + 8400,
    durationMs: 8400
  }
];

export const MOCK_SANDBOX_POOLS: SandboxPoolStatus[] = [
  {
    id: 'pool_local',
    type: 'local',
    status: 'healthy',
    activeInstances: 2,
    maxInstances: 8,
    avgLatencyMs: 14,
    memoryUsageMb: 148
  },
  {
    id: 'pool_docker',
    type: 'docker',
    status: 'healthy',
    activeInstances: 5,
    maxInstances: 20,
    avgLatencyMs: 85,
    memoryUsageMb: 1024
  },
  {
    id: 'pool_firecracker',
    type: 'firecracker',
    status: 'busy',
    activeInstances: 12,
    maxInstances: 16,
    avgLatencyMs: 120,
    memoryUsageMb: 2450
  }
];

export const MOCK_PROVIDER_CONFIGS: ProviderConfig[] = [
  {
    id: 'prov_anthropic',
    provider: 'Anthropic',
    modelId: 'claude-3-7-sonnet',
    promptCachingStrategy: 'explicit_breakpoint',
    reasoningEffort: 'high',
    compactionThresholdTokens: 64000,
    maxContextTokens: 200000,
    enabled: true
  },
  {
    id: 'prov_openai',
    provider: 'OpenAI',
    modelId: 'gpt-4o',
    promptCachingStrategy: 'automatic_prefix',
    reasoningEffort: 'medium',
    compactionThresholdTokens: 48000,
    maxContextTokens: 128000,
    enabled: true
  },
  {
    id: 'prov_gemini',
    provider: 'Gemini',
    modelId: 'gemini-2.5-pro',
    promptCachingStrategy: 'explicit_breakpoint',
    reasoningEffort: 'high',
    compactionThresholdTokens: 128000,
    maxContextTokens: 1000000,
    enabled: true
  },
  {
    id: 'prov_vllm',
    provider: 'VLLM-Local',
    modelId: 'deepseek-r1-q4',
    promptCachingStrategy: 'none',
    reasoningEffort: 'high',
    compactionThresholdTokens: 32000,
    maxContextTokens: 64000,
    enabled: true
  }
];

export const MOCK_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'audit_01',
    timestamp: Date.now() - 120000,
    userOrAgent: 'agent:claude-3-7-sonnet',
    action: 'SPAWN_PROCESS',
    capability: 'process.spawn:test-runner',
    status: 'ALLOWED',
    details: 'Executed command: npm test -- tests/payment/PaymentProcessor.test.ts'
  },
  {
    id: 'audit_02',
    timestamp: Date.now() - 360000,
    userOrAgent: 'agent:gpt-4o',
    action: 'WRITE_FILE',
    capability: 'fs.write:src/payment/PaymentProcessor.ts',
    status: 'DENIED',
    details: 'Security Policy Violation: Modification of production code src/** is forbidden'
  },
  {
    id: 'audit_03',
    timestamp: Date.now() - 600000,
    userOrAgent: 'agent:claude-3-7-sonnet',
    action: 'ELEVATE_PERMISSION',
    capability: 'network.connect:gateway.stripe.com',
    status: 'PENDING_APPROVAL',
    details: 'Agent requested external network capability for live sandbox integration test'
  }
];
