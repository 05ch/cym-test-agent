import React from 'react';
import { Box, Text } from 'ink';

interface StdoutLogViewerProps {
  stdoutText: string;
  scrollOffset?: number;
  maxWindowSize?: number;
}

export const StdoutLogViewer: React.FC<StdoutLogViewerProps> = ({
  stdoutText,
  scrollOffset = 0,
  maxWindowSize = 20
}) => {
  const allLines = stdoutText.split('\n');
  const total = allLines.length;
  const startIndex = Math.max(0, Math.min(scrollOffset, total - maxWindowSize));
  const visibleLines = allLines.slice(startIndex, startIndex + maxWindowSize);

  return (
    <Box borderStyle="single" borderColor="magenta" paddingX={1} flexDirection="column">
      <Box justifyContent="space-between">
        <Text bold color="magenta">
          🖥️ Sandbox Stdout & Execution Log (Press 't' to toggle)
        </Text>
        <Text color="gray">
          Lines {startIndex + 1}-{Math.min(startIndex + maxWindowSize, total)} of {total} (Virtual Windowing Protected)
        </Text>
      </Box>
      <Box marginTop={1} flexDirection="column">
        {visibleLines.map((line, i) => {
          let lineElem = <Text color="white">{line}</Text>;
          if (line.includes('✓') || line.includes('PASSED') || line.includes('passed')) {
            lineElem = <Text color="green">{line}</Text>;
          } else if (line.includes('✖') || line.includes('FAIL') || line.includes('Error')) {
            lineElem = <Text color="red">{line}</Text>;
          } else if (line.includes('[Layer') || line.includes('[Sandbox')) {
            lineElem = <Text color="cyan">{line}</Text>;
          } else if (line.includes('KILLED')) {
            lineElem = <Text color="greenBright">{line}</Text>;
          } else if (line.includes('SURVIVED')) {
            lineElem = <Text color="yellowBright">{line}</Text>;
          }

          return (
            <Box key={startIndex + i}>
              <Text color="gray">{String(startIndex + i + 1).padStart(3, ' ')} | </Text>
              {lineElem}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};
