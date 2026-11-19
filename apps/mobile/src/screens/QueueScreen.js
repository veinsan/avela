import { useState } from 'react';
import { ScrollView, View } from 'react-native';

import {
  AppText, Chip, EmptyState, ErrorView, FadeIn, ListGroup, ListRow, LoadingView, Screen, StatusPill,
} from '../components/ui';
import { useLoad } from '../hooks/useLoad';
import { staffQueue } from '../services/ApiService';
import { waitingLabel } from '../utils/format';
import { spacing } from '../theme';

const FILTERS = [
  [null, 'Semua'],
  ['submitted', 'Belum ditinjau'],
  ['in_review', 'Ditinjau'],
  ['awaiting_information', 'Menunggu warga'],
  ['responded', 'Ditanggapi'],
  ['closed', 'Selesai'],
];

// Oldest first, with the state in words, the waiting time, and who claimed it (DESIGN, Staff Queue).
export default function QueueScreen({ navigation }) {
  const [state, setState] = useState(null);
  const { data, error, loading, reload, refresh, refreshing } = useLoad(() => staffQueue(state), [state],
    { refreshOnFocus: true });
  const items = data ? data.items : [];

  return (
    <Screen title="Antrean" subtitle="Laporan untuk fasilitas Anda, terlama di atas" refreshing={refreshing}
      onRefresh={refresh}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}
        style={{ marginHorizontal: -spacing.screen }} contentContainerStyle={{ paddingHorizontal: spacing.screen, gap: spacing.sm }}
        accessibilityRole="radiogroup">
        {FILTERS.map(([value, label]) => (
          <Chip key={label} label={label} selected={state === value} onPress={() => setState(value)} />
        ))}
      </ScrollView>
      <View style={{ marginTop: spacing.lg }}>
        {loading ? <LoadingView card={false} /> : null}
        {error ? <ErrorView message={error.message} onRetry={reload} /> : null}
        {data && !items.length ? (
          <EmptyState icon="file-tray-outline" title="Antrean ini kosong"
            body="Laporan baru dari warga untuk fasilitas Anda muncul di sini." />
        ) : null}
        {items.length ? (
          <FadeIn key={String(state)}>
            <ListGroup>
              {items.map((r) => (
                <ListRow
                  key={r.id}
                  title={r.complaint.split('\n')[0]}
                  meta={
                    <View style={{ gap: spacing.sm, marginTop: spacing.xs }}>
                      <StatusPill state={r.state} />
                      <AppText variant="caption" color="textMuted">
                        {r.state === 'submitted' ? waitingLabel(r.createdAt) : `Masuk ${waitingLabel(r.createdAt).replace('menunggu ', '')} lalu`}
                        {r.reviewerName ? `, diklaim ${r.reviewerName}` : ''}
                      </AppText>
                    </View>
                  }
                  onPress={() => navigation.navigate('TinjauLaporan', { id: r.id })}
                />
              ))}
            </ListGroup>
          </FadeIn>
        ) : null}
      </View>
      <AppText variant="caption" color="textMuted" style={{ marginTop: spacing.lg }}>
        Simulasi tugas kuliah: petugas dan kasus fiktif.
      </AppText>
    </Screen>
  );
}
