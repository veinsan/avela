// One APK; the session's role decides the tabs and the two sets never mix (D-15, FR-16).
// Screen transitions are the native stack's own (DESIGN, motion); tab switches never animate.
import { View } from 'react-native';
import { DarkTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useReducedMotion } from 'react-native-reanimated';

import { useAuth } from '../context/AuthContext';
import { useUpdates } from '../context/UpdatesContext';
import { typography, useTheme } from '../theme';
import { EmergencyPill, LoadingView } from '../components/ui';
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

// Tab name -> [component, label, icon]. The outline icon is idle; the filled one marks the active tab.
const TAB_SCREENS = {
  Beranda: [HomeScreen, 'Beranda', 'home'],
  Laporan: [ReportsScreen, 'Laporan', 'document-text'],
  Fasilitas: [FacilitiesScreen, 'Fasilitas', 'business'],
  Antrean: [QueueScreen, 'Antrean', 'file-tray-full'],
  Akun: [AccountScreen, 'Akun', 'person-circle'],
};

export function tabsForRole(role) {
  return role === 'staff' ? ['Antrean', 'Akun'] : ['Beranda', 'Laporan', 'Fasilitas', 'Akun'];
}

// name -> [component, title, presentation]
const STACK_SCREENS = {
  Masuk: [LoginScreen, 'Masuk', 'modal'],
  PilihWilayah: [AreaPickerScreen, 'Pilih wilayah', 'formSheet'],
  Panduan: [GuidanceScreen, 'Panduan'],
  Darurat: [EmergencyScreen, 'Darurat', 'modal'],
  DetailFasilitas: [FacilityDetailScreen, 'Fasilitas'],
  FormLaporan: [ReportFormScreen, 'Laporan baru'],
  DetailLaporan: [ReportDetailScreen, 'Laporan'],
  HasilPemeriksaan: [ResultScreen, 'Hasil pemeriksaan'],
  TinjauLaporan: [ReviewScreen, 'Tinjau laporan'],
  TerbitkanHasil: [PublishResultScreen, 'Terbitkan hasil'],
};

const headerEmergency = () => <EmergencyPill />;

function Tabs() {
  const { account } = useAuth();
  const { count } = useUpdates();
  const { colors } = useTheme();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false, // tab screens draw their own large title (DESIGN, Layout)
        animation: 'none',
        tabBarActiveTintColor: colors.text, // silver, never the yellow accent
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.divider },
        tabBarLabelStyle: { ...typography.label, fontSize: 12 },
        tabBarIcon: ({ focused, color, size }) => (
          <Ionicons
            name={focused ? TAB_SCREENS[route.name][2] : `${TAB_SCREENS[route.name][2]}-outline`}
            size={size}
            color={color}
          />
        ),
        tabBarBadgeStyle: { backgroundColor: colors.information, color: colors.onSelected, fontWeight: '700' },
      })}
    >
      {tabsForRole(account && account.role).map((name) => (
        <Tab.Screen
          key={name}
          name={name}
          component={TAB_SCREENS[name][0]}
          options={{
            title: TAB_SCREENS[name][1],
            tabBarBadge: name === 'Laporan' && count ? count : undefined,
            tabBarAccessibilityLabel: name === 'Laporan' && count ? `Laporan, ${count} pembaruan` : undefined,
          }}
        />
      ))}
    </Tab.Navigator>
  );
}

export default function RootNavigator() {
  const { status, account } = useAuth();
  const { colors } = useTheme();
  const reduced = useReducedMotion();
  const navTheme = {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors, primary: colors.text, background: colors.background, card: colors.surface,
      text: colors.text, border: colors.divider, notification: colors.information,
    },
  };
  if (status === 'loading') {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, padding: 20, paddingTop: 80 }}>
        <LoadingView label="Menyiapkan aplikasi" />
      </View>
    );
  }
  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator
        // Remount the tabs when the role changes so a staff session never keeps resident screens.
        key={account ? account.role : 'signedOut'}
        screenOptions={{
          headerStyle: { backgroundColor: colors.background },
          headerShadowVisible: false,
          headerTintColor: colors.text,
          headerTitleStyle: { ...typography.bodyStrong },
          headerBackButtonDisplayMode: 'minimal',
          contentStyle: { backgroundColor: colors.background },
          animation: reduced ? 'fade' : 'default',
        }}
      >
        <Stack.Screen name="Tabs" component={Tabs} options={{ headerShown: false }} />
        {Object.entries(STACK_SCREENS).map(([name, [component, title, presentation]]) => (
          <Stack.Screen
            key={name}
            name={name}
            component={component}
            options={{
              title,
              presentation: presentation || 'card',
              headerRight: presentation ? undefined : headerEmergency,
              ...(presentation === 'formSheet'
                ? { headerShown: false, sheetAllowedDetents: [0.55], sheetCornerRadius: 28, sheetGrabberVisible: true }
                : {}),
            }}
          />
        ))}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
