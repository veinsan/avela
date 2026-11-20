import { Check, MapPin } from 'lucide-react-native';

import { Icon, LoadingView, PageHeader, Row, RowList, Screen, SimulationLabel } from '../components/ui';
import { useArea } from '../context/AreaContext';
import { useLoad } from '../hooks/useLoad';
import { listAreas } from '../services/ApiService';
import { spacing } from '../theme';

// The two pilot areas are fixed (D-14), so the picker still works when the core cannot be reached.
export const PILOT_AREAS = [
  { id: 'palangka-raya', name: 'Palangka Raya', province: 'Kalimantan Tengah' },
  { id: 'pekanbaru', name: 'Pekanbaru', province: 'Riau' },
];

export default function AreaPickerScreen({ navigation }) {
  const { area, setArea } = useArea();
  const { data, error, loading } = useLoad(() => listAreas(), []);
  const items = data?.items || (error ? PILOT_AREAS : []);

  function choose(item) {
    setArea({ id: item.id, name: item.name });
    navigation.goBack();
  }

  return (
    <Screen>
      <PageHeader title="Pilih wilayah"
        body="Avela mencakup dua wilayah percontohan. Aplikasi tidak meminta lokasi Anda." />
      {loading ? <LoadingView /> : null}
      <RowList>
        {items.map((item) => (
          <Row
            key={item.id}
            icon={MapPin}
            title={item.name}
            subtitle={item.province}
            meta={area?.id === item.id ? 'Wilayah dipilih' : undefined}
            trailing={area?.id === item.id ? <Icon as={Check} size={20} strokeWidth={2.25} /> : null}
            onPress={() => choose(item)}
            accessibilityLabel={`${item.name}, ${item.province}${area?.id === item.id ? ', dipilih' : ''}`}
          />
        ))}
      </RowList>
      <SimulationLabel style={{ marginTop: spacing.lg }} text="Nilai PM2.5 adalah prakiraan model untuk wilayah, bukan pengukuran di rumah Anda." />
    </Screen>
  );
}
