import { Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Phone } from 'lucide-react-native';

import { AppText } from './ui';
import { MIN_TOUCH, colors, rounded, spacing } from '../theme';

// Darurat is one tap away on every screen, signed in or not (PRODUCT_FLOWS, Flow A).
export default function EmergencyButton() {
  const navigation = useNavigation();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Darurat: nomor gawat darurat"
      onPress={() => navigation.navigate('Darurat')}
      hitSlop={6}
      style={({ pressed }) => ({ minHeight: MIN_TOUCH - 8, minWidth: MIN_TOUCH, justifyContent: 'center',
        alignItems: 'center', flexDirection: 'row', gap: 6, paddingHorizontal: spacing.md, marginRight: spacing.xs,
        borderRadius: rounded.pill, backgroundColor: pressed ? '#F9D9D5' : colors.dangerSurface })}
    >
      <Phone size={16} color={colors.danger} strokeWidth={2} />
      <AppText variant="label" color="danger">
        Darurat
      </AppText>
    </Pressable>
  );
}
