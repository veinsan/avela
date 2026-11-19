import { View } from 'react-native';

import { AppText, Button, Divider, ErrorView, LoadingView, Panel, Row, Screen, Section, SimulationLabel }
  from '../components/ui';
import { useLoad } from '../hooks/useLoad';
import { getResult } from '../services/ApiService';
import { formatTime } from '../utils/format';
import { spacing } from '../theme';

export default function ResultScreen({ route, navigation }) {
  const { id } = route.params;
  const { data: r, error, loading, reload } = useLoad(() => getResult(id), [id]);

  return (
    <Screen>
      {loading ? <LoadingView /> : null}
      {error ? <ErrorView message={error.message} onRetry={reload} /> : null}
      {r ? (
        <>
          <AppText variant="headline" accessibilityRole="header">
            Hasil pemeriksaan
          </AppText>
          <AppText color="textMuted">
            Versi {r.version}
            {r.previousId ? ' (koreksi)' : ''}
          </AppText>
          <SimulationLabel text="Hasil fiktif dari petugas simulasi tugas kuliah." />
          {r.supersededBy ? (
            <Panel tone="warning" style={{ marginTop: spacing.lg }}>
              <AppText color="warning">Ada versi koreksi yang lebih baru.</AppText>
              <Button label="Buka versi terbaru" kind="tonal"
                onPress={() => navigation.push('HasilPemeriksaan', { id: r.supersededBy })} />
            </Panel>
          ) : null}
          <Section>
            <Panel tone="surface">
              <AppText>{r.content}</AppText>
            </Panel>
            <AppText variant="caption" color="textMuted">
              {r.authorName} · {r.facilityName} · terbit {formatTime(r.publishedAt)}
            </AppText>
          </Section>
          {r.history && r.history.length ? (
            <Section title="Versi sebelumnya">
              {r.history.map((h) => (
                <View key={h.id}>
                  <Row title={`Versi ${h.version}`} meta={`Terbit ${formatTime(h.publishedAt)} · ${h.authorName}`}
                    onPress={() => navigation.push('HasilPemeriksaan', { id: h.id })} />
                  <Divider />
                </View>
              ))}
            </Section>
          ) : null}
        </>
      ) : null}
    </Screen>
  );
}
