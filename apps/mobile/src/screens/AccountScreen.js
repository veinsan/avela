// Profil: who is signed in, what they have sent, and the places they come back to (D-37).
import Constants from 'expo-constants';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BadgeCheck, LogIn, LogOut, MapPin } from 'lucide-react-native';

import EmergencyButton from '../components/EmergencyButton';

import { AppText, Button, Card, Icon, Row, RowList, Screen, Section, SimulationLabel, SkyBackdrop,
  StatRow, Tag } from '../components/ui';
import { useArea } from '../context/AreaContext';
import { useAuth } from '../context/AuthContext';
import { useUpdates } from '../context/UpdatesContext';
import { ROLES } from '../utils/format';
import { rounded, spacing, useTheme } from '../theme';

const ICONS = {
  wilayah: require('../../assets/icons3d/wilayah.png'),
  laporan: require('../../assets/icons3d/laporan.png'),
  hasil: require('../../assets/icons3d/hasil.png'),
  masker: require('../../assets/icons3d/masker.png'),
  telepon: require('../../assets/icons3d/telepon.png'),
  fasilitas: require('../../assets/icons3d/fasilitas.png'),
};

const initials = (name) => (name || '?').split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
const ANSWERED = ['responded', 'closed'];

// Same top bar as Beranda: the title on the left, the labelled Darurat pill on the right.
function TopBar() {
  const insets = useSafeAreaInsets();
  return (
    <View style={{ paddingTop: insets.top + spacing.sm, flexDirection: 'row', alignItems: 'center',
      justifyContent: 'space-between' }}>
      <AppText variant="title" accessibilityRole="header">Profil</AppText>
      <EmergencyButton />
    </View>
  );
}

function Avatar({ name, verified }) {
  const { colors } = useTheme();
  return (
    <View style={{ width: 104, height: 104 }}>
      <View style={{ width: 104, height: 104, borderRadius: 30, alignItems: 'center', justifyContent: 'center',
        backgroundColor: colors.accentSoft, borderWidth: 4, borderColor: colors.background }}>
        <AppText variant="headline" style={{ fontSize: 36, lineHeight: 42 }}>{initials(name)}</AppText>
      </View>
      {verified ? (
        <View style={{ position: 'absolute', right: -4, bottom: -4, width: 32, height: 32, borderRadius: 16,
          alignItems: 'center', justifyContent: 'center', backgroundColor: colors.text, borderWidth: 3,
          borderColor: colors.background }}>
          <Icon as={BadgeCheck} size={16} color="onSelected" strokeWidth={2.25} />
        </View>
      ) : null}
    </View>
  );
}

export default function AccountScreen({ navigation }) {
  const { account, signOut } = useAuth();
  const { area } = useArea();
  const updates = useUpdates();
  const resident = !account || account.role === 'resident';
  const reports = account ? updates.reports : [];
  const results = account ? updates.results : [];

  return (
    <View style={{ flex: 1 }}>
      <Screen>
        <SkyBackdrop />
        <TopBar />

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.lg, marginTop: spacing.xl }}>
          <Avatar name={account ? account.displayName : '?'} verified={!!account} />
          <View style={{ flex: 1, gap: 6 }}>
            <AppText variant="headline" style={{ fontSize: 26, lineHeight: 31 }}>
              {account ? account.displayName : 'Belum masuk'}
            </AppText>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Icon as={MapPin} size={16} color="textMuted" />
              <AppText variant="caption" color="textMuted" style={{ flexShrink: 1 }}>
                {account && account.role === 'staff'
                  ? `${account.facilities.length} fasilitas simulasi`
                  : area ? `Wilayah ${area.name}` : 'Wilayah belum dipilih'}
              </AppText>
            </View>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
              {account ? <Tag label={ROLES[account.role]} /> : null}
              <Tag label={account ? `@${account.username}` : 'Tamu'} tone="info" />
            </View>
          </View>
        </View>

        {account && resident ? (
          <Card style={{ marginTop: spacing.xl, paddingVertical: spacing.lg }}>
            <StatRow items={[
              { value: reports.length, label: 'Laporan' },
              { value: reports.filter((r) => ANSWERED.includes(r.state)).length, label: 'Ditanggapi' },
              { value: results.length, label: 'Hasil' },
            ]} />
          </Card>
        ) : null}

        {!account ? (
          <Card style={{ marginTop: spacing.xl, padding: spacing.lg, gap: spacing.md }}>
            <AppText color="textMuted">
              Masuk untuk mengirim laporan dan membaca tanggapan petugas. Informasi asap dan nomor darurat tetap bisa
              dibuka tanpa akun.
            </AppText>
            <Button label="Masuk" icon={LogIn} onPress={() => navigation.navigate('Masuk')} />
          </Card>
        ) : null}

        {account && resident ? (
          <Section title="Aktivitas Anda">
            <RowList>
              <Row key="laporan" image={ICONS.laporan} title="Laporan saya"
                subtitle={`${reports.length} laporan dikirim`} onPress={() => navigation.navigate('Laporan')} />
              <Row key="hasil" image={ICONS.hasil} title="Hasil pemeriksaan"
                subtitle={results.length ? `${results.length} hasil terbit` : 'Belum ada hasil'}
                onPress={() => navigation.navigate('Laporan')} />
              <Row key="fasilitas" image={ICONS.fasilitas} title="Fasilitas kesehatan" subtitle="Layanan, jadwal, dan jarak"
                onPress={() => navigation.navigate('Fasilitas')} />
            </RowList>
          </Section>
        ) : null}

        <Section title="Wilayah dan keselamatan">
          <RowList>
            {resident ? (
              <Row key="wilayah" image={ICONS.wilayah} title="Wilayah prakiraan"
                subtitle={area ? area.name : 'Belum dipilih'} onPress={() => navigation.navigate('PilihWilayah')} />
            ) : null}
            <Row key="panduan" image={ICONS.masker} title="Panduan perlindungan" subtitle="Masker, rumah, kelompok rentan"
              onPress={() => navigation.navigate('Panduan')} />
            <Row key="darurat" image={ICONS.telepon} title="Nomor darurat" subtitle="119 dan 112, tanpa akun"
              onPress={() => navigation.navigate('Darurat')} />
          </RowList>
        </Section>

        <Section title="Tentang Avela">
          <AppText color="textMuted">
            Avela adalah prototipe tugas kuliah. Avela tidak mendiagnosis dan bukan layanan klinis. Petugas, fasilitas,
            dan kasus adalah simulasi; tidak ada janji waktu tanggapan.
          </AppText>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <SimulationLabel />
            <AppText variant="caption" color="textMuted">
              Versi {Constants.expoConfig?.version ?? 'tidak diketahui'}
            </AppText>
          </View>
          {account ? (
            <Button label="Keluar" kind="tonal" icon={LogOut} onPress={signOut} style={{ borderRadius: rounded.pill }} />
          ) : null}
        </Section>
      </Screen>
    </View>
  );
}
