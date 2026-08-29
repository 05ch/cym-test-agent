import React from 'react';
import { AppProvider, useApp } from './context/AppContext.js';
import { Header } from './components/common/Header.js';
import { BuildDomain } from './components/build/BuildDomain.js';
import { RunDomain } from './components/run/RunDomain.js';
import { EvaluateDomain } from './components/evaluate/EvaluateDomain.js';
import { GovernDomain } from './components/govern/GovernDomain.js';
import { Database, HardDrive, Shield } from 'lucide-react';

const MainLayout: React.FC = () => {
  const { activeDomain, isSimulating } = useApp();

  return (
    <div className="min-h-screen flex flex-col theme-canvas theme-text-primary transition-colors duration-250">
      {/* Top Apple & ChatGPT Style Header */}
      <Header />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* Active Simulation Notice */}
        {isSimulating && (
          <div className="p-4 rounded-3xl theme-surface border border-[var(--accent-blue)]/40 shadow-sm flex items-center justify-between animate-pulse">
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-[var(--accent-blue)] animate-ping"></div>
              <span className="text-xs font-semibold theme-text-primary">
                评测引擎正在推进：AST 解析 ➔ 测试生成 ➔ 沙箱 Vitest 执行 ➔ 变异注入 ➔ 评分计算...
              </span>
            </div>
            <span className="text-[11px] font-mono text-[var(--accent-blue)] font-semibold">Live Event Stream Active</span>
          </div>
        )}

        {/* 4 Core Domains Render */}
        {activeDomain === 'BUILD' && <BuildDomain />}
        {activeDomain === 'RUN' && <RunDomain />}
        {activeDomain === 'EVALUATE' && <EvaluateDomain />}
        {activeDomain === 'GOVERN' && <GovernDomain />}
      </main>

      {/* Bottom Liquid Glass Footer */}
      <footer className="liquid-glass-header py-3.5 px-4 text-xs theme-text-secondary mt-auto">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-5 text-[11px] font-mono">
            <div className="flex items-center gap-1.5 text-[var(--accent-green)] font-medium">
              <Database className="w-3.5 h-3.5" />
              <span>SQLite WAL Active</span>
            </div>
            <div className="flex items-center gap-1.5 text-[var(--accent-blue)] font-medium">
              <HardDrive className="w-3.5 h-3.5" />
              <span>Artifact Store: SHA-256</span>
            </div>
            <div className="flex items-center gap-1.5 theme-text-secondary font-medium">
              <Shield className="w-3.5 h-3.5 text-[var(--accent-amber)]" />
              <span>Capability Policy: STRICT</span>
            </div>
          </div>

          <div className="text-[11px] theme-text-muted font-medium">
            TestAgent Studio & Eval v2.0 (PRD & Tech Spec Compliant)
          </div>
        </div>
      </footer>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
};

export default App;
