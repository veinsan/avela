// Works signed out and offline: the contacts ship with the app, sourced from Kemenkes (D-33, S-10).
import { Linking, Pressable, View } from 'react-native';
import { Phone, Siren } from 'lucide-react-native';

import { AppText, Icon, PageHeader, Panel, Screen, Section } from '../components/ui';
import { rounded, spacing, useTheme } from '../theme';

export const CONTACTS = [
  { number: '119', name: 'Layanan gawat darurat medis (PSC 119)', note: 'Dikelola Kementerian Kesehatan, 24 jam, gratis.' },
  { number: '112', name: 'Nomor darurat nasional', note: 'Untuk kebakaran, kecelakaan, dan keadaan darurat lain.' },
];

// The number is the largest thing on the screen, so it can be found in a hurry.
function CallCard({ contact }) {
  const { colors } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Telepon ${contact.number}, ${contact.name}`}
      accessibilityHint="Membuka aplikasi telepon"
      onPress={() => Linking.openURL(`tel:${contact.number}`)}
      style={({ pressed }) => ({ borderRadius: rounded.panel, padding: spacing.xl, gap: spacing.md,
        backgroundColor: pressed ? '#F9D9D5' : colors.dangerSurface })}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <AppText variant="display" color="danger" style={{ fontSize: 56, lineHeight: 60 }}>
          {contact.number}
        </AppText>
        <View style={{ width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center',
          backgroundColor: colors.danger }}>
          <Icon as={Phone} size={24} color="onSelected" strokeWidth={2} />
        </View>
      </View>
      <View style={{ gap: 2 }}>
        <AppText variant="bodyStrong">{contact.name}</AppText>
        <AppText color="textMuted">{contact.note}</AppText>
      </View>
      <AppText variant="label" color="danger">Telepon {contact.number}</AppText>
    </Pressable>
  );
}

export default function EmergencyScreen() {
  return (
    <Screen>
      <PageHeader title="Darurat" body="Jika sesak berat, nyeri dada, atau pingsan, telepon sekarang." />
      <Panel tone="danger" icon={Siren}>
        <AppText color="danger" variant="bodyStrong">
          Mengirim laporan di Avela bukan pertolongan darurat. Laporan tidak dipantau terus-menerus.
        </AppText>
      </Panel>
      <View style={{ gap: spacing.md, marginTop: spacing.xl }}>
        {CONTACTS.map((c) => (
          <CallCard key={c.number} contact={c} />
        ))}
      </View>
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
