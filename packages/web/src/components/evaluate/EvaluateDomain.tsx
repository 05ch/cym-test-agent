import React, { useState } from 'react';
import {
  Award,
  ShieldCheck,
  Zap,
  Flame,
  Layers,
  Sparkles,
  Copy,
  Check,
  FileJson,
  TrendingUp,
  Skull,
  Crosshair,
  Percent,
  CheckCircle2,
  XCircle,
  AlertTriangle
} from 'lucide-react';
import { useApp } from '../../context/AppContext.js';
import { MutantDetail, ExperimentRun } from '../../types/index.js';

export const EvaluateDomain: React.FC = () => {
  const { datasets, evalCases, selectedCase, runs, activeRun, mutants } = useApp();
  const [selectedRun, setSelectedRun] = useState<ExperimentRun>(activeRun);
  const [copiedBundle, setCopiedBundle] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'scoring' | 'mutation' | 'matrix' | 'bundle'>('scoring');

  const handleCopyBundle = () => {
    navigator.clipboard.writeText(JSON.stringify(selectedRun.reproductionBundle, null, 2));
    setCopiedBundle(true);
    setTimeout(() => setCopiedBundle(false), 2000);
  };

  const score = selectedRun.scoreBreakdown || {
    correctness: 100,
    mutationPower: 75,
    scopeDiscipline: 100,
    efficiency: 88,
    stability: 95,
    compositeScore: 90.75
  };

  const killedMutants = mutants.filter(m => m.status === 'KILLED');
  const killRate = ((killedMutants.length / mutants.length) * 100).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Top Header Banner */}
      <div className="theme-surface p-6 rounded-3xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-[var(--accent-amber)]" />
            <h2 className="text-base font-semibold theme-text-primary tracking-tight">
              3. 质量评测域 (EVALUATE)
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full badge-amber font-mono font-medium">
              三层评分 & 变异测试
            </span>
          </div>
          <p className="text-xs theme-text-secondary mt-1">
            严谨量化硬性断言、变异击杀率 (Mutation Power)、效能成本、Run Matrix 对比与 100% 复现捆绑包
          </p>
        </div>

        {/* Tab switch buttons */}
        <div className="flex items-center p-0.5 rounded-full theme-surface-subtle text-xs">
          {(['scoring', 'mutation', 'matrix', 'bundle'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3.5 py-1.5 rounded-full font-medium transition-all ${
                activeTab === tab
                  ? 'theme-surface theme-text-primary shadow-sm font-semibold'
                  : 'theme-text-muted hover:theme-text-primary'
              }`}
            >
              {tab === 'scoring' && '三层综合评分'}
              {tab === 'mutation' && `变异击杀透视 (${killRate}%)`}
              {tab === 'matrix' && `实验矩阵 (${runs.length})`}
              {tab === 'bundle' && '复现捆绑包'}
            </button>
          ))}
        </div>
      </div>

      {/* Tab 1: 3-Layer Scoring & Composite Score */}
      {activeTab === 'scoring' && (
        <div className="space-y-6">
          {/* Composite Score Hero Card */}
          <div className="theme-surface p-6 rounded-3xl grid grid-cols-12 gap-6 items-center">
            <div className="col-span-12 md:col-span-4 flex flex-col items-center justify-center p-6 theme-surface-subtle rounded-3xl border theme-border">
              <span className="text-xs font-semibold theme-text-muted uppercase tracking-wider">六维综合质量评分</span>
              <div className="text-5xl font-extrabold text-[var(--accent-blue)] my-2 tracking-tight">
                {score.compositeScore}
              </div>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full badge-green">
                GRADE: EXCELLENT (A)
              </span>
              <span className="text-[10px] theme-text-muted font-mono mt-3 text-center">
                Score = 0.40·C + 0.25·M + 0.15·S + 0.10·E + 0.10·St
              </span>
            </div>

            {/* Radar / Dimension Progress Bars */}
            <div className="col-span-12 md:col-span-8 space-y-3.5">
              <div>
                <div className="flex justify-between text-xs font-medium mb-1.5">
                  <span className="theme-text-primary">1. Correctness (硬断言/编译/单测通过 - 权重 40%)</span>
                  <span className="text-[var(--accent-green)] font-mono font-bold">{score.correctness}/100</span>
                </div>
                <div className="w-full h-2 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-[var(--accent-green)] rounded-full transition-all duration-500" style={{ width: `${score.correctness}%` }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-medium mb-1.5">
                  <span className="theme-text-primary">2. Mutation Power (变异击杀能力 - 权重 25%)</span>
                  <span className="text-[var(--accent-blue)] font-mono font-bold">{score.mutationPower}/100</span>
                </div>
                <div className="w-full h-2 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-[var(--accent-blue)] rounded-full transition-all duration-500" style={{ width: `${score.mutationPower}%` }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-medium mb-1.5">
                  <span className="theme-text-primary">3. Scope Discipline (代码边界纪律 - 权重 15%)</span>
                  <span className="text-teal-600 dark:text-teal-400 font-mono font-bold">{score.scopeDiscipline}/100</span>
                </div>
                <div className="w-full h-2 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-teal-500 rounded-full transition-all duration-500" style={{ width: `${score.scopeDiscipline}%` }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-medium mb-1.5">
                  <span className="theme-text-primary">4. Efficiency & Cost (Token与重试效率 - 权重 10%)</span>
                  <span className="text-[var(--accent-amber)] font-mono font-bold">{score.efficiency}/100</span>
                </div>
                <div className="w-full h-2 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-[var(--accent-amber)] rounded-full transition-all duration-500" style={{ width: `${score.efficiency}%` }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-medium mb-1.5">
                  <span className="theme-text-primary">5. Stability (确定性与可复现性 - 权重 10%)</span>
                  <span className="theme-text-secondary font-mono font-bold">{score.stability}/100</span>
                </div>
                <div className="w-full h-2 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-slate-500 dark:bg-slate-400 rounded-full transition-all duration-500" style={{ width: `${score.stability}%` }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed 3 Layers Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Layer 1 */}
            <div className="theme-surface p-6 rounded-3xl space-y-3">
              <div className="flex items-center gap-2 text-[var(--accent-green)] font-semibold text-sm">
                <ShieldCheck className="w-4 h-4" />
                <span>Layer 1: 硬性断言 (Hard)</span>
              </div>
              <ul className="text-xs space-y-2 font-mono">
                <li className="flex items-center justify-between p-2.5 rounded-xl theme-surface-subtle">
                  <span className="theme-text-secondary">TS Compile</span>
                  <span className="text-[var(--accent-green)] font-semibold">PASSED</span>
                </li>
                <li className="flex items-center justify-between p-2.5 rounded-xl theme-surface-subtle">
                  <span className="theme-text-secondary">Exit Code</span>
                  <span className="text-[var(--accent-green)] font-semibold">CODE 0</span>
                </li>
                <li className="flex items-center justify-between p-2.5 rounded-xl theme-surface-subtle">
                  <span className="theme-text-secondary">Boundary Guard</span>
                  <span className="text-[var(--accent-green)] font-semibold">UNTOUCHED</span>
                </li>
              </ul>
            </div>

            {/* Layer 2 */}
            <div className="theme-surface p-6 rounded-3xl space-y-3">
              <div className="flex items-center gap-2 text-[var(--accent-blue)] font-semibold text-sm">
                <Crosshair className="w-4 h-4" />
                <span>Layer 2: 变异与行为质量</span>
              </div>
              <ul className="text-xs space-y-2 font-mono">
                <li className="flex items-center justify-between p-2.5 rounded-xl theme-surface-subtle">
                  <span className="theme-text-secondary">Kill Rate</span>
                  <span className="text-[var(--accent-blue)] font-bold">75.0% (3/4)</span>
                </li>
                <li className="flex items-center justify-between p-2.5 rounded-xl theme-surface-subtle">
                  <span className="theme-text-secondary">Idempotency</span>
                  <span className="text-[var(--accent-green)] font-semibold">PASS</span>
                </li>
                <li className="flex items-center justify-between p-2.5 rounded-xl theme-surface-subtle">
                  <span className="theme-text-secondary">Assert Quality</span>
                  <span className="text-[var(--accent-green)] font-semibold">100% REAL</span>
                </li>
              </ul>
            </div>

            {/* Layer 3 */}
            <div className="theme-surface p-6 rounded-3xl space-y-3">
              <div className="flex items-center gap-2 text-[var(--accent-amber)] font-semibold text-sm">
                <Zap className="w-4 h-4" />
                <span>Layer 3: 效能与开销</span>
              </div>
              <ul className="text-xs space-y-2 font-mono">
                <li className="flex items-center justify-between p-2.5 rounded-xl theme-surface-subtle">
                  <span className="theme-text-secondary">Cache Hit</span>
                  <span className="text-[var(--accent-green)] font-semibold">52.6% (1.8k)</span>
                </li>
                <li className="flex items-center justify-between p-2.5 rounded-xl theme-surface-subtle">
                  <span className="theme-text-secondary">Tool Rounds</span>
                  <span className="theme-text-primary font-semibold">4 Rounds</span>
                </li>
                <li className="flex items-center justify-between p-2.5 rounded-xl theme-surface-subtle">
                  <span className="theme-text-secondary">Cost</span>
                  <span className="text-[var(--accent-amber)] font-semibold">$0.018 USD</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Mutation Testing Breakdown */}
      {activeTab === 'mutation' && (
        <div className="theme-surface p-6 rounded-3xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold theme-text-primary flex items-center gap-2">
                <Skull className="w-4 h-4 text-[var(--accent-red)]" />
                <span>AST 关键分支变异击杀透视 (Mutation Killed vs Survived)</span>
              </h3>
              <p className="text-xs theme-text-secondary mt-0.5">
                自动向业务代码注入反向逻辑变异，检验单测能否变红报错，防止无有效断言的虚假高覆盖率。
              </p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 rounded-full badge-green text-xs font-mono font-bold">
              <span>Kill Rate: {killRate}%</span>
            </div>
          </div>

          <div className="space-y-3">
            {mutants.map(mut => {
              const isKilled = mut.status === 'KILLED';
              return (
                <div
                  key={mut.id}
                  className={`p-4 rounded-2xl border font-mono text-xs space-y-2 ${
                    isKilled
                      ? 'theme-surface-subtle'
                      : 'bg-rose-500/10 border-rose-500/30'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {isKilled ? (
                        <span className="px-2.5 py-0.5 rounded-full badge-green text-[10px] font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> KILLED
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full badge-red text-[10px] font-semibold flex items-center gap-1">
                          <XCircle className="w-3 h-3" /> SURVIVED
                        </span>
                      )}
                      <span className="theme-text-primary font-bold">{mut.file}:{mut.line}</span>
                      <span className="theme-text-muted text-[10px]">[{mut.mutationType}]</span>
                    </div>

                    {isKilled && mut.killedByTest && (
                      <span className="theme-text-muted text-[11px]">
                        Killed by: <span className="text-[var(--accent-green)] font-sans font-medium">"{mut.killedByTest}"</span>
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div className="theme-code-block p-3 rounded-xl">
                      <div className="text-[10px] theme-text-muted mb-1">原始代码:</div>
                      <code className="theme-text-primary">{mut.originalCode}</code>
                    </div>
                    <div className={`p-3 rounded-xl border ${isKilled ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300' : 'bg-rose-500/15 border-rose-500/40 text-rose-700 dark:text-rose-300'}`}>
                      <div className="text-[10px] opacity-75 mb-1">变异注入代码:</div>
                      <code>{mut.mutatedCode}</code>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 3: Run Matrix */}
      {activeTab === 'matrix' && (
        <div className="theme-surface p-6 rounded-3xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold theme-text-primary flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[var(--accent-blue)]" />
                <span>实验矩阵对比基准 (Run Matrix)</span>
              </h3>
              <p className="text-xs theme-text-secondary mt-0.5">
                Model × Prompt Version × Skill Version × Context Strategy × Sandbox Backend
              </p>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border theme-border">
            <table className="w-full text-left text-xs font-mono">
              <thead className="theme-surface-subtle theme-text-muted border-b theme-border">
                <tr>
                  <th className="p-3.5">实验标签 (Experiment)</th>
                  <th className="p-3.5">模型 (Model)</th>
                  <th className="p-3.5">Skill 依赖</th>
                  <th className="p-3.5">沙箱后端</th>
                  <th className="p-3.5">耗时</th>
                  <th className="p-3.5">变异击杀率</th>
                  <th className="p-3.5 text-right">综合质量评分</th>
                </tr>
              </thead>
              <tbody className="divide-y theme-border">
                {runs.map(run => {
                  const isCur = run.id === selectedRun.id;
                  return (
                    <tr
                      key={run.id}
                      onClick={() => setSelectedRun(run)}
                      className={`hover:bg-[var(--bg-surface-hover)] cursor-pointer transition-colors ${
                        isCur ? 'bg-[var(--accent-blue-subtle)] font-semibold text-[var(--accent-blue)]' : 'theme-text-primary'
                      }`}
                    >
                      <td className="p-3.5 flex items-center gap-2">
                        {isCur && <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-blue)]"></span>}
                        <span>{run.experimentTag}</span>
                      </td>
                      <td className="p-3.5 text-[var(--accent-blue)]">{run.modelId}</td>
                      <td className="p-3.5 theme-text-muted">{run.skillVersion}</td>
                      <td className="p-3.5 theme-text-muted">{run.sandboxBackend}</td>
                      <td className="p-3.5 theme-text-muted">{run.durationMs}ms</td>
                      <td className="p-3.5 text-[var(--accent-green)] font-semibold">
                        {run.scoreBreakdown?.mutationPower || 75}%
                      </td>
                      <td className="p-3.5 text-right text-[var(--accent-green)] font-bold text-sm">
                        {run.compositeScore}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Reproduction Bundle */}
      {activeTab === 'bundle' && (
        <div className="theme-surface p-6 rounded-3xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold theme-text-primary flex items-center gap-2">
                <FileJson className="w-4 h-4 text-[var(--accent-blue)]" />
                <span>100% 可复现评测捆绑包 (Reproduction Bundle)</span>
              </h3>
              <p className="text-xs theme-text-secondary mt-0.5">
                包含 Commit SHA、Worktree Diff、Prompt、Model Config、Seed 与 Tool 版本元数据
              </p>
            </div>
            <button
              onClick={handleCopyBundle}
              className="theme-btn-primary flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium"
            >
              {copiedBundle ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedBundle ? '已复制 JSON' : '复制复现包 JSON'}</span>
            </button>
          </div>

          <div className="theme-code-block p-4 rounded-2xl text-xs font-mono text-sky-600 dark:text-sky-300 max-h-96 overflow-y-auto">
            <pre>{JSON.stringify(selectedRun.reproductionBundle, null, 2)}</pre>
          </div>
        </div>
      )}
    </div>
  );
};
