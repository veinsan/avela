import { View } from 'react-native';

import { AppText, Icon, Skeleton } from './ui';
import { ageLabel, formatTime } from '../utils/format';
import { rounded, spacing, useTheme } from '../theme';

export function minutesSince(iso, now = Date.now()) {
  return iso ? Math.max(0, Math.floor((now - new Date(iso).getTime()) / 60000)) : null;
}

// Wraps a partner envelope {source, retrievedAt, freshness, isMock, data}. An outage collapses to one line and
// never blocks the rest of the screen (NFR-04).
export default function PartnerSection({ envelope, loading, children, isEmpty }) {
  const { colors } = useTheme();
  if (loading) {
    return (
      <View style={{ gap: spacing.sm }}>
        <Skeleton height={18} width="80%" />
        <Skeleton height={18} width="55%" />
      </View>
    );
  }
  if (!envelope || envelope.freshness === 'unavailable' || !envelope.data) {
    return (
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
        <Icon name="cloud-offline-outline" size={18} color="textMuted" />
        <AppText color="textMuted">Data mitra sedang tidak tersedia.</AppText>
      </View>
    );
  }
  return (
    <View style={{ gap: spacing.md }}>
      {isEmpty ? <AppText color="textMuted">Belum ada data dari mitra untuk bagian ini.</AppText> : children}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: spacing.sm }}>
        <AppText variant="caption" color="textMuted">Sumber: {envelope.source}</AppText>
        {envelope.isMock ? (
          <View style={{ backgroundColor: colors.surfaceContainer, borderRadius: rounded.pill, paddingHorizontal: 8, paddingVertical: 2 }}>
            <AppText variant="caption">Data contoh (mock)</AppText>
          </View>
        ) : null}
      </View>
      <AppText variant="caption" color="textMuted">
        Diambil {formatTime(envelope.retrievedAt)}, {ageLabel(minutesSince(envelope.retrievedAt))}.
        {envelope.freshness === 'stale' ? ' Data tersimpan, mitra sedang tidak tersedia.' : ''}
      </AppText>
    </View>
  );
}
