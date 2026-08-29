import { AgentEvent, CompositeScoreBreakdown, calculateCompositeScore } from '@testagent/protocol';

export interface SimulatedStep {
  id: string;
  name: string;
  stage: 'gap_analysis' | 'test_generation' | 'sandbox_exec' | 'diagnosis' | 'hard_assert' | 'mutation_eval' | 'score_archive';
  status: 'pending' | 'running' | 'completed' | 'failed' | 'waiting_approval';
  durationMs?: number;
  reasoningSummary?: string;
  toolCall?: {
    name: string;
    args: Record<string, any>;
    requiredCapability?: string;
    stdoutRef?: string;
  };
}

export const SAMPLE_DIFF = `--- a/tests/payment/PaymentProcessor.test.ts
+++ b/tests/payment/PaymentProcessor.test.ts
@@ -0,0 +1,48 @@
+import { describe, it, expect, vi, beforeEach } from 'vitest';
+import { PaymentProcessor, PaymentStatus } from '../../src/payment/PaymentProcessor';
+import { TokenBucketRateLimiter } from '../../src/security/RateLimiter';
+
+describe('PaymentProcessor (Agent Generated Suite)', () => {
+  let processor: PaymentProcessor;
+  let mockGateway: any;
+
+  beforeEach(() => {
+    mockGateway = { charge: vi.fn().mockResolvedValue({ status: 'SUCCESS', txnId: 'tx_123' }) };
+    processor = new PaymentProcessor(mockGateway, new TokenBucketRateLimiter(10, 1000));
+  });
+
+  it('should successfully process idempotency key on concurrent payments', async () => {
+    const order = { id: 'ord_9901', amount: 4990, currency: 'USD', idempotencyKey: 'idemp_key_abc' };
+    const [res1, res2] = await Promise.all([
+      processor.processPayment(order),
+      processor.processPayment(order)
+    ]);
+    expect(res1.status).toBe(PaymentStatus.PAID);
+    expect(res2.isDuplicate).toBe(true);
+    expect(mockGateway.charge).toHaveBeenCalledTimes(1);
+  });
+
+  it('should safely reject negative or zero payment amounts (Boundary Check)', async () => {
+    await expect(processor.processPayment({ id: 'ord_err', amount: -10, currency: 'USD' }))
+      .rejects.toThrow('INVALID_AMOUNT');
+  });
+
+  it('should handle gateway network timeout and retry with exponential backoff', async () => {
+    mockGateway.charge
+      .mockRejectedValueOnce(new Error('ETIMEDOUT'))
+      .mockResolvedValueOnce({ status: 'SUCCESS', txnId: 'tx_retry_ok' });
+    const res = await processor.processPayment({ id: 'ord_retry', amount: 1500, currency: 'USD' });
+    expect(res.status).toBe(PaymentStatus.PAID);
+    expect(mockGateway.charge).toHaveBeenCalledTimes(2);
+  });
+});`;

export const SAMPLE_STDOUT = `[Sandbox Local] Initializing workspace snapshot for repo payment-core-eval@1.2 (commit 98f12a4)...
[Sandbox Local] Applied generated patch: tests/payment/PaymentProcessor.test.ts (+48 lines)
[Sandbox Local] Spawning test runner: npm test -- tests/payment/PaymentProcessor.test.ts
> payment-core@1.2.0 test
> vitest run tests/payment/PaymentProcessor.test.ts

 RUN  v1.6.0 /sandbox/payment-core

 ✓ tests/payment/PaymentProcessor.test.ts (3 tests) 312ms
   ✓ PaymentProcessor (Agent Generated Suite) > should successfully process idempotency key on concurrent payments (142ms)
   ✓ PaymentProcessor (Agent Generated Suite) > should safely reject negative or zero payment amounts (Boundary Check) (12ms)
   ✓ PaymentProcessor (Agent Generated Suite) > should handle gateway network timeout and retry with exponential backoff (158ms)

 Test Files  1 passed (1)
      Tests  3 passed (3)
   Start at  23:32:10
   Duration  624ms (transform 120ms, setup 42ms, collect 86ms, tests 312ms, environment 0ms, prepare 64ms)

[Layer 1 Hard Assertions]
  ✓ TS Compiler Check (tsc --noEmit): ExitCode 0 (Passed)
  ✓ Sandbox Exit Code: 0 (Passed)
  ✓ Scope Discipline: No files under src/ modified (Passed)

[Layer 2 Mutation Injection Testing]
  [Mutant #1] src/payment/PaymentProcessor.ts:42 (if (amount <= 0) -> if (false))
              --> KILLED by "should safely reject negative or zero payment amounts"
  [Mutant #2] src/payment/PaymentProcessor.ts:78 (if (!idempotencyKey) -> if (idempotencyKey))
              --> KILLED by "should successfully process idempotency key on concurrent payments"
  [Mutant #3] src/payment/PaymentProcessor.ts:115 (retryCount < 3 -> retryCount < 0)
              --> KILLED by "should handle gateway network timeout and retry with exponential backoff"
  [Mutant #4] src/security/RateLimiter.ts:24 (tokens -= cost -> tokens += cost)
              --> SURVIVED (Rate limiter mutation not covered in current test scope)

Mutation Power: 3/4 Mutants Killed (75.0% Kill Rate)`;

export const INITIAL_STEPS: SimulatedStep[] = [
  {
    id: 'step-1',
    name: '1. 测试任务定义 (Task Definition)',
    stage: 'gap_analysis',
    status: 'completed',
    durationMs: 140,
    reasoningSummary: '解析 Eval Case: payment-core-eval@1.2 (目标: PaymentProcessor 并发与幂等性补充测试)'
  },
  {
    id: 'step-2',
    name: '2. 代码库理解与差距分析 (Gap Analysis)',
    stage: 'gap_analysis',
    status: 'completed',
    durationMs: 420,
    reasoningSummary: 'AST 分析已识别未覆盖分支：并发幂等冲突 (L78)、负数金额防护 (L42)、网络超时重试 (L115)',
    toolCall: {
      name: 'ast_analyzer',
      args: { target: 'src/payment/PaymentProcessor.ts' },
      stdoutRef: 'ast_analysis_summary.json'
    }
  },
  {
    id: 'step-3',
    name: '3. 候选测试生成与排序 (Candidate Tests)',
    stage: 'test_generation',
    status: 'completed',
    durationMs: 980,
    reasoningSummary: '生成 3 组针对关键边界的高置信度测试用例并合成单一 Vitest 测试文件',
    toolCall: {
      name: 'code_generator',
      args: { prompt: 'Generate Vitest test suite covering idempotency & boundary checks' }
    }
  },
  {
    id: 'step-4',
    name: '4. 应用补丁与沙箱执行 (Patch & Run Tests)',
    stage: 'sandbox_exec',
    status: 'completed',
    durationMs: 624,
    reasoningSummary: '向 Local Sandbox 写入 Patch 并拉起 Vitest 进程，3/3 测试用例全部通过',
    toolCall: {
      name: 'sandbox_exec',
      args: { cmd: 'vitest', args: ['run', 'tests/payment/PaymentProcessor.test.ts'] },
      requiredCapability: 'process.spawn:test-runner',
      stdoutRef: 'stdout_vitest_run.log'
    }
  },
  {
    id: 'step-5',
    name: '5. 质量评估 (Hard Assertions + Mutation)',
    stage: 'mutation_eval',
    status: 'completed',
    durationMs: 1250,
    reasoningSummary: '硬性断言通过率 100%，注入 4 处关键分支代码变异，击杀 3 处变异 (Kill Rate 75%)',
    toolCall: {
      name: 'mutation_engine',
      args: { mutantsCount: 4, targetFile: 'src/payment/PaymentProcessor.ts' }
    }
  },
  {
    id: 'step-6',
    name: '6. 综合评分与归档 (Score & Artifacts)',
    stage: 'score_archive',
    status: 'completed',
    durationMs: 85,
    reasoningSummary: '已生成六维评分卡 (Composite Score: 90.75) 与 100% 可复现 Reproduction Bundle'
  }
];

export const INITIAL_SCORE: CompositeScoreBreakdown = calculateCompositeScore({
  correctness: 100,      // 编译与测试完全通过
  mutationPower: 75,     // 变异击杀率 75%
  scopeDiscipline: 100,  // 完全未污染 src/ 生产代码
  efficiency: 88,        // 消耗 Token: 3,420, Tool 轮次: 4
  stability: 95          // 3 次连续回归 100% 确定性通过
});
