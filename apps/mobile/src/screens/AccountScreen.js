import Constants from 'expo-constants';
import { View } from 'react-native';

import { AppText, Button, Panel, Screen, Section, SimulationLabel } from '../components/ui';
import { useArea } from '../context/AreaContext';
import { useAuth } from '../context/AuthContext';
import { ROLES } from '../utils/format';
import { spacing } from '../theme';

export default function AccountScreen({ navigation }) {
  const { account, signOut } = useAuth();
  const { area } = useArea();

  return (
    <Screen>
      {account ? (
        <Panel>
          <AppText variant="title">{account.displayName}</AppText>
          <AppText color="textMuted">
            {ROLES[account.role]} · {account.username}
          </AppText>
          {account.facilities.length ? (
            <AppText color="textMuted">Fasilitas: {account.facilities.join(', ')}</AppText>
          ) : null}
        </Panel>
      ) : (
        <View style={{ gap: spacing.md }}>
          <AppText variant="headline" accessibilityRole="header">
            Akun
          </AppText>
          <AppText color="textMuted">
            Masuk untuk mengirim laporan dan membaca tanggapan petugas. Informasi asap dan darurat tetap dapat dibuka
            tanpa akun.
          </AppText>
          <Button label="Masuk" onPress={() => navigation.navigate('Masuk')} />
        </View>
      )}

      {account?.role !== 'staff' ? (
        <Section title="Wilayah">
          <AppText>{area ? area.name : 'Belum dipilih'}</AppText>
        </Section>
      ) : null}

      <Section title="Tentang Avela">
        <AppText color="textMuted">
          Avela adalah prototipe tugas kuliah. Avela tidak mendiagnosis dan bukan layanan klinis. Petugas, fasilitas,
          dan kasus adalah simulasi; tidak ada janji waktu tanggapan.
        </AppText>
        <SimulationLabel />
        <AppText variant="caption" color="textMuted">
          Versi {Constants.expoConfig?.version ?? '-'}
        </AppText>
      </Section>

      {account ? (
        <Section>
          <Button label="Keluar" kind="tonal" onPress={signOut} />
        </Section>
      ) : null}
    </Screen>
  );
}
