import { Linking, View } from 'react-native';

import PartnerSection from '../components/PartnerSection';
import { AppText, Button, Divider, ErrorView, LoadingView, Screen, Section } from '../components/ui';
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
      <AppText variant="headline" accessibilityRole="header">
        Panduan perlindungan
      </AppText>
      <AppText color="textMuted" style={{ marginTop: spacing.sm }}>
        Ringkasan dari publikasi Kementerian Kesehatan. Bukan diagnosis atau nasihat petugas.
      </AppText>
      <Button label="Nomor darurat" kind="danger" onPress={() => navigation.navigate('Darurat')}
        style={{ marginTop: spacing.lg }} />

      {guidance.loading ? <LoadingView /> : null}
      {guidance.error ? <ErrorView message={guidance.error.message} onRetry={guidance.reload} /> : null}
      {(guidance.data ? guidance.data.items : []).map((item) => (
        <Section key={item.id} title={item.title}>
          <AppText>{item.body}</AppText>
          <AppText
            variant="caption"
            color="text"
            accessibilityRole="link"
            onPress={() => Linking.openURL(item.source.url)}
            style={{ textDecorationLine: 'underline', paddingVertical: spacing.sm }}
          >
            Sumber: {item.source.title}
          </AppText>
          <AppText variant="caption" color="textMuted">
            {REVIEW[item.reviewStatus] || item.reviewStatus} · versi {item.version}
          </AppText>
          <Divider />
        </Section>
      ))}

      <Section title="Produk pelindung">
        <AppText color="textMuted">Entri katalog mitra, bukan resep atau anjuran medis.</AppText>
        <PartnerSection envelope={products.data} loading={products.loading} isEmpty={!items.length}>
          {items.map((p) => (
            <View key={p.id} style={{ gap: 2 }}>
              <AppText variant="bodyStrong">{p.name}</AppText>
              <AppText variant="caption" color="textMuted">
                Rating {p.ratingSummary.average.toLocaleString('id-ID')} dari 5 ({p.ratingSummary.count} ulasan)
              </AppText>
            </View>
          ))}
        </PartnerSection>
      </Section>
    </Screen>
  );
}
