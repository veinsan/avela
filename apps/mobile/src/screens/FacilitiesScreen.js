import { useState } from 'react';
import { View } from 'react-native';

import {
  EmptyState, ErrorView, FadeIn, ListGroup, ListRow, LoadingView, Screen, Segmented, SimulationLabel,
} from '../components/ui';
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
  const [scope, setScope] = useState('area');
  const areaId = scope === 'area' && area ? area.id : null;
  const { data, error, loading, reload, refresh, refreshing } = useLoad(() => listFacilities(areaId), [areaId]);
  const items = data ? data.items : [];

  return (
    <Screen title="Fasilitas" subtitle="Direktori simulasi tugas kuliah" refreshing={refreshing} onRefresh={refresh}>
      {area ? (
        <Segmented
          value={scope}
          onChange={setScope}
          options={[{ value: 'area', label: area.name }, { value: 'all', label: 'Semua wilayah' }]}
        />
      ) : null}
      <View style={{ marginTop: spacing.lg }}>
        {loading ? <LoadingView card={false} /> : null}
        {error ? <ErrorView message={error.message} onRetry={reload} /> : null}
        {data && !items.length ? (
          <EmptyState icon="business-outline" title="Belum ada fasilitas di wilayah ini"
            body="Pilih Semua wilayah untuk melihat daftar lain." />
        ) : null}
        {items.length ? (
          <FadeIn key={String(areaId)}>
            <ListGroup inset={72}>
              {items.map((f) => (
                <ListRow
                  key={f.id}
                  icon="business-outline"
                  title={f.name}
                  subtitle={`${f.areaName}, ${f.services.length} layanan`}
                  meta={`Hari ini ${todayHours(f)}`}
                  onPress={() => navigation.navigate('DetailFasilitas', { id: f.id, name: f.name })}
                />
              ))}
            </ListGroup>
          </FadeIn>
        ) : null}
      </View>
      <SimulationLabel text="Fasilitas fiktif. Ketersediaan petugas tidak dijamin." />
    </Screen>
  );
}
