// One APK; the session's role decides the tabs and the two sets never mix (D-15, FR-16).
import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

import { useAuth } from '../context/AuthContext';
import { useUpdates } from '../context/UpdatesContext';
import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Building2, CircleUser, FileText, House, Inbox } from 'lucide-react-native';

import { fonts, useTheme } from '../theme';
import EmergencyButton from '../components/EmergencyButton';
import GlassBar, { BAR_RADIUS } from '../components/GlassBar';
import { LoadingView, Screen, shadow } from '../components/ui';
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

// Tab name -> [component, title, icon]. Unfinished screens stay out until they work (BRANCH_PLAN).
const TAB_SCREENS = {
  Beranda: [HomeScreen, 'Beranda', House],
  Laporan: [ReportsScreen, 'Laporan', FileText],
  Fasilitas: [FacilitiesScreen, 'Fasilitas', Building2],
  Antrean: [QueueScreen, 'Antrean', Inbox],
  Akun: [AccountScreen, 'Akun', CircleUser],
};

export function tabsForRole(role) {
  return role === 'staff' ? ['Antrean', 'Akun'] : ['Beranda', 'Laporan', 'Fasilitas', 'Akun'];
}

const STACK_SCREENS = {
  // An empty title means the screen carries its own large heading, so the name is not said twice.
  Masuk: [LoginScreen, ''],
  PilihWilayah: [AreaPickerScreen, ''],
  Panduan: [GuidanceScreen, ''],
  Darurat: [EmergencyScreen, ''],
  DetailFasilitas: [FacilityDetailScreen, 'Detail Fasilitas'],
  FormLaporan: [ReportFormScreen, ''],
  DetailLaporan: [ReportDetailScreen, 'Detail Laporan'],
  HasilPemeriksaan: [ResultScreen, 'Hasil Pemeriksaan'],
  TinjauLaporan: [ReviewScreen, 'Tinjau Laporan'],
  TerbitkanHasil: [PublishResultScreen, 'Terbitkan Hasil'],
};

const emergency = () => <EmergencyButton />;

function Tabs() {
  const insets = useSafeAreaInsets();
  const { account } = useAuth();
  const { count } = useUpdates();
  const { colors } = useTheme();
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: colors.text, // ink, never the yellow accent
        tabBarInactiveTintColor: colors.textMuted,
        // A floating pill above the home indicator; screens leave room for it at the bottom.
        // A floating glass pill; screens leave room for it at the bottom (GlassBar draws the material).
        tabBarStyle: { position: 'absolute', left: 20, right: 20,
          bottom: insets.bottom ? insets.bottom - 6 : 12,
          height: 72, paddingTop: 0, paddingBottom: 0, paddingHorizontal: 6, borderRadius: BAR_RADIUS,
          borderTopWidth: 0, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.7)', backgroundColor: 'transparent',
          ...shadow },
        tabBarBackground: () => <GlassBar />,
        tabBarShowLabel: false,
        tabBarItemStyle: { height: 72, justifyContent: 'center', alignItems: 'center', paddingTop: 0, paddingBottom: 0 },
        tabBarIconStyle: { width: '100%', height: 56 },
        tabBarBadgeStyle: { backgroundColor: colors.information, color: colors.onSelected, fontFamily: fonts.bodyStrong,
          fontSize: 11 },
        ...headerLook(colors),
        headerTitleAlign: 'left',
        headerTitleStyle: { fontFamily: fonts.display, fontSize: 22, color: colors.text },
        headerRight: emergency,
      }}
    >
      {tabsForRole(account && account.role).map((name) => {
        const [component, title, Glyph] = TAB_SCREENS[name];
        return (
          <Tab.Screen key={name} name={name} component={component}
            options={{ title, headerShown: name !== 'Beranda' && name !== 'Akun', tabBarBadge: name === 'Laporan' && count ? count : undefined,
              // The active tab sits on a soft-yellow pill that holds both icon and label: where you are, never an
              // action. The label lives inside the icon slot so the pill can wrap it.
              tabBarIcon: ({ color, focused }) => (
                <View style={{ minWidth: 72, height: 56, borderRadius: 28, paddingHorizontal: 10, gap: 2,
                  alignItems: 'center', justifyContent: 'center',
                  backgroundColor: focused ? colors.accentSoft : 'transparent' }}>
                  <Glyph size={22} color={color} strokeWidth={focused ? 2.25 : 1.75} />
                  <Text numberOfLines={1} style={{ fontFamily: focused ? fonts.bodyStrong : fonts.bodyMedium, fontSize: 12,
                    lineHeight: 16, color }}>
                    {title}
                  </Text>
                </View>
              ),
              tabBarAccessibilityLabel: name === 'Laporan' && count ? `Laporan, ${count} pembaruan` : undefined }} />
        );
      })}
    </Tab.Navigator>
  );
}

// White headers that sit flat on the page: no shadow, a hairline only where content scrolls under them.
function headerLook(colors) {
  return {
    headerStyle: { backgroundColor: colors.background },
    headerShadowVisible: false,
    headerTintColor: colors.text,
    headerTitleStyle: { fontFamily: fonts.bodyStrong, fontSize: 17, color: colors.text },
    headerBackButtonDisplayMode: 'minimal',
    headerBackTitle: 'Kembali',
  };
}

export default function RootNavigator() {
  const { status, account } = useAuth();
  const { colors } = useTheme();
  const base = DefaultTheme;
  useEffect(() => {
    if (status !== 'loading') SplashScreen.hide();
  }, [status]);
  const navTheme = {
    ...base,
    dark: false,
    colors: { ...base.colors, primary: colors.text, background: colors.background, card: colors.background,
      text: colors.text, border: colors.divider, notification: colors.information },
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
        screenOptions={headerLook(colors)}
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
