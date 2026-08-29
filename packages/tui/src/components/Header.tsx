import React from 'react';
import { Box, Text } from 'ink';

interface HeaderProps {
  status: 'IDLE' | 'RUNNING' | 'WAITING_APPROVAL' | 'PAUSED' | 'COMPLETED' | 'FAILED';
  evalCaseName: string;
  datasetVersion: string;
  modelName: string;
  activeTab: number;
  tokens: { input: number; output: number; cacheSaved: number };
}

export const Header: React.FC<HeaderProps> = ({
  status,
  evalCaseName,
  datasetVersion,
  modelName,
  activeTab,
  tokens
}) => {
  const getStatusBadge = () => {
    switch (status) {
      case 'RUNNING':
        return <Text color="yellow" bold>● RUNNING</Text>;
      case 'WAITING_APPROVAL':
        return <Text color="red" bold>▲ PERM REQUEST</Text>;
      case 'PAUSED':
        return <Text color="cyan" bold>❚❚ PAUSED</Text>;
      case 'COMPLETED':
        return <Text color="green" bold>✔ PASSED</Text>;
      case 'FAILED':
        return <Text color="red" bold>✖ FAILED</Text>;
      default:
        return <Text color="gray">○ IDLE</Text>;
    }
  };

  const tabs = [
    { key: 1, label: '1.DAG Trace' },
    { key: 2, label: '2.Diff (d)' },
    { key: 3, label: '3.Stdout (t)' },
    { key: 4, label: '4.Scoring' },
    { key: 5, label: '5.Help' }
  ];

  return (
    <Box flexDirection="column" borderStyle="single" borderColor="gray" paddingX={1}>
      <Box justifyContent="space-between">
        <Box gap={1}>
          <Text bold color="cyan">
            TestAgent Studio TUI
          </Text>
          <Text color="gray">v2.0</Text>
          <Text color="gray">|</Text>
          <Text color="white">Case: <Text bold color="magenta">{evalCaseName}</Text>@{datasetVersion}</Text>
        </Box>
        <Box gap={1}>
          <Text color="gray">Model: <Text color="blueBright">{modelName}</Text></Text>
          <Text color="gray">|</Text>
          <Text color="gray">Tokens: <Text color="white">{tokens.input + tokens.output}</Text> (Cached: <Text color="green">{tokens.cacheSaved}</Text>)</Text>
          <Text color="gray">|</Text>
          {getStatusBadge()}
        </Box>
      </Box>

      <Box marginTop={1} gap={2}>
        {tabs.map(tab => (
          <Text
            key={tab.key}
            color={activeTab === tab.key ? 'cyan' : 'gray'}
            bold={activeTab === tab.key}
            underline={activeTab === tab.key}
          >
            {tab.label}
          </Text>
        ))}
      </Box>
    </Box>
  );
};
