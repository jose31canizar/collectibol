import { Box, Text } from '../theme';
import { useStore } from '../store/useStore';
import { getShapeDisplayName } from '../utils/proceduralGeneration';

export function InfoPanel() {
  const instances = useStore((state) => state.instances);
  const selectedInstanceId = useStore((state) => state.selectedInstanceId);
  const selectedInstance = instances.find((inst) => inst.id === selectedInstanceId);

  return (
    <Box variant="cardVariants.defaults">
      <Text variant="bodySmall" fontWeight="600">
        Objects: {instances.length}
      </Text>
      {selectedInstance && (
        <Box marginTop="sm" paddingTop="sm" borderTopWidth={1} borderTopColor="borderLight">
          <Text variant="caption" color="textSecondary" fontWeight="600" marginBottom="xs">
            Selected:
          </Text>
          <Text variant="caption" marginTop="xs">
            {getShapeDisplayName(selectedInstance.shapeType)}
          </Text>
          <Text variant="caption" marginTop="xs">
            Color: {selectedInstance.color}
          </Text>
          <Text variant="caption" marginTop="xs">
            Size: {selectedInstance.size.toFixed(2)}
          </Text>
        </Box>
      )}
    </Box>
  );
}
