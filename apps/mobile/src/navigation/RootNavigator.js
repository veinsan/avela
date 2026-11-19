// One APK; the session's role decides the tabs and the two sets never mix (D-15, FR-16).
import { DarkTheme, DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { useAuth } from '../context/AuthContext';
import { useUpdates } from '../context/UpdatesContext';
import { typography, useTheme } from '../theme';
import EmergencyButton from '../components/EmergencyButton';
import { LoadingView, Screen } from '../components/ui';
import AccountScreen from '../screens/AccountScreen';
import AreaPickerScreen from '../screens/AreaPickerScreen';
import EmergencyScreen from '../screens/EmergencyScreen';
import FacilitiesScreen from '../screens/FacilitiesScreen';
import FacilityDetailScreen from '../screens/FacilityDetailScreen';
import GuidanceScreen from '../screens/GuidanceScreen';
import HomeScreen from '../screens/HomeScreen';
import LoginScreen from '../screens/LoginScreen';
import PublishResultScreen from '../screens/PublishResultScreen';
import QueueScreen from '../screens/QueueScreen';
import ReportDetailScreen from '../screens/ReportDetailScreen';
import ReportFormScreen from '../screens/ReportFormScreen';
import ReportsScreen from '../screens/ReportsScreen';
import ResultScreen from '../screens/ResultScreen';
import ReviewScreen from '../screens/ReviewScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Tab name -> [component, title]. Unfinished screens stay out until they work (BRANCH_PLAN).
const TAB_SCREENS = {
  Beranda: [HomeScreen, 'Beranda'],
  Laporan: [ReportsScreen, 'Laporan'],
  Fasilitas: [FacilitiesScreen, 'Fasilitas'],
  Antrean: [QueueScreen, 'Antrean'],
  Akun: [AccountScreen, 'Akun'],
};

export function tabsForRole(role) {
  return role === 'staff' ? ['Antrean', 'Akun'] : ['Beranda', 'Laporan', 'Fasilitas', 'Akun'];
}

const STACK_SCREENS = {
  Masuk: [LoginScreen, 'Masuk'],
  PilihWilayah: [AreaPickerScreen, 'Pilih Wilayah'],
  Panduan: [GuidanceScreen, 'Panduan'],
  Darurat: [EmergencyScreen, 'Darurat'],
  DetailFasilitas: [FacilityDetailScreen, 'Detail Fasilitas'],
  FormLaporan: [ReportFormScreen, 'Form Laporan'],
  DetailLaporan: [ReportDetailScreen, 'Detail Laporan'],
  HasilPemeriksaan: [ResultScreen, 'Hasil Pemeriksaan'],
  TinjauLaporan: [ReviewScreen, 'Tinjau Laporan'],
  TerbitkanHasil: [PublishResultScreen, 'Terbitkan Hasil'],
};

const emergency = () => <EmergencyButton />;

function Tabs() {
  const { account } = useAuth();
  const { count } = useUpdates();
  const { colors } = useTheme();
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.divider, minHeight: 56 },
        tabBarIconStyle: { display: 'none' },
        tabBarLabelStyle: { ...typography.label },
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.text,
        headerRight: emergency,
      }}
    >
      {tabsForRole(account && account.role).map((name) => (
        <Tab.Screen key={name} name={name} component={TAB_SCREENS[name][0]}
          options={{ title: TAB_SCREENS[name][1], tabBarBadge: name === 'Laporan' && count ? count : undefined,
            tabBarAccessibilityLabel: name === 'Laporan' && count ? `Laporan, ${count} pembaruan` : undefined }} />
      ))}
    </Tab.Navigator>
  );
}

export default function RootNavigator() {
  const { status, account } = useAuth();
  const { colors, dark } = useTheme();
  const base = dark ? DarkTheme : DefaultTheme;
  const navTheme = {
    ...base,
    colors: { ...base.colors, primary: colors.primary, background: colors.background, card: colors.surface,
      text: colors.text, border: colors.divider },
  };
  if (status === 'loading') {
    return (
      <Screen>
        <LoadingView label="Menyiapkan aplikasi…" />
      </Screen>
    );
  }
  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator
        // Remount the tabs when the role changes so a staff session never keeps resident screens.
        key={account ? account.role : 'signedOut'}
        screenOptions={{ headerStyle: { backgroundColor: colors.surface }, headerTintColor: colors.text }}
      >
        <Stack.Screen name="Tabs" component={Tabs} options={{ headerShown: false }} />
        {Object.entries(STACK_SCREENS).map(([name, [component, title]]) => (
          <Stack.Screen key={name} name={name} component={component}
            options={{ title, headerRight: name === 'Darurat' ? undefined : emergency }} />
        ))}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
