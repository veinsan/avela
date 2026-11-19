// A sheet over Beranda: the resident picks a pilot area from a list; the app never asks for location (D-25).
import { View } from 'react-native';

import { AppText, Icon, ListGroup, ListRow, SimulationLabel } from '../components/ui';
import { useArea } from '../context/AreaContext';
import { useLoad } from '../hooks/useLoad';
import { listAreas } from '../services/ApiService';
import { haptic } from '../utils/haptics';
import { spacing, useTheme } from '../theme';

// The two pilot areas are fixed (D-14), so the picker still works when the core cannot be reached.
export const PILOT_AREAS = [
  { id: 'palangka-raya', name: 'Palangka Raya', province: 'Kalimantan Tengah' },
  { id: 'pekanbaru', name: 'Pekanbaru', province: 'Riau' },
];

export default function AreaPickerScreen({ navigation }) {
  const { colors } = useTheme();
  const { area, setArea } = useArea();
  const { data, error } = useLoad(() => listAreas(), []);
  const items = data?.items || (error ? PILOT_AREAS : PILOT_AREAS);

  function choose(item) {
    if (area?.id !== item.id) haptic.select();
    setArea({ id: item.id, name: item.name });
    navigation.goBack();
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, padding: spacing.screen, paddingTop: spacing.xl, gap: spacing.lg }}>
      <View style={{ gap: spacing.xs }}>
        <AppText variant="headline" accessibilityRole="header">Pilih wilayah</AppText>
        <AppText color="textMuted">Dua wilayah percontohan. Aplikasi tidak meminta lokasi Anda.</AppText>
      </View>
      <ListGroup inset={72}>
        {items.map((item) => {
          const chosen = area?.id === item.id;
          return (
            <ListRow
              key={item.id}
              icon="location-outline"
              title={item.name}
              subtitle={item.province}
              onPress={() => choose(item)}
              right={chosen ? <Icon name="checkmark-circle" size={22} /> : <View style={{ width: 22 }} />}
              accessibilityLabel={`${item.name}, ${item.province}${chosen ? ', dipilih' : ''}`}
            />
          );
        })}
      </ListGroup>
      <SimulationLabel text="Nilai PM2.5 adalah prakiraan model untuk wilayah, bukan pengukuran di rumah Anda." />
    </View>
  );
}
