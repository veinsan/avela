import { View } from 'react-native';

import { AppText, Divider, ErrorView, LoadingView, Screen, Section, SimulationLabel } from '../components/ui';
import { useLoad } from '../hooks/useLoad';
import { getFacility } from '../services/ApiService';
import { WEEKDAYS, hoursLabel } from '../utils/format';
import { spacing } from '../theme';

export default function FacilityDetailScreen({ route }) {
  const { id } = route.params;
  const { data: f, error, loading, reload } = useLoad(() => getFacility(id), [id]);

  return (
    <Screen>
      {loading ? <LoadingView /> : null}
      {error ? <ErrorView message={error.message} onRetry={reload} /> : null}
      {f ? (
        <>
          <AppText variant="headline" accessibilityRole="header">
            {f.name}
          </AppText>
          <AppText color="textMuted">{f.areaName}</AppText>
          <SimulationLabel text="Fasilitas simulasi tugas kuliah; ketersediaan petugas tidak dijamin." />
          <Section title="Layanan">
            {f.services.length ? (
              f.services.map((s) => <AppText key={s}>• {s}</AppText>)
            ) : (
              <AppText color="textMuted">Tidak diketahui</AppText>
            )}
          </Section>
          <Section title="Jadwal buka">
            {f.schedule ? (
              f.schedule.map((d) => (
                <View key={d.day}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.sm }}>
                    <AppText>{WEEKDAYS[d.day]}</AppText>
                    <AppText color={d.hours === null ? 'textMuted' : 'text'}>{hoursLabel(d.hours)}</AppText>
                  </View>
                  <Divider />
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
