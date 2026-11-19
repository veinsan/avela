import { Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { AppText } from './ui';
import { MIN_TOUCH, spacing } from '../theme';

// Darurat is one tap away on every screen, signed in or not (PRODUCT_FLOWS, Flow A).
export default function EmergencyButton() {
  const navigation = useNavigation();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Darurat: nomor gawat darurat"
      onPress={() => navigation.navigate('Darurat')}
      style={{ minHeight: MIN_TOUCH, minWidth: MIN_TOUCH, justifyContent: 'center', paddingHorizontal: spacing.md }}
    >
      <AppText variant="label" color="danger">
        Darurat
      </AppText>
    </Pressable>
  );
}
