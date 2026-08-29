import React from 'react';
import { Box, Text } from 'ink';

interface FooterBarProps {
  status: string;
}

export const FooterBar: React.FC<FooterBarProps> = () => {
  return (
    <Box borderStyle="single" borderColor="gray" paddingX={1} justifyContent="space-between">
      <Box gap={1} flexWrap="wrap">
        <Text color="gray">Hotkeys:</Text>
        <Text color="cyan">[1-5] Tabs</Text>
        <Text color="green">[d] Diff</Text>
        <Text color="magenta">[t] Stdout</Text>
        <Text color="yellow">[a/x] Approve/Reject</Text>
        <Text color="white">[Space] Run/Pause</Text>
        <Text color="blueBright">[Ctrl+R] Retry</Text>
        <Text color="red">[Ctrl+C] Interrupt</Text>
        <Text color="gray">[q] Quit</Text>
      </Box>
    </Box>
  );
};
