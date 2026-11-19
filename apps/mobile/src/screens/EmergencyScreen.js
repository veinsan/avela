// Works signed out and offline: the contacts ship with the app, sourced from Kemenkes (D-33, S-10).
import { Linking, View } from 'react-native';

import { AppText, Banner, Card, Icon, ListGroup, ListRow, PressableScale, Screen, Section } from '../components/ui';
import { rounded, spacing, useTheme } from '../theme';

export const CONTACTS = [
  { number: '119', name: 'Gawat darurat medis', note: 'Layanan PSC 119 dari Kementerian Kesehatan. Buka 24 jam, gratis.' },
  { number: '112', name: 'Nomor darurat nasional', note: 'Untuk kebakaran, kecelakaan, dan keadaan darurat lain.' },
];

function CallCard({ contact }) {
  const { colors } = useTheme();
  return (
    <PressableScale
      onPress={() => Linking.openURL(`tel:${contact.number}`)}
      accessibilityLabel={`Telepon ${contact.number}, ${contact.name}`}
      accessibilityHint="Membuka aplikasi telepon"
      style={{ borderRadius: rounded.panel, backgroundColor: colors.dangerSurface, padding: spacing.screen,
        flexDirection: 'row', alignItems: 'center', gap: spacing.lg }}
    >
      <AppText variant="display" color="danger" style={{ fontSize: 44, lineHeight: 48 }}>{contact.number}</AppText>
      <View style={{ flex: 1, gap: 2 }}>
        <AppText variant="bodyStrong">{contact.name}</AppText>
        <AppText variant="caption" color="textMuted">{contact.note}</AppText>
      </View>
      <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: colors.danger,
        alignItems: 'center', justifyContent: 'center' }}>
        <Icon name="call" size={22} color="onAccent" />
      </View>
    </PressableScale>
  );
}

export default function EmergencyScreen() {
  return (
    <Screen>
      <View style={{ gap: spacing.md }}>
        {CONTACTS.map((c) => <CallCard key={c.number} contact={c} />)}
      </View>
      <View style={{ marginTop: spacing.lg }}>
        <Banner tone="neutral" icon="alert-circle-outline">
          Laporan di Avela bukan pertolongan darurat. Laporan tidak dipantau terus-menerus.
        </Banner>
      </View>
      <Section title="Bukan darurat">
        <ListGroup>
          <ListRow
            icon="chatbubbles-outline"
            title="Halo Kemenkes 1500-567"
            subtitle="Pertanyaan dan keluhan kesehatan"
            onPress={() => Linking.openURL('tel:1500567')}
          />
        </ListGroup>
        <Card tone="container" style={{ padding: spacing.lg }}>
          <AppText variant="caption" color="textMuted">
            Sumber: Kementerian Kesehatan, Layanan 119, terobosan baru layanan kegawatdaruratan medik di Indonesia.
          </AppText>
        </Card>
      </Section>
    </Screen>
  );
}
