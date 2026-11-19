import { useState } from 'react';
import { View } from 'react-native';

import { AppText, Chip, Divider, EmptyView, ErrorView, LoadingView, Row, Screen, SimulationLabel } from '../components/ui';
import { useLoad } from '../hooks/useLoad';
import { staffQueue } from '../services/ApiService';
import { stateLabel, waitingLabel } from '../utils/format';
import { spacing } from '../theme';

const FILTERS = [
  [null, 'Semua'],
  ['submitted', 'Belum ditinjau'],
  ['in_review', 'Ditinjau'],
  ['awaiting_information', 'Menunggu warga'],
  ['responded', 'Ditanggapi'],
  ['closed', 'Selesai'],
];

// Oldest first, with the state in text and the waiting time (DESIGN, Staff Queue).
export default function QueueScreen({ navigation }) {
  const [state, setState] = useState(null);
  const { data, error, loading, reload, refresh, refreshing } = useLoad(() => staffQueue(state), [state],
    { refreshOnFocus: true });
  const items = data ? data.items : [];

  return (
    <Screen refreshing={refreshing} onRefresh={refresh}>
      <AppText variant="headline" accessibilityRole="header">
        Antrean laporan
      </AppText>
      <SimulationLabel text="Simulasi tugas kuliah: petugas dan kasus fiktif." />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.lg }}
        accessibilityRole="radiogroup">
        {FILTERS.map(([value, label]) => (
          <Chip key={label} label={label} selected={state === value} onPress={() => setState(value)} />
        ))}
      </View>
      {loading ? <LoadingView /> : null}
      {error ? <ErrorView message={error.message} onRetry={reload} /> : null}
      {data && !items.length ? (
        <EmptyView title="Tidak ada laporan di antrean ini." body="Laporan baru dari warga untuk fasilitas Anda muncul di sini." />
      ) : null}
      <View style={{ marginTop: spacing.md }}>
        {items.map((r) => (
          <View key={r.id}>
            <Row
              title={r.complaint.split('\n')[0]}
              subtitle={stateLabel(r.state)}
              meta={`${r.state === 'submitted' ? waitingLabel(r.createdAt) : `masuk ${waitingLabel(r.createdAt).replace('menunggu ', '')} lalu`}${r.reviewerName ? ` · diklaim ${r.reviewerName}` : ''}`}
              onPress={() => navigation.navigate('TinjauLaporan', { id: r.id })}
            />
            <Divider />
          </View>
        ))}
      </View>
    </Screen>
  );
}
