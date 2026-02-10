import { Box, Text } from '../theme';
import { TouchableOpacity } from 'react-native';
import { useStore } from '../store/useStore';
import { generateProceduralInstance } from '../utils/proceduralGeneration';
import { useTheme } from '@shopify/restyle';

export function ButtonCreate() {
  const addInstance = useStore((state) => state.addInstance);
  const theme = useTheme();

  function handlePress() {
    const newInstance = generateProceduralInstance();
    addInstance(newInstance);
  }

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.8}
      style={{
        backgroundColor: theme.colors.primary,
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
      <Text variant="button">✨ Create Object</Text>
    </TouchableOpacity>
  );
}
