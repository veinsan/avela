import { View } from 'react-native';

import {
  AppText, Banner, Button, Card, Divider, ErrorView, FadeIn, Icon, ListGroup, ListRow, LoadingView, Screen, Section,
  SimulationLabel,
} from '../components/ui';
import { useLoad } from '../hooks/useLoad';
import { getResult } from '../services/ApiService';
import { formatTime } from '../utils/format';
import { spacing } from '../theme';

function Meta({ icon, label, value }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.md }}>
      <Icon name={icon} size={18} color="textMuted" />
      <AppText variant="caption" color="textMuted" style={{ width: 84 }}>{label}</AppText>
      <AppText style={{ flex: 1 }}>{value}</AppText>
    </View>
  );
}

export default function ResultScreen({ route, navigation }) {
  const { id } = route.params;
  const { data: r, error, loading, reload } = useLoad(() => getResult(id), [id]);

  return (
    <Screen>
      {loading ? <LoadingView /> : null}
      {error ? <ErrorView message={error.message} onRetry={reload} /> : null}
      {r ? (
        <FadeIn>
          <AppText variant="label" color="textMuted">
            Versi {r.version}{r.previousId ? ', koreksi' : ''}
          </AppText>
          <AppText variant="headline" accessibilityRole="header" style={{ marginTop: spacing.xs }}>
            Hasil pemeriksaan
          </AppText>
          <SimulationLabel text="Hasil fiktif dari petugas simulasi tugas kuliah." />

          {r.supersededBy ? (
            <View style={{ marginTop: spacing.lg }}>
              <Banner
                tone="warning"
                icon="git-compare-outline"
                title="Ada versi koreksi yang lebih baru"
                action={<Button label="Buka versi terbaru" kind="tonal"
                  onPress={() => navigation.push('HasilPemeriksaan', { id: r.supersededBy })} />}
              >
                Versi ini tetap dapat dibaca sebagai riwayat.
              </Banner>
            </View>
          ) : null}

          <Section>
            <Card>
              <AppText>{r.content}</AppText>
            </Card>
            <Card style={{ paddingVertical: spacing.xs, gap: 0 }}>
              <Meta icon="person-outline" label="Petugas" value={r.authorName} />
              <Divider />
              <Meta icon="business-outline" label="Fasilitas" value={r.facilityName} />
              <Divider />
              <Meta icon="time-outline" label="Terbit" value={formatTime(r.publishedAt)} />
            </Card>
          </Section>

          {r.history && r.history.length ? (
            <Section title="Versi sebelumnya">
              <ListGroup inset={72}>
                {r.history.map((h) => (
                  <ListRow key={h.id} icon="document-outline" title={`Versi ${h.version}`}
                    subtitle={`Terbit ${formatTime(h.publishedAt)}, oleh ${h.authorName}`}
                    onPress={() => navigation.push('HasilPemeriksaan', { id: h.id })} />
                ))}
              </ListGroup>
            </Section>
          ) : null}
        </FadeIn>
      ) : null}
    </Screen>
  );
}
