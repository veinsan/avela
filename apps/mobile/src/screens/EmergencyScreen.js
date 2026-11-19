// Works signed out and offline: the contacts ship with the app, sourced from Kemenkes (D-33, S-10).
import { Linking, View } from 'react-native';

import { AppText, Button, Panel, Screen, Section } from '../components/ui';
import { spacing } from '../theme';

export const CONTACTS = [
  { number: '119', name: 'Layanan gawat darurat medis (PSC 119)', note: 'Dikelola Kementerian Kesehatan, 24 jam, gratis.' },
  { number: '112', name: 'Nomor darurat nasional', note: 'Untuk kebakaran, kecelakaan, dan keadaan darurat lain.' },
];

export default function EmergencyScreen() {
  return (
    <Screen>
      <AppText variant="headline" accessibilityRole="header">
        Darurat
      </AppText>
      <Panel tone="danger" style={{ marginTop: spacing.lg }}>
        <AppText color="danger" variant="bodyStrong">
          Mengirim laporan di Avela bukan pertolongan darurat. Laporan tidak dipantau terus-menerus.
        </AppText>
      </Panel>
      {CONTACTS.map((c) => (
        <Section key={c.number} title={`${c.number} · ${c.name}`}>
          <AppText color="textMuted">{c.note}</AppText>
          <Button label={`Telepon ${c.number}`} kind="danger" onPress={() => Linking.openURL(`tel:${c.number}`)}
            accessibilityHint="Membuka aplikasi telepon" />
        </Section>
      ))}
      <Section title="Bukan darurat">
        <View style={{ gap: spacing.xs }}>
          <AppText>Halo Kemenkes 1500-567 untuk pertanyaan dan keluhan kesehatan.</AppText>
          <AppText variant="caption" color="textMuted">
            Sumber: Kementerian Kesehatan, "Layanan 119, terobosan baru layanan kegawatdaruratan medik di Indonesia".
          </AppText>
        </View>
      </Section>
    </Screen>
  );
}
