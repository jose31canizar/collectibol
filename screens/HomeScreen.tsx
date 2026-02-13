import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Scene3D } from '../components/Scene3D';
import { ButtonCreate } from '../components/ButtonCreate';
import { ButtonClear } from '../components/ButtonClear';
import { ButtonShaderToggle } from '../components/ButtonShaderToggle';
import { ButtonPatternTexture } from '../components/ButtonPatternTexture';
import { InfoPanel } from '../components/InfoPanel';
import { ScrollView, View } from 'react-native';
import { Box, theme } from '../theme';

export default function HomeScreen() {
  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
      <StatusBar style="light" />
      <View style={{ flex: 1, backgroundColor: 'red' }}>
        <Scene3D />
      </View>
      <Box>
        <ScrollView
          style={{
            backgroundColor: theme.colors.backgroundOverlay,
          }}
          contentContainerStyle={{ padding: theme.spacing.md }}
        >
          <InfoPanel />
          <Box flexDirection="row" justifyContent="space-between" marginBottom="md">
            <ButtonCreate />
            <ButtonClear />
          </Box>
          <Box flexDirection="row" justifyContent="space-between" marginBottom="md">
            <ButtonShaderToggle />
            <ButtonPatternTexture />
          </Box>
        </ScrollView>
      </Box>
    </SafeAreaView >
  );
}
