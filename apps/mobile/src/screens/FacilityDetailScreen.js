import { View } from 'react-native';

import {
  AppText, Card, Divider, ErrorView, FadeIn, Icon, LoadingView, Screen, Section, SimulationLabel,
} from '../components/ui';
import { useLoad } from '../hooks/useLoad';
import { getFacility } from '../services/ApiService';
import { WEEKDAYS, hoursLabel } from '../utils/format';
import { todayIndex } from './FacilitiesScreen';
import { rounded, spacing, useTheme } from '../theme';

export default function FacilityDetailScreen({ route }) {
  const { colors } = useTheme();
  const { id } = route.params;
  const { data: f, error, loading, reload } = useLoad(() => getFacility(id), [id]);
  const today = todayIndex();

  return (
    <Screen>
      {loading ? <LoadingView /> : null}
      {error ? <ErrorView message={error.message} onRetry={reload} /> : null}
      {f ? (
        <FadeIn>
          <AppText variant="headline" accessibilityRole="header">{f.name}</AppText>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.sm }}>
            <Icon name="location-outline" size={16} color="textMuted" />
            <AppText color="textMuted">{f.areaName}</AppText>
          </View>
          <SimulationLabel text="Fasilitas simulasi tugas kuliah. Ketersediaan petugas tidak dijamin." />

          <Section title="Layanan">
            {f.services.length ? (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
                {f.services.map((s) => (
                  <View key={s} style={{ backgroundColor: colors.surface, borderRadius: rounded.pill,
                    paddingHorizontal: 14, paddingVertical: 8 }}>
                    <AppText variant="label">{s}</AppText>
                  </View>
                ))}
              </View>
            ) : (
              <AppText color="textMuted">Layanan tidak diketahui.</AppText>
            )}
          </Section>

          <Section title="Jadwal buka">
            <Card style={{ paddingVertical: spacing.sm, gap: 0 }}>
              {f.schedule ? (
                f.schedule.map((d, i) => {
                  const isToday = i === today;
                  return (
                    <View key={d.day}>
                      {i > 0 ? <Divider /> : null}
                      <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.md, gap: spacing.sm }}>
                        <AppText variant={isToday ? 'bodyStrong' : 'body'} style={{ flex: 1 }}>
                          {WEEKDAYS[d.day]}{isToday ? ' (hari ini)' : ''}
                        </AppText>
                        <AppText
                          variant={isToday ? 'bodyStrong' : 'body'}
                          color={d.hours === null || d.hours === 'closed' ? 'textMuted' : 'text'}
                        >
                          {hoursLabel(d.hours)}
                        </AppText>
                      </View>
                    </View>
                  );
                })
              ) : (
                <AppText color="textMuted" style={{ paddingVertical: spacing.md }}>Jadwal tidak diketahui.</AppText>
              )}
            </Card>
            <AppText variant="caption" color="textMuted">
              Tidak diketahui berarti belum ada data, bukan berarti tutup.
            </AppText>
          </Section>
        </FadeIn>
      ) : null}
    </Screen>
  );
}
