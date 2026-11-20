// Import each face on its own so only the five used weights ship in the bundle.
import { BricolageGrotesque_600SemiBold } from '@expo-google-fonts/bricolage-grotesque/600SemiBold';
import { BricolageGrotesque_700Bold } from '@expo-google-fonts/bricolage-grotesque/700Bold';
import { Onest_400Regular } from '@expo-google-fonts/onest/400Regular';
import { Onest_500Medium } from '@expo-google-fonts/onest/500Medium';
import { Onest_600SemiBold } from '@expo-google-fonts/onest/600SemiBold';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AreaProvider } from './src/context/AreaContext';
import { AuthProvider } from './src/context/AuthContext';
import { UpdatesProvider } from './src/context/UpdatesContext';
import RootNavigator from './src/navigation/RootNavigator';
import { colors } from './src/theme';
import { logFailure } from './src/utils/log';

// The native splash stays up until RootNavigator knows the session; the cap below keeps it under 3 seconds even
// when the session check waits on a slow network (REQUEST_TIMEOUT_MS is 10 s).
SplashScreen.preventAutoHideAsync().catch((e) => logFailure('holding the splash screen', e));
SplashScreen.setOptions({ fade: true, duration: 200 });

export default function App() {
  useEffect(() => {
    const cap = setTimeout(SplashScreen.hide, 3000);
    return () => clearTimeout(cap);
  }, []);
  // The fonts ship inside the app, so loading them never needs the network.
  const [fontsLoaded, fontError] = useFonts({
    BricolageGrotesque_600SemiBold, BricolageGrotesque_700Bold, Onest_400Regular, Onest_500Medium, Onest_600SemiBold,
  });
  if (!fontsLoaded && !fontError) return <View style={{ flex: 1, backgroundColor: colors.background }} />;
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <AreaProvider>
          <UpdatesProvider>
            <RootNavigator />
            <StatusBar style="dark" />
          </UpdatesProvider>
        </AreaProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
