import { useState } from 'react';
import { View } from 'react-native';

import { AppText, Chip, Divider, EmptyView, ErrorView, LoadingView, Row, Screen, SimulationLabel } from '../components/ui';
import { useArea } from '../context/AreaContext';
import { useLoad } from '../hooks/useLoad';
import { listFacilities } from '../services/ApiService';
import { hoursLabel } from '../utils/format';
import { spacing } from '../theme';

// Index into a Monday-first schedule for today in WIB.
export function todayIndex(now = Date.now()) {
  return (new Date(now + 7 * 3600 * 1000).getUTCDay() + 6) % 7;
}

export function todayHours(facility, now = Date.now()) {
  const day = facility.schedule ? facility.schedule[todayIndex(now)] : null;
  return hoursLabel(day ? day.hours : null);
}

export default function FacilitiesScreen({ navigation }) {
  const { area } = useArea();
  const [onlyMine, setOnlyMine] = useState(true);
  const areaId = onlyMine && area ? area.id : null;
  const { data, error, loading, reload, refresh, refreshing } = useLoad(() => listFacilities(areaId), [areaId]);
  const items = data ? data.items : [];

  return (
    <Screen refreshing={refreshing} onRefresh={refresh}>
      <AppText variant="headline" accessibilityRole="header">
        Fasilitas kesehatan
      </AppText>
      <SimulationLabel text="Direktori simulasi tugas kuliah, bukan fasilitas sungguhan." />
      <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.lg }} accessibilityRole="radiogroup">
        {area ? <Chip label={`Wilayah ${area.name}`} selected={onlyMine} onPress={() => setOnlyMine(true)} /> : null}
        <Chip label="Semua wilayah" selected={!onlyMine || !area} onPress={() => setOnlyMine(false)} />
      </View>
      {loading ? <LoadingView /> : null}
      {error ? <ErrorView message={error.message} onRetry={reload} /> : null}
      {data && !items.length ? (
        <EmptyView title="Belum ada fasilitas di wilayah ini." body="Pilih Semua wilayah untuk melihat daftar lain." />
      ) : null}
      <View style={{ marginTop: spacing.md }}>
        {items.map((f) => (
          <View key={f.id}>
            <Row
              title={f.name}
              subtitle={`${f.areaName} · ${f.services.join(', ') || 'Layanan tidak diketahui'}`}
              meta={`Hari ini: ${todayHours(f)}`}
              onPress={() => navigation.navigate('DetailFasilitas', { id: f.id, name: f.name })}
            />
            <Divider />
          </View>
        ))}
      </View>
    </Screen>
  );
}
