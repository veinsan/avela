import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AreaProvider } from './src/context/AreaContext';
import { AuthProvider } from './src/context/AuthContext';
import { UpdatesProvider } from './src/context/UpdatesContext';
import RootNavigator from './src/navigation/RootNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <AreaProvider>
          <UpdatesProvider>
            <RootNavigator />
            <StatusBar style="light" />
          </UpdatesProvider>
        </AreaProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
