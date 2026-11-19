import Constants from 'expo-constants';
import { View } from 'react-native';

import { AppText, Button, Card, FadeIn, ListGroup, ListRow, Screen, Section, SimulationLabel } from '../components/ui';
import { useArea } from '../context/AreaContext';
import { useAuth } from '../context/AuthContext';
import { ROLES } from '../utils/format';
import { spacing, useTheme } from '../theme';

function initials(name) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('');
}

export default function AccountScreen({ navigation }) {
  const { colors } = useTheme();
  const { account, signOut } = useAuth();
  const { area } = useArea();

  return (
    <Screen title="Akun">
      {account ? (
        <FadeIn>
          <Card style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.lg }}>
            <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: colors.selected,
              alignItems: 'center', justifyContent: 'center' }}>
              <AppText variant="title" style={{ color: colors.onSelected }}>{initials(account.displayName)}</AppText>
            </View>
            <View style={{ flex: 1, gap: 2 }}>
              <AppText variant="title">{account.displayName}</AppText>
              <AppText color="textMuted">{ROLES[account.role]}, {account.username}</AppText>
            </View>
          </Card>
        </FadeIn>
      ) : (
        <FadeIn>
          <Card style={{ gap: spacing.lg, padding: spacing.xl }}>
            <AppText variant="title">Belum masuk</AppText>
            <AppText color="textMuted">
              Masuk untuk mengirim laporan dan membaca tanggapan petugas. Informasi asap dan nomor darurat tetap dapat
              dibuka tanpa akun.
            </AppText>
            <Button label="Masuk" icon="log-in-outline" onPress={() => navigation.navigate('Masuk')} />
          </Card>
        </FadeIn>
      )}

      <Section title="Pengaturan">
        <ListGroup inset={72}>
          {account?.role !== 'staff' ? (
            <ListRow icon="location-outline" title="Wilayah" subtitle={area ? area.name : 'Belum dipilih'}
              onPress={() => navigation.navigate('PilihWilayah')} />
          ) : null}
          {account?.facilities?.length ? (
            <ListRow icon="business-outline" title="Fasilitas" subtitle={account.facilities.join(', ')} />
          ) : null}
          <ListRow icon="call-outline" title="Nomor darurat" subtitle="119 dan 112" onPress={() => navigation.navigate('Darurat')} />
        </ListGroup>
      </Section>

      <Section title="Tentang Avela">
        <Card style={{ gap: spacing.sm }}>
          <AppText color="textMuted">
            Avela adalah prototipe tugas kuliah. Avela tidak mendiagnosis dan bukan layanan klinis. Petugas, fasilitas,
            dan kasus adalah simulasi, dan tidak ada janji waktu tanggapan.
          </AppText>
          <SimulationLabel />
          <AppText variant="caption" color="textMuted">Versi {Constants.expoConfig?.version ?? '-'}</AppText>
        </Card>
      </Section>

      {account ? (
        <Section>
          <Button label="Keluar" kind="tonal" icon="log-out-outline" onPress={signOut} />
        </Section>
      ) : null}
    </Screen>
  );
}
