import React, { useState, useEffect } from 'react';
import { render, Box, Text, useInput, useApp } from 'ink';
import { Header } from './components/Header.js';
import { TraceDAG } from './components/TraceDAG.js';
import { DiffViewer } from './components/DiffViewer.js';
import { StdoutLogViewer } from './components/StdoutLogViewer.js';
import { ScoreCard } from './components/ScoreCard.js';
import { ApprovalModal } from './components/ApprovalModal.js';
import { FooterBar } from './components/FooterBar.js';
import {
  INITIAL_STEPS,
  SAMPLE_DIFF,
  SAMPLE_STDOUT,
  INITIAL_SCORE,
  SimulatedStep
} from './mock/simulatedEngine.js';

const App: React.FC = () => {
  const { exit } = useApp();
  const [activeTab, setActiveTab] = useState<number>(1);
  const [selectedStepIndex, setSelectedStepIndex] = useState<number>(0);
  const [steps, setSteps] = useState<SimulatedStep[]>(INITIAL_STEPS);
  const [status, setStatus] = useState<'IDLE' | 'RUNNING' | 'WAITING_APPROVAL' | 'PAUSED' | 'COMPLETED' | 'FAILED'>('COMPLETED');
  const [tokens, setTokens] = useState({ input: 2450, output: 970, cacheSaved: 1800 });
  const [waitingApproval, setWaitingApproval] = useState<boolean>(false);
  const [approvalDetails, setApprovalDetails] = useState<{
    toolName: string;
    requiredCapability: string;
    args: Record<string, any>;
  } | null>(null);

  // Keyboard Hotkeys
  useInput((input, key) => {
    // Ctrl + C: Interrupt / Pause
    if (key.ctrl && input === 'c') {
      setStatus(prev => (prev === 'RUNNING' ? 'PAUSED' : prev));
      return;
    }

    // Quit
    if (input === 'q') {
      exit();
      return;
    }

    // Toggle Diff view (d)
    if (input === 'd') {
      setActiveTab(prev => (prev === 2 ? 1 : 2));
      return;
    }

    // Toggle Stdout log view (t)
    if (input === 't') {
      setActiveTab(prev => (prev === 3 ? 1 : 3));
      return;
    }

    // Number keys for tabs
    if (['1', '2', '3', '4', '5'].includes(input)) {
      setActiveTab(parseInt(input, 10));
      return;
    }

    // Up/Down / Left/Right for steps
    if (key.leftArrow || input === 'h') {
      setSelectedStepIndex(prev => Math.max(0, prev - 1));
    }
    if (key.rightArrow || input === 'l') {
      setSelectedStepIndex(prev => Math.min(steps.length - 1, prev + 1));
    }

    // Space: Toggle Play/Pause Simulation
    if (input === ' ') {
      if (status === 'COMPLETED' || status === 'IDLE') {
        // Restart simulated run
        setStatus('RUNNING');
        setSteps(prev => prev.map((s, idx) => ({ ...s, status: idx === 0 ? 'running' : 'pending' })));
        setSelectedStepIndex(0);
      } else if (status === 'RUNNING') {
        setStatus('PAUSED');
      } else if (status === 'PAUSED') {
        setStatus('RUNNING');
      }
      return;
    }

    // Ctrl + R: Fast Retry
    if (key.ctrl && input === 'r') {
      setStatus('RUNNING');
      setSteps(prev => prev.map((s, idx) => ({ ...s, status: idx === 0 ? 'running' : 'pending' })));
      setSelectedStepIndex(0);
      return;
    }

    // Capability Approval
    if (waitingApproval) {
      if (input === 'a') {
        // Approved
        setWaitingApproval(false);
        setApprovalDetails(null);
        setStatus('RUNNING');
        setSteps(prev =>
          prev.map(s => (s.id === 'step-4' ? { ...s, status: 'completed' } : s))
        );
      } else if (input === 'x') {
        // Rejected
        setWaitingApproval(false);
        setApprovalDetails(null);
        setStatus('FAILED');
        setSteps(prev =>
          prev.map(s => (s.id === 'step-4' ? { ...s, status: 'failed' } : s))
        );
      }
    }
  });

  // Simulated Step Runner when in RUNNING state
  useEffect(() => {
    if (status !== 'RUNNING') return;

    const timer = setInterval(() => {
      setSteps(currentSteps => {
        const runningIdx = currentSteps.findIndex(s => s.status === 'running');
        if (runningIdx === -1) {
          const pendingIdx = currentSteps.findIndex(s => s.status === 'pending');
          if (pendingIdx === -1) {
            setStatus('COMPLETED');
            return currentSteps;
          }
          return currentSteps.map((s, idx) => (idx === pendingIdx ? { ...s, status: 'running' } : s));
        }

        // Check if step 4 needs approval
        if (runningIdx === 3 && !waitingApproval) {
          setWaitingApproval(true);
          setStatus('WAITING_APPROVAL');
          setApprovalDetails({
            toolName: 'sandbox_exec',
            requiredCapability: 'process.spawn:test-runner',
            args: { cmd: 'vitest', args: ['run', 'tests/payment/PaymentProcessor.test.ts'] }
          });
          return currentSteps.map((s, idx) => (idx === 3 ? { ...s, status: 'waiting_approval' } : s));
        }

        const nextSteps = currentSteps.map((s, idx) =>
          idx === runningIdx ? { ...s, status: 'completed' as const } : s
        );

        const nextPending = nextSteps.findIndex(s => s.status === 'pending');
        if (nextPending !== -1) {
          nextSteps[nextPending] = { ...nextSteps[nextPending], status: 'running' as const };
          setSelectedStepIndex(nextPending);
        } else {
          setStatus('COMPLETED');
        }

        setTokens(t => ({ ...t, input: t.input + 320, output: t.output + 140 }));
        return nextSteps;
      });
    }, 1500);

    return () => clearInterval(timer);
  }, [status, waitingApproval]);

  return (
    <Box flexDirection="column" padding={1} width={100}>
      <Header
        status={status}
        evalCaseName="payment-core-eval"
        datasetVersion="1.2"
        modelName="claude-3-7-sonnet"
        activeTab={activeTab}
        tokens={tokens}
      />

      <Box marginY={1}>
        {waitingApproval && approvalDetails ? (
          <ApprovalModal
            toolName={approvalDetails.toolName}
            requiredCapability={approvalDetails.requiredCapability}
            args={approvalDetails.args}
            onApprove={() => {}}
            onReject={() => {}}
          />
        ) : (
          <>
            {activeTab === 1 && (
              <TraceDAG steps={steps} selectedStepIndex={selectedStepIndex} />
            )}
            {activeTab === 2 && <DiffViewer diffText={SAMPLE_DIFF} />}
            {activeTab === 3 && <StdoutLogViewer stdoutText={SAMPLE_STDOUT} />}
            {activeTab === 4 && (
              <ScoreCard score={INITIAL_SCORE} mutantsKilled={3} totalMutants={4} />
            )}
            {activeTab === 5 && (
              <Box borderStyle="single" borderColor="cyan" paddingX={1} flexDirection="column" gap={1}>
                <Text bold color="cyan">⌨️ Keyboard Shortcuts & Operation Guide</Text>
                <Text color="white">• <Text bold color="green">Ctrl + C</Text>: Pause / interrupt active execution</Text>
                <Text color="white">• <Text bold color="green">a / x</Text>: Quick approve / reject capability elevation request</Text>
                <Text color="white">• <Text bold color="green">d</Text>: Toggle generated test code Git Diff</Text>
                <Text color="white">• <Text bold color="green">t</Text>: Toggle terminal Stdout log viewer (Virtual scroll protected)</Text>
                <Text color="white">• <Text bold color="green">Ctrl + R</Text>: Fast retry from step 1 with current context</Text>
                <Text color="white">• <Text bold color="green">1 - 5</Text>: Switch direct view tabs</Text>
                <Text color="white">• <Text bold color="green">Space</Text>: Play / Pause execution simulator</Text>
                <Text color="white">• <Text bold color="green">q</Text>: Exit TUI client</Text>
              </Box>
            )}
          </>
        )}
      </Box>

      <FooterBar status={status} />
    </Box>
  );
};

render(<App />);
