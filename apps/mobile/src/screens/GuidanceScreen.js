import { Linking, Pressable, View } from 'react-native';

import PartnerSection from '../components/PartnerSection';
import {
  AppText, Banner, Button, Card, ErrorView, FadeIn, Icon, ListGroup, ListRow, LoadingView, Screen, Section,
} from '../components/ui';
import { useLoad } from '../hooks/useLoad';
import { getGuidance, getProtectiveProducts } from '../services/ApiService';
import { spacing, useTheme } from '../theme';

const REVIEW = { unreviewed: 'Belum ditinjau tenaga kesehatan', reviewed: 'Sudah ditinjau' };
const ITEM_ICONS = {
  'kurangi-aktivitas-luar': 'home-outline',
  'masker-n95': 'shield-outline',
  'kelompok-rentan': 'people-outline',
  'udara-dalam-rumah': 'leaf-outline',
  'kapan-berobat': 'medkit-outline',
};

function GuidanceItem({ item, index }) {
  const { colors } = useTheme();
  return (
    <FadeIn index={index}>
      <Card style={{ gap: spacing.md }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
          <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surfaceContainer,
            alignItems: 'center', justifyContent: 'center' }}>
            <Icon name={ITEM_ICONS[item.id] || 'information-circle-outline'} />
          </View>
          <AppText variant="title" style={{ flex: 1 }}>{item.title}</AppText>
        </View>
        <AppText>{item.body}</AppText>
        <Pressable
          onPress={() => Linking.openURL(item.source.url)}
          accessibilityRole="link"
          style={{ flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start', minHeight: 44, paddingTop: spacing.xs }}
        >
          <Icon name="open-outline" size={16} color="textMuted" style={{ marginTop: 2 }} />
          <AppText variant="caption" color="textMuted" style={{ flex: 1, textDecorationLine: 'underline' }}>
            {item.source.title}
          </AppText>
        </Pressable>
        <AppText variant="caption" color="textMuted">
          {REVIEW[item.reviewStatus] || item.reviewStatus}, versi {item.version}
        </AppText>
      </Card>
    </FadeIn>
  );
}

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
      <AppText variant="headline" accessibilityRole="header">Panduan perlindungan</AppText>
      <AppText color="textMuted" style={{ marginTop: spacing.xs }}>
        Ringkasan dari publikasi Kementerian Kesehatan. Ini bukan diagnosis atau nasihat petugas.
      </AppText>
      <View style={{ marginTop: spacing.lg }}>
        <Banner
          tone="danger"
          icon="call-outline"
          title="Keadaan darurat?"
          action={<Button label="Buka nomor darurat" kind="danger" icon="call" onPress={() => navigation.navigate('Darurat')} />}
        >
          Hubungi layanan gawat darurat. Jangan menunggu tanggapan laporan.
        </Banner>
      </View>

      {guidance.loading ? <LoadingView /> : null}
      {guidance.error ? <ErrorView message={guidance.error.message} onRetry={guidance.reload} /> : null}
      {guidance.data ? (
        <View style={{ gap: spacing.md, marginTop: spacing.xl }}>
          {guidance.data.items.map((item, i) => <GuidanceItem key={item.id} item={item} index={i} />)}
        </View>
      ) : null}

      <Section title="Produk pelindung">
        <AppText color="textMuted">Entri katalog mitra, bukan resep atau anjuran medis.</AppText>
        <Card>
          <PartnerSection envelope={products.data} loading={products.loading} isEmpty={!items.length}>
            <ListGroup inset={0} style={{ marginHorizontal: -spacing.lg }}>
              {items.map((p) => (
                <ListRow
                  key={p.id}
                  icon={p.category === 'masker' ? 'shield-outline' : 'leaf-outline'}
                  title={p.name}
                  subtitle={`Rating ${p.ratingSummary.average.toLocaleString('id-ID')} dari 5, ${p.ratingSummary.count} ulasan`}
                />
              ))}
            </ListGroup>
          </PartnerSection>
        </Card>
      </Section>
    </Screen>
  );
}
