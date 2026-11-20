import { View } from 'react-native';

import { AppText, Divider, ErrorView, LoadingView, PageHeader, Screen, Section, SimulationLabel } from '../components/ui';
import { todayIndex } from './FacilitiesScreen';
import { useLoad } from '../hooks/useLoad';
import { getFacility } from '../services/ApiService';
import { WEEKDAYS, distanceLabel, dummyDistanceKm, hoursLabel } from '../utils/format';
import { rounded, spacing, useTheme } from '../theme';

export default function FacilityDetailScreen({ route }) {
  const { id } = route.params;
  const { data: f, error, loading, reload } = useLoad(() => getFacility(id), [id]);
  const { colors } = useTheme();
  const today = todayIndex();

  return (
    <Screen>
      {loading ? <LoadingView /> : null}
      {error ? <ErrorView message={error.message} onRetry={reload} /> : null}
      {f ? (
        <>
          <PageHeader title={f.name} body={`${f.areaName}, sekitar ${distanceLabel(dummyDistanceKm(f.id))} (jarak contoh)`}
            style={{ marginBottom: spacing.sm }} />
          <SimulationLabel text="Fasilitas simulasi tugas kuliah; ketersediaan petugas tidak dijamin." />
          <Section title="Layanan">
            {f.services.length ? (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
                {f.services.map((s) => (
                  <View key={s} style={{ backgroundColor: colors.surface, borderRadius: rounded.pill,
                    paddingHorizontal: spacing.md, paddingVertical: 6 }}>
                    <AppText variant="label">{s}</AppText>
                  </View>
                ))}
              </View>
            ) : (
              <AppText color="textMuted">Tidak diketahui</AppText>
            )}
          </Section>
          <Section title="Jadwal buka">
            {f.schedule ? (
              f.schedule.map((d, i) => (
                <View key={d.day}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.md,
                    paddingHorizontal: i === today ? spacing.md : 0, borderRadius: rounded.small,
                    backgroundColor: i === today ? colors.surfaceContainer : 'transparent' }}>
                    <AppText variant={i === today ? 'bodyStrong' : 'body'}>
                      {WEEKDAYS[d.day]}{i === today ? ', hari ini' : ''}
                    </AppText>
                    <AppText variant={i === today ? 'bodyStrong' : 'body'} color={d.hours === null ? 'textMuted' : 'text'}
                      style={{ fontVariant: ['tabular-nums'] }}>
                      {hoursLabel(d.hours)}
                    </AppText>
                  </View>
                  {i === today || i + 1 === today ? null : <Divider />}
                </View>
              ))
            ) : (
              <AppText color="textMuted">Tidak diketahui</AppText>
            )}
            <AppText variant="caption" color="textMuted">
              "Tidak diketahui" berarti belum ada data, bukan berarti tutup.
            </AppText>
          </Section>
        </>
      ) : null}
    </Screen>
  );
}
