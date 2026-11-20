import { Linking, Pressable, View } from 'react-native';
import { Phone, ShieldCheck, Star } from 'lucide-react-native';

import PartnerSection from '../components/PartnerSection';
import { AppText, Button, Divider, ErrorView, Icon, LoadingView, PageHeader, Screen, Section } from '../components/ui';
import { useLoad } from '../hooks/useLoad';
import { getGuidance, getProtectiveProducts } from '../services/ApiService';
import { spacing } from '../theme';

const REVIEW = { unreviewed: 'Belum ditinjau tenaga kesehatan', reviewed: 'Sudah ditinjau' };

export default function GuidanceScreen({ navigation }) {
  const guidance = useLoad(() => getGuidance(), []);
  const products = useLoad(() => getProtectiveProducts(), []);
  const items = products.data && products.data.data ? products.data.data : [];

  return (
    <Screen
      refreshing={guidance.refreshing}
      onRefresh={() => {
        guidance.refresh();
        products.refresh();
      }}
    >
      <PageHeader title="Panduan perlindungan"
        body="Ringkasan dari publikasi Kementerian Kesehatan. Bukan diagnosis atau nasihat petugas." />
      <Button label="Nomor darurat" kind="danger" icon={Phone} onPress={() => navigation.navigate('Darurat')} />

      {guidance.loading ? <LoadingView /> : null}
      {guidance.error ? <ErrorView message={guidance.error.message} onRetry={guidance.reload} /> : null}
      {(guidance.data ? guidance.data.items : []).map((item) => (
        <Section key={item.id} title={item.title}>
          <AppText>{item.body}</AppText>
          <Pressable accessibilityRole="link" onPress={() => Linking.openURL(item.source.url)} hitSlop={8}
            style={{ minHeight: 40, justifyContent: 'center' }}>
            <AppText variant="label" style={{ textDecorationLine: 'underline' }}>
              Sumber: {item.source.title}
            </AppText>
          </Pressable>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Icon as={ShieldCheck} size={14} color="textMuted" />
            <AppText variant="caption" color="textMuted">
              {REVIEW[item.reviewStatus] || item.reviewStatus}, versi {item.version}
            </AppText>
          </View>
        </Section>
      ))}

      <Section title="Produk pelindung">
        <AppText color="textMuted">Entri katalog mitra, bukan resep atau anjuran medis.</AppText>
        <PartnerSection envelope={products.data} loading={products.loading} isEmpty={!items.length}>
          {items.map((p, i) => (
            <View key={p.id} style={{ gap: spacing.md }}>
              {i ? <Divider /> : null}
              <View style={{ gap: 2 }}>
                <AppText variant="bodyStrong">{p.name}</AppText>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Icon as={Star} size={14} color="textMuted" />
                  <AppText variant="caption" color="textMuted">
                    {p.ratingSummary.average.toLocaleString('id-ID')} dari 5, {p.ratingSummary.count} ulasan
                  </AppText>
                </View>
              </View>
            </View>
          ))}
        </PartnerSection>
      </Section>
    </Screen>
  );
}
