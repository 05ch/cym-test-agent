import React from 'react';
import { Box, Text } from 'ink';
import { CompositeScoreBreakdown } from '@testagent/protocol';

interface ScoreCardProps {
  score: CompositeScoreBreakdown;
  mutantsKilled: number;
  totalMutants: number;
}

export const ScoreCard: React.FC<ScoreCardProps> = ({ score, mutantsKilled, totalMutants }) => {
  const getScoreColor = (val: number) => {
    if (val >= 90) return 'green';
    if (val >= 75) return 'yellow';
    return 'red';
  };

  return (
    <Box borderStyle="single" borderColor="cyan" paddingX={1} flexDirection="column" gap={1}>
      <Box justifyContent="space-between">
        <Text bold color="cyan">
          📊 三层质量评估与六维综合评分 (Multi-Layer Scoring Card)
        </Text>
        <Text bold color={getScoreColor(score.compositeScore)}>
          Composite Score: {score.compositeScore} / 100
        </Text>
      </Box>

      {/* Layer breakdown */}
      <Box flexDirection="column" gap={1}>
        <Box borderStyle="single" borderColor="gray" paddingX={1} justifyContent="space-between">
          <Box flexDirection="column">
            <Text bold color="white">Layer 1: 硬性断言 (Hard Assertions - Weight 40%)</Text>
            <Text color="gray">TypeScript 编译通过率 100% | 退出码 0 | 生产代码无违规修改</Text>
          </Box>
          <Text bold color={getScoreColor(score.correctness)}>
            {score.correctness} / 100
          </Text>
        </Box>

        <Box borderStyle="single" borderColor="gray" paddingX={1} justifyContent="space-between">
          <Box flexDirection="column">
            <Text bold color="white">Layer 2: 行为与变异测试 (Mutation Power - Weight 25%)</Text>
            <Text color="gray">
              变异击杀率: {mutantsKilled}/{totalMutants} Mutants Killed ({(mutantsKilled / totalMutants * 100).toFixed(1)}%)
            </Text>
          </Box>
          <Text bold color={getScoreColor(score.mutationPower)}>
            {score.mutationPower} / 100
          </Text>
        </Box>

        <Box borderStyle="single" borderColor="gray" paddingX={1} justifyContent="space-between">
          <Box flexDirection="column">
            <Text bold color="white">Layer 3: 约束与效能 (Scope, Efficiency, Stability - Weight 35%)</Text>
            <Text color="gray">
              Scope: {score.scopeDiscipline} | Efficiency: {score.efficiency} | Stability: {score.stability}
            </Text>
          </Box>
          <Text bold color="green">
            PASS
          </Text>
        </Box>
      </Box>

      <Box borderStyle="single" borderColor="blue" paddingX={1}>
        <Text color="blueBright">
          Score Formula: 0.40·Correctness + 0.25·Mutation + 0.15·Scope + 0.10·Efficiency + 0.10·Stability
        </Text>
      </Box>
    </Box>
  );
};
