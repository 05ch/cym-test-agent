import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  EvalDataset,
  EvalCase,
  ExperimentRun,
  CompositeScoreBreakdown,
  calculateCompositeScore
} from '@testagent/protocol';
import {
  DomainType,
  DAGNode,
  MutantDetail,
  SkillPackage,
  ToolContract,
  SandboxPoolStatus,
  ProviderConfig,
  AuditLog
} from '../types/index.js';
import {
  MOCK_DATASETS,
  MOCK_EVAL_CASES,
  MOCK_SKILL_PACKAGES,
  MOCK_TOOL_CONTRACTS,
  MOCK_DAG_NODES,
  MOCK_MUTANTS,
  MOCK_RUN_MATRIX,
  MOCK_SANDBOX_POOLS,
  MOCK_PROVIDER_CONFIGS,
  MOCK_AUDIT_LOGS
} from '../mock/datasets.js';

interface AppContextType {
  activeDomain: DomainType;
  setActiveDomain: (domain: DomainType) => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  datasets: EvalDataset[];
  evalCases: EvalCase[];
  selectedCase: EvalCase;
  setSelectedCase: (ec: EvalCase) => void;
  runs: ExperimentRun[];
  activeRun: ExperimentRun;
  dagNodes: DAGNode[];
  selectedNodeId: string;
  setSelectedNodeId: (id: string) => void;
  mutants: MutantDetail[];
  skillPackages: SkillPackage[];
  toolContracts: ToolContract[];
  sandboxPools: SandboxPoolStatus[];
  providerConfigs: ProviderConfig[];
  auditLogs: AuditLog[];
  isSimulating: boolean;
  simulationStepIndex: number;
  triggerSimulation: (modelId?: string) => void;
  forkSession: (fromStepId: string, customPrompt: string) => void;
  approveAudit: (auditId: string) => void;
  rejectAudit: (auditId: string) => void;
  forkedSessionsCount: number;
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeDomain, setActiveDomain] = useState<DomainType>('RUN');
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [datasets] = useState<EvalDataset[]>(MOCK_DATASETS);
  const [evalCases] = useState<EvalCase[]>(MOCK_EVAL_CASES);
  const [selectedCase, setSelectedCase] = useState<EvalCase>(MOCK_EVAL_CASES[0]);
  const [runs, setRuns] = useState<ExperimentRun[]>(MOCK_RUN_MATRIX);
  const [activeRun, setActiveRun] = useState<ExperimentRun>(MOCK_RUN_MATRIX[0]);
  const [dagNodes, setDagNodes] = useState<DAGNode[]>(MOCK_DAG_NODES);
  const [selectedNodeId, setSelectedNodeId] = useState<string>('node_1');
  const [mutants, setMutants] = useState<MutantDetail[]>(MOCK_MUTANTS);
  const [skillPackages] = useState<SkillPackage[]>(MOCK_SKILL_PACKAGES);
  const [toolContracts] = useState<ToolContract[]>(MOCK_TOOL_CONTRACTS);
  const [sandboxPools] = useState<SandboxPoolStatus[]>(MOCK_SANDBOX_POOLS);
  const [providerConfigs] = useState<ProviderConfig[]>(MOCK_PROVIDER_CONFIGS);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(MOCK_AUDIT_LOGS);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simulationStepIndex, setSimulationStepIndex] = useState<number>(5);
  const [forkedSessionsCount, setForkedSessionsCount] = useState<number>(0);

  // Sync theme with HTML class
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const triggerSimulation = (modelId = 'claude-3-7-sonnet') => {
    setIsSimulating(true);
    setSimulationStepIndex(0);
    setActiveDomain('RUN');

    // Reset DAG nodes to pending
    setDagNodes(prev =>
      prev.map((node, i) => ({
        ...node,
        status: i === 0 ? 'running' : 'idle'
      }))
    );
    setSelectedNodeId('node_1');

    let current = 0;
    const interval = setInterval(() => {
      current += 1;
      if (current >= MOCK_DAG_NODES.length) {
        clearInterval(interval);
        setIsSimulating(false);
        setDagNodes(prev => prev.map(n => ({ ...n, status: 'completed' })));
        setSimulationStepIndex(5);

        // Add a new completed run
        const newScore: CompositeScoreBreakdown = calculateCompositeScore({
          correctness: 100,
          mutationPower: 75,
          scopeDiscipline: 100,
          efficiency: Math.floor(80 + Math.random() * 15),
          stability: Math.floor(90 + Math.random() * 10)
        });

        const newRun: ExperimentRun = {
          id: `run_${Date.now()}`,
          evalCaseId: selectedCase.id,
          experimentTag: `${modelId} (Live Simulation #${runs.length + 1})`,
          modelId,
          skillVersion: 'vitest-unit-generator@2.1.0',
          contextStrategy: 'Durable-Cache + Sliding-Window',
          sandboxBackend: 'Local-Process-Sandbox',
          status: 'passed',
          compositeScore: newScore.compositeScore,
          scoreBreakdown: newScore,
          reproductionBundle: {
            repoCommitSha: selectedCase.repoCommitSha,
            worktreeDiff: 'tests/payment/PaymentProcessor.test.ts (+48 lines)',
            prompt: selectedCase.taskPrompt,
            modelId,
            modelConfig: { temperature: 0.2, reasoningEffort: 'high' },
            seed: Math.floor(Math.random() * 1000),
            skillVersion: 'vitest-unit-generator@2.1.0',
            toolVersions: { ast_analyzer: '1.2.0', sandbox_exec: '2.0.0' },
            sandboxBackend: 'local',
            contextStrategy: 'durable-working'
          },
          createdAt: Date.now() - 5000,
          finishedAt: Date.now(),
          durationMs: 4800
        };

        setRuns(prev => [newRun, ...prev]);
        setActiveRun(newRun);
        return;
      }

      setSimulationStepIndex(current);
      setSelectedNodeId(`node_${current + 1}`);
      setDagNodes(prev =>
        prev.map((node, idx) => {
          if (idx < current) return { ...node, status: 'completed' };
          if (idx === current) return { ...node, status: 'running' };
          return { ...node, status: 'idle' };
        })
      );
    }, 1200);
  };

  const forkSession = (fromStepId: string, customPrompt: string) => {
    setForkedSessionsCount(c => c + 1);
    triggerSimulation('claude-3-7-sonnet (Forked)');
  };

  const approveAudit = (auditId: string) => {
    setAuditLogs(prev =>
      prev.map(item => (item.id === auditId ? { ...item, status: 'ALLOWED' } : item))
    );
  };

  const rejectAudit = (auditId: string) => {
    setAuditLogs(prev =>
      prev.map(item => (item.id === auditId ? { ...item, status: 'DENIED' } : item))
    );
  };

  return (
    <AppContext.Provider
      value={{
        activeDomain,
        setActiveDomain,
        theme,
        toggleTheme,
        datasets,
        evalCases,
        selectedCase,
        setSelectedCase,
        runs,
        activeRun,
        dagNodes,
        selectedNodeId,
        setSelectedNodeId,
        mutants,
        skillPackages,
        toolContracts,
        sandboxPools,
        providerConfigs,
        auditLogs,
        isSimulating,
        simulationStepIndex,
        triggerSimulation,
        forkSession,
        approveAudit,
        rejectAudit,
        forkedSessionsCount
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};
