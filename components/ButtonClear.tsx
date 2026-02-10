import { Box, Text } from '../theme';
import { TouchableOpacity } from 'react-native';
import { useStore } from '../store/useStore';
import { useTheme } from '@shopify/restyle';

export function ButtonClear() {
  const clearAllInstances = useStore((state) => state.clearAllInstances);
  const instances = useStore((state) => state.instances);
  const theme = useTheme();

  if (instances.length === 0) {
    return <Box width={0} height={0} />;
  }

  return (
    <TouchableOpacity
      onPress={clearAllInstances}
      activeOpacity={0.8}
      style={{
        backgroundColor: theme.colors.accent,
        paddingHorizontal: theme.spacing.xl,
        paddingVertical: theme.spacing.lg,
        borderRadius: theme.borderRadii.md,
        shadowColor: theme.colors.shadowColor,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
      }}
    >
      <Text variant="button">🗑️ Clear All</Text>
    </TouchableOpacity>
  );
}
