import React, { useState } from 'react';
import {
  Boxes,
  FileCode,
  CheckCircle2,
  FolderTree,
  Terminal,
  PlayCircle,
  Cpu,
  Layers,
  Sparkles
} from 'lucide-react';
import { useApp } from '../../context/AppContext.js';
import { SkillPackage, ToolContract } from '../../types/index.js';

export const BuildDomain: React.FC = () => {
  const { skillPackages, toolContracts } = useApp();
  const [selectedSkill, setSelectedSkill] = useState<SkillPackage>(skillPackages[0]);
  const [activeSkillTab, setActiveSkillTab] = useState<'manifest' | 'skill_md' | 'schema' | 'fixtures'>('manifest');
  const [selectedTool, setSelectedTool] = useState<ToolContract>(toolContracts[0]);
  const [mockToolResult, setMockToolResult] = useState<string | null>(null);
  const [isExecutingMock, setIsExecutingMock] = useState<boolean>(false);

  const executeMockTool = () => {
    setIsExecutingMock(true);
    setTimeout(() => {
      setIsExecutingMock(false);
      setMockToolResult(
        JSON.stringify(
          {
            status: 'ok',
            executionId: `exec_${Date.now()}`,
            durationMs: 42,
            output: {
              targetFile: selectedTool.samplePayload.targetFilePath || 'PaymentProcessor.ts',
              astNodesFound: 38,
              uncoveredBranches: [
                { line: 78, condition: 'idempotencyStore.has(key)', risk: 'CONCURRENCY_COLLISION' },
                { line: 115, loop: 'while(retryCount < 3)', risk: 'TIMEOUT_RETRY_EXHAUSTION' }
              ]
            }
          },
          null,
          2
        )
      );
    }, 600);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Domain Intro */}
      <div className="theme-surface p-6 rounded-3xl flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Boxes className="w-5 h-5 text-[var(--accent-blue)]" />
            <h2 className="text-base font-semibold theme-text-primary tracking-tight">
              1. 资产构建域 (BUILD)
            </h2>
          </div>
          <p className="text-xs theme-text-secondary mt-1">
            标准化 Capability 能力包、工具严格 JSON Schema 契约、Prompt 编排与预置 Fixtures 验证套件
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-xs badge-blue font-medium px-3 py-1.5 rounded-full">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Skill Package Spec v2.0</span>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Left Column: Skill Packages Explorer */}
        <div className="col-span-12 lg:col-span-6 space-y-4">
          <div className="theme-surface p-6 rounded-3xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold theme-text-primary flex items-center gap-2">
                <FolderTree className="w-4 h-4 text-[var(--accent-blue)]" />
                <span>Skill as a Capability Package</span>
              </h3>
              <span className="text-[11px] theme-text-muted">{skillPackages.length} 个就绪包</span>
            </div>

            {/* Package Selector Cards */}
            <div className="grid grid-cols-2 gap-3">
              {skillPackages.map(pkg => (
                <button
                  key={pkg.id}
                  onClick={() => setSelectedSkill(pkg)}
                  className={`p-3.5 rounded-2xl text-left border transition-all ${
                    selectedSkill.id === pkg.id
                      ? 'bg-[var(--accent-blue-subtle)] border-[var(--accent-blue)] shadow-sm'
                      : 'theme-surface-subtle hover:border-[var(--border-medium)]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold theme-text-primary truncate">{pkg.name}</span>
                    <span className="text-[10px] text-[var(--accent-blue)] font-mono font-medium">v{pkg.version}</span>
                  </div>
                  <p className="text-[11px] theme-text-secondary mt-1 line-clamp-2">{pkg.description}</p>
                  <div className="flex items-center gap-3 mt-2 text-[10px] theme-text-muted font-mono">
                    <span>{pkg.evalsCount} Evals</span>
                    <span>{pkg.fixturesCount} Fixtures</span>
                  </div>
                </button>
              ))}
            </div>

            {/* Package Content Inspector Tabs */}
            <div className="pt-3 border-t theme-border space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium theme-text-secondary">
                  契约文件: <span className="font-mono text-[var(--accent-blue)]">{selectedSkill.name}/</span>
                </span>
                <div className="flex items-center p-0.5 rounded-full theme-surface-subtle text-[11px]">
                  {(['manifest', 'skill_md', 'schema', 'fixtures'] as const).map(tab => (
                    <button
                      key={tab}
                      onClick={() => setActiveSkillTab(tab)}
                      className={`px-2.5 py-1 rounded-full font-medium transition-colors ${
                        activeSkillTab === tab
                          ? 'theme-surface theme-text-primary shadow-sm'
                          : 'theme-text-muted hover:theme-text-primary'
                      }`}
                    >
                      {tab === 'manifest' && 'manifest.yaml'}
                      {tab === 'skill_md' && 'SKILL.md'}
                      {tab === 'schema' && 'schema.json'}
                      {tab === 'fixtures' && 'fixtures/'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Code Preview Box */}
              <div className="theme-code-block p-4 rounded-2xl font-mono text-xs overflow-x-auto max-h-72">
                {activeSkillTab === 'manifest' && (
                  <pre className="text-sky-600 dark:text-sky-300">
                    {JSON.stringify(selectedSkill.manifest, null, 2)}
                  </pre>
                )}
                {activeSkillTab === 'skill_md' && (
                  <pre className="text-emerald-600 dark:text-emerald-300 whitespace-pre-wrap">{selectedSkill.skillMd}</pre>
                )}
                {activeSkillTab === 'schema' && (
                  <pre className="text-amber-600 dark:text-amber-300">{selectedSkill.schemaJson}</pre>
                )}
                {activeSkillTab === 'fixtures' && (
                  <div className="space-y-2 theme-text-secondary">
                    <div className="flex items-center gap-2 theme-text-primary">
                      <FileCode className="w-4 h-4 text-sky-500" />
                      <span>fixtures/mock_payment_gateway.ts</span>
                    </div>
                    <div className="flex items-center gap-2 theme-text-primary">
                      <FileCode className="w-4 h-4 text-sky-500" />
                      <span>fixtures/sample_idempotency_table.json</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Tool Contracts & JSON Schema Playground */}
        <div className="col-span-12 lg:col-span-6 space-y-4">
          <div className="theme-surface p-6 rounded-3xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold theme-text-primary flex items-center gap-2">
                <Terminal className="w-4 h-4 text-[var(--accent-blue)]" />
                <span>Tool 契约与 Schema 校验台</span>
              </h3>
              <span className="text-[10px] text-[var(--accent-amber)] font-mono font-medium">严格 JSON Schema 校验</span>
            </div>

            {/* Tool Selector Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {toolContracts.map(tool => (
                <button
                  key={tool.name}
                  onClick={() => {
                    setSelectedTool(tool);
                    setMockToolResult(null);
                  }}
                  className={`px-3 py-1.5 rounded-full text-xs font-mono font-medium border whitespace-nowrap transition-colors ${
                    selectedTool.name === tool.name
                      ? 'bg-[var(--accent-blue)] text-white border-[var(--accent-blue)] shadow-sm'
                      : 'theme-surface-subtle theme-text-secondary hover:border-[var(--border-medium)]'
                  }`}
                >
                  {tool.name} <span className="text-[10px] opacity-75">v{tool.version}</span>
                </button>
              ))}
            </div>

            {/* Selected Tool Details */}
            <div className="p-4 rounded-2xl theme-surface-subtle space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium theme-text-primary">{selectedTool.description}</span>
                <span className="px-2.5 py-0.5 rounded-full badge-red text-[10px] font-mono font-medium">
                  {selectedTool.requiredCapability}
                </span>
              </div>

              {/* Sample Payload Editor */}
              <div className="pt-2">
                <div className="flex items-center justify-between text-[11px] theme-text-muted mb-1.5">
                  <span>单步入参 (Sample Input Payload):</span>
                  <button
                    onClick={executeMockTool}
                    disabled={isExecutingMock}
                    className="theme-btn-primary flex items-center gap-1 text-xs px-3 py-1 font-semibold disabled:opacity-50"
                  >
                    <PlayCircle className="w-3.5 h-3.5" />
                    <span>{isExecutingMock ? '执行中...' : 'Mock 执行'}</span>
                  </button>
                </div>
                <div className="theme-code-block p-3 rounded-xl text-xs font-mono text-sky-600 dark:text-sky-300">
                  <pre>{JSON.stringify(selectedTool.samplePayload, null, 2)}</pre>
                </div>
              </div>

              {/* Execution Result Box */}
              {mockToolResult && (
                <div className="pt-2 animate-fadeIn">
                  <div className="text-[11px] text-[var(--accent-green)] font-semibold mb-1 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Schema 校验通过，Mock 输出返回:</span>
                  </div>
                  <div className="theme-code-block p-3 rounded-xl border-emerald-500/30 text-xs font-mono text-emerald-600 dark:text-emerald-300 max-h-48 overflow-y-auto">
                    <pre>{mockToolResult}</pre>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
