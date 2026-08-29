import React, { useState } from 'react';
import {
  Boxes,
  Activity,
  Award,
  ShieldCheck,
  Play,
  GitFork,
  Layers,
  ChevronDown,
  Sun,
  Moon,
  Compass
} from 'lucide-react';
import { useApp } from '../../context/AppContext.js';
import { DomainType } from '../../types/index.js';

export const Header: React.FC = () => {
  const {
    activeDomain,
    setActiveDomain,
    theme,
    toggleTheme,
    evalCases,
    selectedCase,
    setSelectedCase,
    isSimulating,
    triggerSimulation,
    forkedSessionsCount
  } = useApp();

  const [showCaseDropdown, setShowCaseDropdown] = useState(false);

  const navItems: { id: DomainType; label: string; icon: React.ReactNode }[] = [
    { id: 'BUILD', label: '资产构建', icon: <Boxes className="w-3.5 h-3.5" /> },
    { id: 'RUN', label: '运行时追踪', icon: <Activity className="w-3.5 h-3.5" /> },
    { id: 'EVALUATE', label: '质量评测', icon: <Award className="w-3.5 h-3.5" /> },
    { id: 'GOVERN', label: '策略治理', icon: <ShieldCheck className="w-3.5 h-3.5" /> }
  ];

  return (
    <header className="sticky top-0 z-50 liquid-glass-header px-4 sm:px-6 py-2.5 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand with Apple/ChatGPT Minimalist Typography */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-2xl theme-surface flex items-center justify-center shadow-sm">
            <Compass className="w-4 h-4 text-[var(--accent-blue)]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-sm tracking-tight theme-text-primary">
                TestAgent Studio
              </span>
              <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded-full theme-surface-subtle theme-text-muted">
                v2.0
              </span>
            </div>
            <p className="text-[10px] theme-text-secondary font-medium leading-none mt-0.5">
              Agent 质量闭环与评测基础设施
            </p>
          </div>
        </div>

        {/* Cupertino Pill Segmented Control */}
        <nav className="flex items-center p-1 rounded-full theme-surface-subtle">
          {navItems.map(item => {
            const isActive = activeDomain === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveDomain(item.id)}
                className={`flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                  isActive
                    ? 'theme-surface theme-text-primary shadow-sm font-semibold'
                    : 'theme-text-muted hover:theme-text-primary'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2.5">
          {/* Active Eval Case Selector */}
          <div className="relative">
            <button
              onClick={() => setShowCaseDropdown(!showCaseDropdown)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full theme-surface text-xs theme-text-primary font-medium transition-all shadow-sm"
            >
              <Layers className="w-3.5 h-3.5 text-[var(--accent-blue)]" />
              <span className="max-w-[140px] truncate">{selectedCase.name}</span>
              <ChevronDown className="w-3 h-3 theme-text-muted" />
            </button>

            {showCaseDropdown && (
              <div className="absolute right-0 mt-2 w-80 rounded-3xl theme-surface shadow-2xl py-2 z-50 animate-fadeIn">
                <div className="px-3.5 py-1 text-[10px] font-bold uppercase tracking-wider theme-text-muted">
                  测试用例集 (Eval Cases)
                </div>
                {evalCases.map(ec => (
                  <button
                    key={ec.id}
                    onClick={() => {
                      setSelectedCase(ec);
                      setShowCaseDropdown(false);
                    }}
                    className={`w-full text-left px-3.5 py-2 text-xs flex flex-col gap-0.5 hover:bg-[var(--bg-surface-hover)] transition-colors ${
                      ec.id === selectedCase.id
                        ? 'bg-[var(--accent-blue-subtle)] text-[var(--accent-blue)] font-semibold'
                        : 'theme-text-primary'
                    }`}
                  >
                    <span className="truncate">{ec.name}</span>
                    <span className="text-[10px] theme-text-muted font-mono">commit: {ec.repoCommitSha}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Fork Counter */}
          {forkedSessionsCount > 0 && (
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full badge-blue text-xs font-mono font-medium">
              <GitFork className="w-3 h-3" />
              <span>{forkedSessionsCount} Forks</span>
            </div>
          )}

          {/* Light / Dark Mode Toggle */}
          <button
            onClick={toggleTheme}
            className="w-8 h-8 rounded-full flex items-center justify-center theme-surface theme-text-primary hover:scale-105 active:scale-95 transition-all shadow-sm"
            title={`切换为${theme === 'dark' ? '浅色' : '深色'}模式`}
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-[var(--accent-amber)]" />
            ) : (
              <Moon className="w-4 h-4 text-slate-700" />
            )}
          </button>

          {/* Primary Action Button */}
          <button
            onClick={() => triggerSimulation('claude-3-7-sonnet')}
            disabled={isSimulating}
            className={`theme-btn-primary flex items-center gap-1.5 px-4 py-1.5 text-xs ${
              isSimulating ? 'opacity-70 cursor-not-allowed animate-pulse' : ''
            }`}
          >
            <Play className={`w-3.5 h-3.5 fill-current ${isSimulating ? 'animate-spin' : ''}`} />
            <span>{isSimulating ? '执行中...' : '发起评测'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
