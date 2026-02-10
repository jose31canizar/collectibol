import { enableScreens } from 'react-native-screens';
import { Stack } from 'expo-router';
import { ThemeProvider } from '@shopify/restyle';
import { theme } from '../theme/theme';

enableScreens({ shouldUseLegacyImplementation: true });

export default function RootLayout() {
  return (
    <ThemeProvider theme={theme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
      </Stack>
    </ThemeProvider>
  );
}
