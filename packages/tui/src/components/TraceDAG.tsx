import React from 'react';
import { Box, Text } from 'ink';
import { SimulatedStep } from '../mock/simulatedEngine.js';

interface TraceDAGProps {
  steps: SimulatedStep[];
  selectedStepIndex: number;
}

export const TraceDAG: React.FC<TraceDAGProps> = ({ steps, selectedStepIndex }) => {
  const getStatusIcon = (status: SimulatedStep['status']) => {
    switch (status) {
      case 'completed':
        return <Text color="green">✔</Text>;
      case 'running':
        return <Text color="yellow">▶</Text>;
      case 'waiting_approval':
        return <Text color="red">▲</Text>;
      case 'failed':
        return <Text color="red">✖</Text>;
      default:
        return <Text color="gray">○</Text>;
    }
  };

  const selectedStep = steps[selectedStepIndex] || steps[0];

  return (
    <Box flexDirection="column" gap={1}>
      {/* Left-to-Right Step Pipeline Overview */}
      <Box borderStyle="single" borderColor="blue" paddingX={1} flexDirection="column">
        <Text bold color="blueBright">● 黄金质量执行链路 (The Golden Loop Trace)</Text>
        <Box marginTop={1} flexWrap="wrap" gap={1}>
          {steps.map((step, idx) => {
            const isSelected = idx === selectedStepIndex;
            return (
              <Box key={step.id} gap={1}>
                <Box
                  borderStyle={isSelected ? 'double' : 'single'}
                  borderColor={isSelected ? 'cyan' : step.status === 'completed' ? 'green' : 'gray'}
                  paddingX={1}
                >
                  <Text color={isSelected ? 'cyan' : 'white'} bold={isSelected}>
                    {getStatusIcon(step.status)} {step.name.split(' ')[1] || step.name}
                  </Text>
                  {step.durationMs && (
                    <Text color="gray"> ({step.durationMs}ms)</Text>
                  )}
                </Box>
                {idx < steps.length - 1 && <Text color="gray">→</Text>}
              </Box>
            );
          })}
        </Box>
      </Box>

      {/* Detailed Step Inspector */}
      {selectedStep && (
        <Box borderStyle="single" borderColor="gray" paddingX={1} flexDirection="column">
          <Box justifyContent="space-between">
            <Text bold color="cyan">
              Step Detail: {selectedStep.name}
            </Text>
            <Text color="gray">
              Status: <Text color={selectedStep.status === 'completed' ? 'green' : 'yellow'}>{selectedStep.status.toUpperCase()}</Text> | Duration: {selectedStep.durationMs || 0}ms
            </Text>
          </Box>

          <Box marginTop={1} flexDirection="column">
            <Text bold color="white">🧠 决策与推理摘要 (Reasoning Summary):</Text>
            <Box marginLeft={2} marginTop={1}>
              <Text color="yellow">{selectedStep.reasoningSummary || 'Executing step heuristics...'}</Text>
            </Box>
          </Box>

          {selectedStep.toolCall && (
            <Box marginTop={1} flexDirection="column" borderStyle="single" borderColor="gray" paddingX={1}>
              <Text bold color="magenta">🔧 Tool Execution: {selectedStep.toolCall.name}</Text>
              <Text color="gray">Args: {JSON.stringify(selectedStep.toolCall.args)}</Text>
              {selectedStep.toolCall.requiredCapability && (
                <Text color="redBright">Required Capability: {selectedStep.toolCall.requiredCapability}</Text>
              )}
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};
