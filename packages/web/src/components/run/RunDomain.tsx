import React, { useState } from 'react';
import {
  Activity,
  GitFork,
  FileCode2,
  Terminal,
  CheckCircle2,
  Clock,
  Zap,
  Sparkles,
  RotateCcw,
  ArrowRight,
  Shield,
  Layers,
  ChevronRight,
  Flame
} from 'lucide-react';
import { useApp } from '../../context/AppContext.js';
import { DAGNode } from '../../types/index.js';

export const RunDomain: React.FC = () => {
  const {
    dagNodes,
    selectedNodeId,
    setSelectedNodeId,
    activeRun,
    isSimulating,
    forkSession
  } = useApp();

  const [activeArtifactTab, setActiveArtifactTab] = useState<'diff' | 'stdout' | 'flamegraph' | 'coverage'>('diff');
  const [showForkModal, setShowForkModal] = useState<boolean>(false);
  const [forkPrompt, setForkPrompt] = useState<string>('在支付重试机制中加入抖动 (Jitter) 与死信队列告警验证');

  const selectedNode = dagNodes.find(n => n.id === selectedNodeId) || dagNodes[0];

  const handleConfirmFork = () => {
    forkSession(selectedNode.id, forkPrompt);
    setShowForkModal(false);
  };

  const sampleDiffLines = [
    { type: 'header', text: '--- a/tests/payment/PaymentProcessor.test.ts' },
    { type: 'header', text: '+++ b/tests/payment/PaymentProcessor.test.ts' },
    { type: 'chunk', text: '@@ -0,0 +1,48 @@' },
    { type: 'add', text: '+import { describe, it, expect, vi, beforeEach } from "vitest";' },
    { type: 'add', text: '+import { PaymentProcessor, PaymentStatus } from "../../src/payment/PaymentProcessor";' },
    { type: 'add', text: '+import { TokenBucketRateLimiter } from "../../src/security/RateLimiter";' },
    { type: 'normal', text: ' ' },
    { type: 'add', text: '+describe("PaymentProcessor (Agent Generated Suite)", () => {' },
    { type: 'add', text: '+  let processor: PaymentProcessor;' },
    { type: 'add', text: '+  let mockGateway: any;' },
    { type: 'normal', text: ' ' },
    { type: 'add', text: '+  beforeEach(() => {' },
    { type: 'add', text: '+    mockGateway = { charge: vi.fn().mockResolvedValue({ status: "SUCCESS", txnId: "tx_123" }) };' },
    { type: 'add', text: '+    processor = new PaymentProcessor(mockGateway, new TokenBucketRateLimiter(10, 1000));' },
    { type: 'add', text: '+  });' },
    { type: 'normal', text: ' ' },
    { type: 'add', text: '+  it("should successfully process idempotency key on concurrent payments", async () => {' },
    { type: 'add', text: '+    const order = { id: "ord_9901", amount: 4990, currency: "USD", idempotencyKey: "idemp_key_abc" };' },
    { type: 'add', text: '+    const [res1, res2] = await Promise.all([' },
    { type: 'add', text: '+      processor.processPayment(order),' },
    { type: 'add', text: '+      processor.processPayment(order)' },
    { type: 'add', text: '+    ]);' },
    { type: 'add', text: '+    expect(res1.status).toBe(PaymentStatus.PAID);' },
    { type: 'add', text: '+    expect(res2.isDuplicate).toBe(true);' },
    { type: 'add', text: '+    expect(mockGateway.charge).toHaveBeenCalledTimes(1);' },
    { type: 'add', text: '+  });' },
    { type: 'normal', text: ' ' },
    { type: 'add', text: '+  it("should safely reject negative or zero payment amounts (Boundary Check)", async () => {' },
    { type: 'add', text: '+    await expect(processor.processPayment({ id: "ord_err", amount: -10, currency: "USD" }))' },
    { type: 'add', text: '+      .rejects.toThrow("INVALID_AMOUNT");' },
    { type: 'add', text: '+  });' },
    { type: 'normal', text: ' ' },
    { type: 'add', text: '+  it("should handle gateway network timeout and retry with exponential backoff", async () => {' },
    { type: 'add', text: '+    mockGateway.charge' },
    { type: 'add', text: '+      .mockRejectedValueOnce(new Error("ETIMEDOUT"))' },
    { type: 'add', text: '+      .mockResolvedValueOnce({ status: "SUCCESS", txnId: "tx_retry_ok" });' },
    { type: 'add', text: '+    const res = await processor.processPayment({ id: "ord_retry", amount: 1500, currency: "USD" });' },
    { type: 'add', text: '+    expect(res.status).toBe(PaymentStatus.PAID);' },
    { type: 'add', text: '+    expect(mockGateway.charge).toHaveBeenCalledTimes(2);' },
    { type: 'add', text: '+  });' },
    { type: 'add', text: '+});' }
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner with Run Stats */}
      <div className="theme-surface p-6 rounded-3xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-[var(--accent-blue)]" />
            <h2 className="text-base font-semibold theme-text-primary tracking-tight">
              2. 运行时追踪域 (RUN)
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-medium badge-blue">
              {activeRun.experimentTag}
            </span>
          </div>
          <p className="text-xs theme-text-secondary mt-1">
            可观测执行轨迹 (Trace DAG)、时空穿梭 Checkpoint、会话分叉 (Session Forking) 与产物检查器
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowForkModal(true)}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-full theme-surface-subtle theme-text-primary text-xs font-medium transition-all active:scale-95 shadow-sm hover:border-[var(--border-medium)]"
          >
            <GitFork className="w-3.5 h-3.5 text-[var(--accent-blue)]" />
            <span>在当前节点分叉 (Fork Session)</span>
          </button>
        </div>
      </div>

      {/* Interactive Agent Execution Trace DAG */}
      <div className="theme-surface p-6 rounded-3xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold theme-text-primary flex items-center gap-2">
            <Zap className="w-4 h-4 text-[var(--accent-amber)]" />
            <span>Agent Execution Trace DAG (执行链路)</span>
          </h3>
          <span className="text-[11px] theme-text-muted font-mono">
            总耗时: 3,779ms | Token: 3,420 (Cache Saved: 1,800)
          </span>
        </div>

        {/* Step Flow Nodes (Horizontal Interactive DAG) */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 pt-1">
          {dagNodes.map((node, index) => {
            const isSelected = selectedNodeId === node.id;
            const isCompleted = node.status === 'completed';
            const isRunning = node.status === 'running';

            return (
              <button
                key={node.id}
                onClick={() => setSelectedNodeId(node.id)}
                className={`relative p-3.5 rounded-2xl text-left border transition-all duration-200 flex flex-col justify-between min-h-[115px] ${
                  isSelected
                    ? 'bg-[var(--accent-blue)] text-white border-[var(--accent-blue)] shadow-md ring-2 ring-[var(--accent-blue)]/30'
                    : isCompleted
                    ? 'theme-surface-subtle hover:border-[var(--border-medium)]'
                    : isRunning
                    ? 'bg-[var(--accent-amber-subtle)] border-[var(--accent-amber)]'
                    : 'theme-surface-subtle opacity-60'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className={`text-[10px] font-mono ${isSelected ? 'text-white/80' : 'theme-text-muted'}`}>
                      Step {index + 1}
                    </span>
                    {isCompleted && (
                      <CheckCircle2 className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-[var(--accent-green)]'}`} />
                    )}
                    {isRunning && <Clock className="w-3.5 h-3.5 text-[var(--accent-amber)] animate-spin" />}
                  </div>
                  <span className={`text-xs font-semibold line-clamp-2 ${isSelected ? 'text-white' : 'theme-text-primary'}`}>
                    {node.name.split(' ')[1] || node.name}
                  </span>
                </div>

                <div className={`pt-2 flex items-center justify-between text-[10px] font-mono border-t mt-2 ${
                  isSelected ? 'border-white/20 text-white/90' : 'theme-border theme-text-muted'
                }`}>
                  <span>{node.durationMs}ms</span>
                  {node.tokensUsed && <span>{node.tokensUsed} t</span>}
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Step Deep Reasoning Summary Card */}
        {selectedNode && (
          <div className="p-4 rounded-2xl theme-surface-subtle space-y-3 animate-fadeIn">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[var(--accent-amber)]" />
                <span className="text-xs font-semibold theme-text-primary">{selectedNode.name}</span>
              </div>
              <span className="text-[11px] font-mono text-[var(--accent-blue)] font-medium">
                耗时 {selectedNode.durationMs}ms | 状态: {selectedNode.status.toUpperCase()}
              </span>
            </div>

            <div className="theme-surface p-3.5 rounded-xl border theme-border shadow-sm">
              <div className="text-[11px] font-semibold theme-text-muted mb-1">可观测决策摘要 (Reasoning Summary):</div>
              <p className="text-xs theme-text-primary leading-relaxed font-sans">{selectedNode.reasoningSummary}</p>
            </div>

            {selectedNode.toolDetails && (
              <div className="theme-surface p-3.5 rounded-xl border theme-border text-xs font-mono space-y-1 shadow-sm">
                <div className="flex items-center justify-between text-[var(--accent-blue)] font-semibold">
                  <span>Tool: {selectedNode.toolDetails.name}</span>
                  {selectedNode.toolDetails.requiredCapability && (
                    <span className="badge-red text-[10px] px-2 py-0.5 rounded-full font-medium">
                      {selectedNode.toolDetails.requiredCapability}
                    </span>
                  )}
                </div>
                <div className="theme-text-muted text-[11px]">
                  Args: {JSON.stringify(selectedNode.toolDetails.args)}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Artifacts Deep Inspector Tabs */}
      <div className="theme-surface p-6 rounded-3xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileCode2 className="w-4 h-4 text-[var(--accent-green)]" />
            <h3 className="text-sm font-semibold theme-text-primary">Artifacts 深度产物检查器</h3>
          </div>

          <div className="flex items-center p-0.5 rounded-full theme-surface-subtle text-xs">
            {(['diff', 'stdout', 'flamegraph', 'coverage'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveArtifactTab(tab)}
                className={`px-3 py-1 rounded-full font-medium transition-colors ${
                  activeArtifactTab === tab
                    ? 'theme-surface theme-text-primary shadow-sm font-semibold'
                    : 'theme-text-muted hover:theme-text-primary'
                }`}
              >
                {tab === 'diff' && 'Git Patch'}
                {tab === 'stdout' && 'Terminal Stdout'}
                {tab === 'flamegraph' && 'Latency 火焰图'}
                {tab === 'coverage' && 'Coverage 覆盖率'}
              </button>
            ))}
          </div>
        </div>

        {/* Tab 1: Diff View */}
        {activeArtifactTab === 'diff' && (
          <div className="theme-code-block p-4 rounded-2xl font-mono text-xs overflow-x-auto max-h-96 space-y-0.5">
            {sampleDiffLines.map((line, i) => {
              if (line.type === 'header') {
                return <div key={i} className="theme-text-primary font-bold">{line.text}</div>;
              }
              if (line.type === 'chunk') {
                return <div key={i} className="text-sky-600 dark:text-sky-400 py-1 font-bold">{line.text}</div>;
              }
              if (line.type === 'add') {
                return (
                  <div key={i} className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 px-1.5 -mx-1 rounded">
                    {line.text}
                  </div>
                );
              }
              return <div key={i} className="theme-text-muted">{line.text}</div>;
            })}
          </div>
        )}

        {/* Tab 2: Stdout Terminal */}
        {activeArtifactTab === 'stdout' && (
          <div className="theme-code-block p-4 rounded-2xl font-mono text-xs space-y-1.5 max-h-96 overflow-y-auto">
            <div className="text-sky-600 dark:text-sky-400 font-medium">[Sandbox Local] Initializing workspace snapshot for repo payment-core-eval@1.2 (commit 98f12a4)...</div>
            <div className="theme-text-muted">[Sandbox Local] Applied generated patch: tests/payment/PaymentProcessor.test.ts (+48 lines)</div>
            <div className="text-amber-600 dark:text-amber-400 font-medium">[Sandbox Local] Spawning test runner: npm test -- tests/payment/PaymentProcessor.test.ts</div>
            <div className="theme-text-muted">&gt; vitest run tests/payment/PaymentProcessor.test.ts</div>
            <div className="text-emerald-600 dark:text-emerald-400 font-bold py-1">✓ tests/payment/PaymentProcessor.test.ts (3 tests) 312ms</div>
            <div className="text-emerald-700 dark:text-emerald-300 pl-4">✓ should successfully process idempotency key on concurrent payments (142ms)</div>
            <div className="text-emerald-700 dark:text-emerald-300 pl-4">✓ should safely reject negative or zero payment amounts (12ms)</div>
            <div className="text-emerald-700 dark:text-emerald-300 pl-4">✓ should handle gateway network timeout and retry with exponential backoff (158ms)</div>
            <div className="theme-text-secondary pt-2 font-bold">Test Files 1 passed (1) | Tests 3 passed (3) | Duration 624ms</div>
          </div>
        )}

        {/* Tab 3: Flame Graph */}
        {activeArtifactTab === 'flamegraph' && (
          <div className="p-4 rounded-2xl theme-surface-subtle space-y-3 font-mono text-xs">
            <div className="theme-text-primary text-xs flex items-center gap-2 font-semibold">
              <Flame className="w-4 h-4 text-[var(--accent-amber)]" />
              <span>耗时火焰图 (Model TTFT vs Tool Latency vs Sandbox Execution)</span>
            </div>
            <div className="space-y-2.5">
              <div>
                <div className="flex justify-between text-[11px] theme-text-muted mb-1">
                  <span>1. AST Analysis Tool (AST Parser)</span>
                  <span>380ms (10.0%)</span>
                </div>
                <div className="w-full h-2.5 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-cyan-500 w-[10%] rounded-full"></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[11px] theme-text-muted mb-1">
                  <span>2. Model Inference & Test Generation (Claude 3.7 TTFT: 240ms)</span>
                  <span>1,120ms (29.6%)</span>
                </div>
                <div className="w-full h-2.5 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-[var(--accent-blue)] w-[30%] rounded-full"></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[11px] theme-text-muted mb-1">
                  <span>3. Sandbox Vitest Runner Execution</span>
                  <span>624ms (16.5%)</span>
                </div>
                <div className="w-full h-2.5 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-[var(--accent-green)] w-[17%] rounded-full"></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[11px] theme-text-muted mb-1">
                  <span>4. AST Mutation Injection & 4 Mutant Tests</span>
                  <span>1,450ms (38.3%)</span>
                </div>
                <div className="w-full h-2.5 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-slate-500 dark:bg-white/50 w-[38%] rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Code Coverage */}
        {activeArtifactTab === 'coverage' && (
          <div className="grid grid-cols-4 gap-4 text-center">
            <div className="p-4 theme-surface-subtle rounded-2xl">
              <div className="text-2xl font-bold text-[var(--accent-green)]">96.2%</div>
              <div className="text-xs theme-text-muted mt-1 font-medium">Statements</div>
            </div>
            <div className="p-4 theme-surface-subtle rounded-2xl">
              <div className="text-2xl font-bold text-[var(--accent-green)]">91.5%</div>
              <div className="text-xs theme-text-muted mt-1 font-medium">Branches</div>
            </div>
            <div className="p-4 theme-surface-subtle rounded-2xl">
              <div className="text-2xl font-bold text-[var(--accent-green)]">100%</div>
              <div className="text-xs theme-text-muted mt-1 font-medium">Functions</div>
            </div>
            <div className="p-4 theme-surface-subtle rounded-2xl">
              <div className="text-2xl font-bold text-[var(--accent-green)]">95.8%</div>
              <div className="text-xs theme-text-muted mt-1 font-medium">Lines</div>
            </div>
          </div>
        )}
      </div>

      {/* Session Forking Modal */}
      {showForkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md p-4 animate-fadeIn">
          <div className="theme-surface p-6 rounded-3xl shadow-2xl max-w-lg w-full space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 theme-text-primary font-semibold text-sm">
                <GitFork className="w-4 h-4 text-[var(--accent-blue)]" />
                <span>时空穿梭：派生平行测试会话 (Session Fork)</span>
              </div>
              <button
                onClick={() => setShowForkModal(false)}
                className="theme-text-muted hover:theme-text-primary text-xs"
              >
                ✕
              </button>
            </div>

            <p className="text-xs theme-text-secondary">
              从节点 <span className="text-[var(--accent-blue)] font-mono font-medium">[{selectedNode.name}]</span> 派生平行分支。你可以修改提示词或调整 Mock 策略并执行对比实验。
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold theme-text-primary">调整后的任务约束或 Prompt 增量:</label>
              <textarea
                value={forkPrompt}
                onChange={e => setForkPrompt(e.target.value)}
                rows={3}
                className="w-full theme-surface-subtle rounded-2xl p-3 text-xs theme-text-primary focus:outline-none focus:border-[var(--accent-blue)] font-sans shadow-sm"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setShowForkModal(false)}
                className="px-4 py-1.5 rounded-full text-xs theme-text-muted hover:theme-surface-subtle transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleConfirmFork}
                className="theme-btn-primary px-4 py-1.5 text-xs font-semibold"
              >
                确认派生并立即执行
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
