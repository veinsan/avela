import { useState } from 'react';
import { View } from 'react-native';
import { Hospital, Navigation } from 'lucide-react-native';

import { AppText, Chip, EmptyView, ErrorView, Icon, LoadingView, Row, RowList, Screen, SimulationLabel } from '../components/ui';
import { useArea } from '../context/AreaContext';
import { useLoad } from '../hooks/useLoad';
import { listFacilities } from '../services/ApiService';
import { distanceLabel, dummyDistanceKm, hoursLabel } from '../utils/format';
import { spacing } from '../theme';

// Index into a Monday-first schedule for today in WIB.
export function todayIndex(now = Date.now()) {
  return (new Date(now + 7 * 3600 * 1000).getUTCDay() + 6) % 7;
}

export function todayHours(facility, now = Date.now()) {
  const day = facility.schedule ? facility.schedule[todayIndex(now)] : null;
  return hoursLabel(day ? day.hours : null);
}

function DistanceTag({ km }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
      <Icon as={Navigation} size={14} color="textMuted" />
      <AppText variant="label" color="textMuted" style={{ fontVariant: ['tabular-nums'] }}>{distanceLabel(km)}</AppText>
    </View>
  );
}

export default function FacilitiesScreen({ navigation }) {
  const { area } = useArea();
  const [onlyMine, setOnlyMine] = useState(true);
  const areaId = onlyMine && area ? area.id : null;
  const { data, error, loading, reload, refresh, refreshing } = useLoad(() => listFacilities(areaId), [areaId]);
  const items = data ? data.items : [];

  return (
    <Screen refreshing={refreshing} onRefresh={refresh}>
      <AppText color="textMuted">Puskesmas dan klinik beserta layanan dan jadwal bukanya.</AppText>
      <SimulationLabel text="Direktori simulasi tugas kuliah, bukan fasilitas sungguhan. Jarak adalah contoh, bukan dari lokasi Anda."
        style={{ marginTop: spacing.sm }} />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.lg }}
        accessibilityRole="radiogroup">
        {area ? <Chip label={`Wilayah ${area.name}`} selected={onlyMine} onPress={() => setOnlyMine(true)} /> : null}
        <Chip label="Semua wilayah" selected={!onlyMine || !area} onPress={() => setOnlyMine(false)} />
      </View>
      {loading ? <LoadingView /> : null}
      {error ? <ErrorView message={error.message} onRetry={reload} /> : null}
      {data && !items.length ? (
        <EmptyView title="Belum ada fasilitas di wilayah ini." body="Pilih Semua wilayah untuk melihat daftar lain." />
      ) : null}
      <View style={{ marginTop: spacing.md }}>
        <RowList>
          {items.map((f) => (
            <Row
              key={f.id}
              icon={Hospital}
              title={f.name}
              subtitle={`${f.areaName}. ${f.services.join(', ') || 'Layanan tidak diketahui'}`}
              meta={`Hari ini: ${todayHours(f)}`}
              trailing={<DistanceTag km={dummyDistanceKm(f.id)} />}
              accessibilityLabel={`${f.name}, ${f.areaName}, sekitar ${distanceLabel(dummyDistanceKm(f.id))}, jarak contoh`}
              onPress={() => navigation.navigate('DetailFasilitas', { id: f.id, name: f.name })}
            />
          ))}
        </RowList>
      </View>
    </Screen>
  );
}
