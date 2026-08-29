import React from 'react';
import { Box, Text } from 'ink';

interface DiffViewerProps {
  diffText: string;
  maxLines?: number;
}

export const DiffViewer: React.FC<DiffViewerProps> = ({ diffText, maxLines = 22 }) => {
  const lines = diffText.split('\n');
  const visibleLines = lines.slice(0, maxLines);
  const isTruncated = lines.length > maxLines;

  const renderDiffLine = (line: string, index: number) => {
    if (line.startsWith('+++') || line.startsWith('---')) {
      return (
        <Text key={index} bold color="white">
          {line}
        </Text>
      );
    }
    if (line.startsWith('@@')) {
      return (
        <Text key={index} color="cyan">
          {line}
        </Text>
      );
    }
    if (line.startsWith('+')) {
      return (
        <Text key={index} color="green">
          {line}
        </Text>
      );
    }
    if (line.startsWith('-')) {
      return (
        <Text key={index} color="red">
          {line}
        </Text>
      );
    }
    return (
      <Text key={index} color="gray">
        {line}
      </Text>
    );
  };

  return (
    <Box borderStyle="single" borderColor="green" paddingX={1} flexDirection="column">
      <Box justifyContent="space-between">
        <Text bold color="green">
          📄 Git Patch / Candidate Test Diff (Press 'd' to toggle)
        </Text>
        <Text color="gray">
          Total Lines: {lines.length} {isTruncated ? `(Showing first ${maxLines})` : ''}
        </Text>
      </Box>
      <Box marginTop={1} flexDirection="column">
        {visibleLines.map((line, idx) => renderDiffLine(line, idx))}
        {isTruncated && (
          <Text color="yellow">... [{lines.length - maxLines} more lines truncated for stream protection] ...</Text>
        )}
      </Box>
    </Box>
  );
};
