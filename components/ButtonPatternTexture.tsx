import { Box, Text } from '../theme';
import { TouchableOpacity } from 'react-native';
import { useStore } from '../store/useStore';
import { useTheme } from '@shopify/restyle';

export function ButtonPatternTexture() {
  const usePatternTexture = useStore((state) => state.usePatternTexture);
  const togglePatternTexture = useStore((state) => state.togglePatternTexture);
  const theme = useTheme();

  return (
    <TouchableOpacity
      onPress={togglePatternTexture}
      activeOpacity={0.8}
      style={{
        backgroundColor: usePatternTexture ? theme.colors.accent : theme.colors.primary,
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
      <Text variant="button">
        {usePatternTexture ? '◐ Pattern on' : '◐ Pattern'}
      </Text>
    </TouchableOpacity>
  );
}
