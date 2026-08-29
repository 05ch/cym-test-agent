import React from 'react';
import { Box, Text } from 'ink';

interface ApprovalModalProps {
  toolName: string;
  requiredCapability: string;
  args: Record<string, any>;
  onApprove: () => void;
  onReject: () => void;
}

export const ApprovalModal: React.FC<ApprovalModalProps> = ({
  toolName,
  requiredCapability,
  args
}) => {
  return (
    <Box
      borderStyle="double"
      borderColor="red"
      paddingX={2}
      paddingY={1}
      flexDirection="column"
      gap={1}
    >
      <Box justifyContent="space-between">
        <Text bold color="redBright">
          ▲ CAPABILITY ELEVATION REQUEST REQUIRED (Level 3 Sandbox)
        </Text>
      </Box>

      <Box flexDirection="column">
        <Text color="white">Tool Requested: <Text bold color="yellow">{toolName}</Text></Text>
        <Text color="white">Required Capability: <Text bold color="red">{requiredCapability}</Text></Text>
        <Text color="gray">Arguments: {JSON.stringify(args, null, 2)}</Text>
      </Box>

      <Box marginTop={1} gap={2}>
        <Text bold color="green">
          Press [a] to APPROVE capability
        </Text>
        <Text color="gray">|</Text>
        <Text bold color="red">
          Press [x] to REJECT tool call
        </Text>
      </Box>
    </Box>
  );
};
