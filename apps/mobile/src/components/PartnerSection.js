import { View } from 'react-native';

import { AppText, LoadingView } from './ui';
import { ageLabel, formatTime } from '../utils/format';
import { spacing } from '../theme';

// Wraps a partner envelope {source, retrievedAt, freshness, isMock, data}. An outage collapses to one line and
// never blocks the rest of the screen (NFR-04).
export default function PartnerSection({ envelope, loading, children, isEmpty }) {
  if (loading) return <LoadingView label={`Memuat data mitra`} />;
  if (!envelope || envelope.freshness === 'unavailable' || !envelope.data) {
    return <AppText color="textMuted">Data mitra sedang tidak tersedia.</AppText>;
  }
  const minutes = envelope.retrievedAt
    ? Math.max(0, Math.floor((Date.now() - new Date(envelope.retrievedAt).getTime()) / 60000))
    : null;
  return (
    <View style={{ gap: spacing.sm }}>
      {isEmpty ? <AppText color="textMuted">Belum ada data dari mitra untuk bagian ini.</AppText> : children}
      <AppText variant="caption" color="textMuted">
        Sumber: {envelope.source}
        {envelope.isMock ? ' · Data contoh (mock)' : ''} · diambil {formatTime(envelope.retrievedAt)} ({ageLabel(minutes)})
        {envelope.freshness === 'stale' ? ' · Data tersimpan, mitra sedang tidak tersedia' : ''}
      </AppText>
    </View>
  );
}
