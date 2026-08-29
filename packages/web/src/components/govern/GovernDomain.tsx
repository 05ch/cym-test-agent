import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  Server,
  Cpu,
  FileCheck2,
  CheckCircle2,
  XCircle,
  Clock,
  Settings2
} from 'lucide-react';
import { useApp } from '../../context/AppContext.js';
import { CapabilityPolicyEngine } from '@testagent/protocol';

export const GovernDomain: React.FC = () => {
  const {
    sandboxPools,
    providerConfigs,
    auditLogs,
    approveAudit,
    rejectAudit
  } = useApp();

  const [capabilities, setCapabilities] = useState<{ name: string; desc: string; granted: boolean }[]>([
    { name: 'fs.read:repo', desc: '允许读取当前 Repo 工作区代码与 AST 语法树', granted: true },
    { name: 'fs.write:tests/**', desc: '仅允许向 tests/ 目录写入测试补丁文件', granted: true },
    { name: 'fs.write:src/**', desc: '写入 src/ 生产代码 (高危禁令，默认严格阻断)', granted: false },
    { name: 'process.spawn:test-runner', desc: '拉起 Vitest / Go Test 单测执行进程', granted: true },
    { name: 'git.read', desc: '读取 Git commit、branch 及 log 历史', granted: true },
    { name: 'git.write:branch', desc: '创建测试分支并推送补丁', granted: true },
    { name: 'network.connect:deny', desc: '物理断网隔离（防止数据外泄或外部脏调用）', granted: true }
  ]);

  const [testCapInput, setTestCapInput] = useState<string>('fs.write:tests/payment/PaymentProcessor.test.ts');
  const [testCapResult, setTestCapResult] = useState<{ allowed: boolean; message: string } | null>(null);

  const handleToggleCapability = (index: number) => {
    setCapabilities(prev =>
      prev.map((c, i) => (i === index ? { ...c, granted: !c.granted } : c))
    );
  };

  const handleTestCapability = () => {
    const grantedSet = new Set(capabilities.filter(c => c.granted).map(c => c.name));
    const engine = new CapabilityPolicyEngine(grantedSet as any);
    const allowed = engine.isGranted(testCapInput as any);

    setTestCapResult({
      allowed,
      message: allowed
        ? `[Policy Approved] 权限校验通过，匹配到策略通配规则。`
        : `[Security Violation] 权限被阻断！未在 Granted 策略清单中。`
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Header Banner */}
      <div className="theme-surface p-6 rounded-3xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[var(--accent-green)]" />
            <h2 className="text-base font-semibold theme-text-primary tracking-tight">
              4. 策略治理域 (GOVERN)
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full badge-green font-mono font-medium">
              安全管控 & 环境治理
            </span>
          </div>
          <p className="text-xs theme-text-secondary mt-1">
            结构化 Capability 权限引擎、Pluggable 沙箱环境池状态、Provider 差异化适配器与审计审批流
          </p>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Capability Policy Matrix & Tester */}
        <div className="col-span-12 lg:col-span-6 space-y-4">
          <div className="theme-surface p-6 rounded-3xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold theme-text-primary flex items-center gap-2">
                <Lock className="w-4 h-4 text-[var(--accent-blue)]" />
                <span>细粒度 Capability 权限矩阵策略</span>
              </h3>
              <span className="text-[10px] text-[var(--accent-green)] font-mono font-medium">Engine Active</span>
            </div>

            <div className="space-y-2">
              {capabilities.map((cap, idx) => (
                <div
                  key={cap.name}
                  className={`p-3.5 rounded-2xl border flex items-center justify-between transition-colors ${
                    cap.granted
                      ? 'theme-surface-subtle'
                      : 'bg-rose-500/10 border-rose-500/30'
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-semibold theme-text-primary">{cap.name}</span>
                      {cap.name.includes('src/**') && (
                        <span className="text-[10px] px-2 py-0.2 rounded-full badge-red font-medium">
                          FORBIDDEN
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] theme-text-secondary">{cap.desc}</p>
                  </div>

                  {/* Toggle Button */}
                  <button
                    onClick={() => handleToggleCapability(idx)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                      cap.granted
                        ? 'bg-[var(--accent-green)] text-white shadow-sm'
                        : 'theme-surface-subtle theme-text-muted hover:theme-text-primary'
                    }`}
                  >
                    {cap.granted ? '已授予' : '已禁止'}
                  </button>
                </div>
              ))}
            </div>

            {/* Quick Policy Assertion Tester */}
            <div className="pt-3 border-t theme-border space-y-2">
              <span className="text-xs font-semibold theme-text-primary">权限通配符模拟校验测试台:</span>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={testCapInput}
                  onChange={e => setTestCapInput(e.target.value)}
                  className="flex-1 theme-code-block rounded-full px-3.5 py-1.5 text-xs text-[var(--accent-blue)] font-mono focus:outline-none focus:border-[var(--accent-blue)] shadow-sm"
                />
                <button
                  onClick={handleTestCapability}
                  className="theme-btn-primary px-4 py-1.5 text-xs font-medium whitespace-nowrap"
                >
                  校验 (Assert)
                </button>
              </div>

              {testCapResult && (
                <div
                  className={`p-3 rounded-2xl text-xs font-mono flex items-center gap-2 ${
                    testCapResult.allowed
                      ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                      : 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/30'
                  }`}
                >
                  {testCapResult.allowed ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                  <span>{testCapResult.message}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Pluggable Sandbox Pools & Provider Configs */}
        <div className="col-span-12 lg:col-span-6 space-y-6">
          {/* Sandbox Pool Status */}
          <div className="theme-surface p-6 rounded-3xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold theme-text-primary flex items-center gap-2">
                <Server className="w-4 h-4 text-teal-500" />
                <span>Pluggable 沙箱环境池 (Sandbox Pool)</span>
              </h3>
              <span className="text-[10px] theme-text-muted font-mono">3 个隔离后端</span>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {sandboxPools.map(pool => (
                <div key={pool.id} className="p-3.5 theme-surface-subtle rounded-2xl space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold theme-text-primary capitalize">{pool.type}</span>
                    <span className="w-2 h-2 rounded-full bg-[var(--accent-green)]"></span>
                  </div>
                  <div className="text-[11px] theme-text-muted font-mono">
                    实例: {pool.activeInstances}/{pool.maxInstances}
                  </div>
                  <div className="text-[11px] text-[var(--accent-blue)] font-mono">
                    时延: {pool.avgLatencyMs}ms
                  </div>
                  <div className="text-[10px] theme-text-muted font-mono">
                    内存: {pool.memoryUsageMb} MB
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Model Provider Configs */}
          <div className="theme-surface p-6 rounded-3xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold theme-text-primary flex items-center gap-2">
                <Cpu className="w-4 h-4 text-[var(--accent-blue)]" />
                <span>模型 Provider 差异化能力配置</span>
              </h3>
            </div>

            <div className="space-y-2">
              {providerConfigs.map(prov => (
                <div key={prov.id} className="p-3 theme-surface-subtle rounded-2xl flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold theme-text-primary">{prov.provider}</span>
                      <span className="text-[10px] text-[var(--accent-blue)] font-mono font-medium">({prov.modelId})</span>
                    </div>
                    <div className="text-[10px] theme-text-muted font-mono mt-0.5">
                      Cache: {prov.promptCachingStrategy} | Reasoning: {prov.reasoningEffort} | MaxCtx: {prov.maxContextTokens / 1000}k
                    </div>
                  </div>
                  <span className="text-xs font-medium px-2.5 py-0.5 rounded-full badge-green">
                    Active
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Full-width: Audit Log & Human-in-the-Loop Approval Flow */}
        <div className="col-span-12 space-y-4">
          <div className="theme-surface p-6 rounded-3xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold theme-text-primary flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-[var(--accent-amber)]" />
                <span>审计日志与 Human-in-the-Loop 审批流</span>
              </h3>
              <span className="text-[10px] theme-text-muted font-mono">实时安全监控</span>
            </div>

            <div className="overflow-x-auto rounded-2xl border theme-border">
              <table className="w-full text-left text-xs font-mono">
                <thead className="theme-surface-subtle theme-text-muted border-b theme-border">
                  <tr>
                    <th className="p-3.5">发起主体 (Agent)</th>
                    <th className="p-3.5">动作 (Action)</th>
                    <th className="p-3.5">申请能力 (Capability)</th>
                    <th className="p-3.5">详情说明</th>
                    <th className="p-3.5">状态</th>
                    <th className="p-3.5 text-right">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y theme-border">
                  {auditLogs.map(log => (
                    <tr key={log.id} className="hover:bg-[var(--bg-surface-hover)] transition-colors">
                      <td className="p-3.5 text-[var(--accent-blue)] font-bold">{log.userOrAgent}</td>
                      <td className="p-3.5 theme-text-primary">{log.action}</td>
                      <td className="p-3.5 theme-text-muted">{log.capability}</td>
                      <td className="p-3.5 theme-text-muted max-w-xs truncate">{log.details}</td>
                      <td className="p-3.5">
                        {log.status === 'ALLOWED' && (
                          <span className="text-[var(--accent-green)] flex items-center gap-1 font-semibold">
                            <CheckCircle2 className="w-3.5 h-3.5" /> ALLOWED
                          </span>
                        )}
                        {log.status === 'DENIED' && (
                          <span className="text-[var(--accent-red)] flex items-center gap-1 font-semibold">
                            <XCircle className="w-3.5 h-3.5" /> DENIED
                          </span>
                        )}
                        {log.status === 'PENDING_APPROVAL' && (
                          <span className="text-[var(--accent-amber)] flex items-center gap-1 font-semibold animate-pulse">
                            <Clock className="w-3.5 h-3.5" /> PENDING
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 text-right">
                        {log.status === 'PENDING_APPROVAL' ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => approveAudit(log.id)}
                              className="px-3 py-1 rounded-full bg-[var(--accent-green)] hover:opacity-90 text-white font-medium text-[11px] shadow-sm transition-all"
                            >
                              批准 (Approve)
                            </button>
                            <button
                              onClick={() => rejectAudit(log.id)}
                              className="px-3 py-1 rounded-full bg-[var(--accent-red)] hover:opacity-90 text-white font-medium text-[11px] shadow-sm transition-all"
                            >
                              驳回 (Reject)
                            </button>
                          </div>
                        ) : (
                          <span className="theme-text-muted text-[10px]">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
