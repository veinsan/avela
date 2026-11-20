// Beranda: what the data says about the area, what to do next, and the latest report state (DESIGN, Overview).
import { Image, Pressable, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronDown, MapPin, Recycle, ShieldCheck, TriangleAlert } from 'lucide-react-native';

import EmergencyButton from '../components/EmergencyButton';
import PartnerSection from '../components/PartnerSection';
import { ActionTile, AppText, Button, ErrorView, Icon, LoadingView, Panel, Row, RowList, Screen, Section, SimulationLabel,
  StatusPill, SunMark } from '../components/ui';
import { useArea } from '../context/AreaContext';
import { useAuth } from '../context/AuthContext';
import { useUpdates } from '../context/UpdatesContext';
import { useLoad } from '../hooks/useLoad';
import { getAdvisory, getWasteRecap } from '../services/ApiService';
import { ageLabel, formatTime, pm25, stateLabel } from '../utils/format';
import { gutter, rounded, spacing, useTheme } from '../theme';

const HERO = require('../../assets/illustrations/hero.png');

export function forecastAhead(series, now = Date.now(), count = 6) {
  return (series || []).filter((p) => new Date(p.validAt).getTime() > now).slice(0, count);
}

// The next hours as a row of columns on the haze panel. A missing hour stays an empty slot, never a zero.
function ForecastStrip({ points }) {
  const { colors } = useTheme();
  const top = Math.max(1, ...points.map((p) => p.value || 0));
  const said = points.map((p) => `${formatTime(p.validAt, { withDate: false })} ${pm25(p.value)}`).join(', ');
  return (
    <View accessible accessibilityLabel={`Prakiraan beberapa jam ke depan: ${said}`}
      style={{ flexDirection: 'row', alignItems: 'flex-end', gap: spacing.sm, marginTop: spacing.sm }}>
      {points.map((p, i) => (
        <View key={p.validAt} style={{ flex: 1, alignItems: 'center', gap: 6 }}>
          <AppText variant="caption" color={p.value === null ? 'textMuted' : 'text'}
            style={{ fontVariant: ['tabular-nums'] }}>
            {p.value === null ? 'kosong' : Math.round(p.value)}
          </AppText>
          <View style={{ height: 72, width: '100%', justifyContent: 'flex-end' }}>
            {p.value !== null ? (
              <View style={{ height: Math.max(6, (72 * p.value) / top), width: '64%', alignSelf: 'center',
                borderRadius: rounded.small,
                backgroundColor: i === 0 ? colors.accent : colors.tonalPressed }} />
            ) : (
              <View style={{ height: 72, width: '64%', alignSelf: 'center', borderRadius: rounded.small, borderWidth: 1.5,
                borderStyle: 'dashed',
                borderColor: colors.outline }} />
            )}
          </View>
          <AppText variant={i === 0 ? 'label' : 'caption'} color={i === 0 ? 'text' : 'textMuted'}>
            {formatTime(p.validAt, { withDate: false }).replace(' WIB', '')}
          </AppText>
        </View>
      ))}
    </View>
  );
}

function Condition({ advisory }) {
  const { colors } = useTheme();
  if (advisory.freshness === 'unavailable') {
    return (
      <Panel>
        <AppText variant="title">Data kualitas udara belum tersedia</AppText>
        <AppText color="textMuted">Coba lagi nanti. Panduan dan nomor darurat tetap bisa dibuka.</AppText>
      </Panel>
    );
  }
  const current = advisory.current;
  const category = advisory.category && advisory.category.label;
  const ahead = forecastAhead(advisory.series);
  return (
    <View style={{ padding: spacing.xl, gap: spacing.md, borderRadius: 28, borderWidth: 1.5, borderColor: colors.divider,
      backgroundColor: colors.background }}>
      <AppText variant="label" color="textMuted">PM2.5 jam ini, prakiraan model</AppText>
      {current && current.value !== null ? (
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: spacing.sm }}
          accessible accessibilityLabel={`PM2.5 ${pm25(current.value)}`}>
          <AppText variant="display" style={{ fontVariant: ['tabular-nums'] }}>
            {Number(current.value).toFixed(1).replace('.', ',')}
          </AppText>
          <AppText variant="bodyStrong" style={{ marginBottom: 12 }}>µg/m³</AppText>
        </View>
      ) : (
        <AppText variant="title">Belum ada nilai untuk jam ini</AppText>
      )}
      {category ? (
        <View style={{ alignSelf: 'flex-start', borderWidth: 1.5, borderColor: colors.outline, borderRadius: rounded.pill,
          paddingHorizontal: spacing.md, paddingVertical: spacing.xs }}>
          <AppText variant="label">{category}, mengacu ISPU</AppText>
        </View>
      ) : null}

      <View style={{ height: 1.5, backgroundColor: colors.divider, marginVertical: spacing.xs }} />
      <AppText variant="label">Beberapa jam ke depan</AppText>
      {ahead.length ? (
        <ForecastStrip points={ahead} />
      ) : (
        <AppText color="textMuted">Belum ada prakiraan untuk jam berikutnya.</AppText>
      )}

      <View style={{ gap: 2, marginTop: spacing.xs, padding: spacing.md, borderRadius: rounded.control,
        backgroundColor: colors.surface }}>
        <AppText variant="caption" color="textMuted">
          Berlaku {formatTime(current && current.validAt)}. Sumber: {advisory.attributions.join(', ') || advisory.provider}.
          Diperbarui {ageLabel(advisory.ageMinutes)}.
        </AppText>
        {category ? (
          <AppText variant="caption" color="textMuted">
            Kategori dihitung dari rata-rata prakiraan 24 jam ({pm25(advisory.category.mean24h)}), bukan pembacaan ISPU
            resmi.
          </AppText>
        ) : null}
        <CommunitySignal signal={advisory.communitySignal} />
      </View>
      {advisory.freshness === 'stale' ? (
        <Panel tone="warning" icon={TriangleAlert}>
          <AppText color="warning">
            Data tersimpan dari {formatTime(advisory.retrievedAt)}. Data terbaru belum masuk.
          </AppText>
        </Panel>
      ) : null}
      {advisory.isSynthetic ? <SimulationLabel text="Data uji sintetis." /> : null}
    </View>
  );
}

function CommunitySignal({ signal }) {
  if (!signal) return null;
  return (
    <AppText variant="caption" color="textMuted">
      {signal.suppressed || signal.reportCount === null
        ? 'Laporan warga 7 hari terakhir: belum cukup data'
        : `Laporan warga 7 hari terakhir: ${signal.reportCount}`}
      {' '}(data simulasi).
    </AppText>
  );
}

function LatestReport({ navigation }) {
  const { account } = useAuth();
  const { reports } = useUpdates();
  if (!account || account.role !== 'resident') return null;
  const latest = reports[0];
  return (
    <Section title="Laporan terakhir">
      {latest ? (
        <Row
          title={latest.complaint.split('\n')[0]}
          subtitle={<StatusPill state={latest.state} label={stateLabel(latest.state)} />}
          meta={`Dikirim ${formatTime(latest.createdAt)}`}
          onPress={() => navigation.navigate('DetailLaporan', { id: latest.id })}
        />
      ) : (
        <AppText color="textMuted">Belum ada laporan. Keluhan yang Anda kirim akan muncul di sini.</AppText>
      )}
    </Section>
  );
}

export function greeting(now = Date.now()) {
  const hour = new Date(now + 7 * 3600 * 1000).getUTCHours(); // WIB
  if (hour >= 4 && hour < 11) return 'Selamat pagi';
  if (hour >= 11 && hour < 15) return 'Selamat siang';
  if (hour >= 15 && hour < 18) return 'Selamat sore';
  return 'Selamat malam';
}

// The morning wash: a soft-yellow band with the sun-and-haze mark, bleeding to the screen edges.
function Header({ children, overlap = 0 }) {
  const { colors } = useTheme();
  return (
    <View style={{ marginHorizontal: -gutter, marginTop: -spacing.lg, paddingHorizontal: gutter,
      paddingBottom: spacing.xl + overlap, backgroundColor: colors.accentWash, overflow: 'hidden',
      borderBottomLeftRadius: 32, borderBottomRightRadius: 32 }}>
      <SunMark size={150} style={{ position: 'absolute', right: -36, bottom: overlap - 18 }} />
      {children}
    </View>
  );
}

function TopBar({ area, onChangeArea }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={{ paddingTop: insets.top + spacing.sm, flexDirection: 'row', alignItems: 'center',
      justifyContent: 'space-between' }}>
      {area ? (
        <Pressable accessibilityRole="button" accessibilityLabel={`Wilayah ${area.name}. Ganti wilayah`}
          onPress={onChangeArea} hitSlop={8}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 48 }}>
          <Icon as={MapPin} size={18} />
          <AppText variant="bodyStrong">{area.name}</AppText>
          <Icon as={ChevronDown} size={18} color="textMuted" />
        </Pressable>
      ) : (
        <AppText variant="title">Avela</AppText>
      )}
      <EmergencyButton />
    </View>
  );
}

export default function HomeScreen({ navigation }) {
  const { area, ready } = useArea();
  const { account } = useAuth();
  const advisory = useLoad(() => (area ? getAdvisory(area.id) : Promise.resolve(null)), [area && area.id],
    { refreshOnFocus: true });
  const waste = useLoad(() => (area ? getWasteRecap(area.id) : Promise.resolve(null)), [area && area.id]);
  const pickArea = () => navigation.navigate('PilihWilayah');
  const heroWidth = Math.min(useWindowDimensions().width, 600) - 2 * gutter;
  const { colors } = useTheme();

  if (ready && !area) {
    return (
      <Screen>
        <View style={{ marginHorizontal: -gutter, marginTop: -spacing.lg, paddingHorizontal: gutter,
          paddingBottom: spacing.lg, backgroundColor: colors.accentWash, borderBottomLeftRadius: 32,
          borderBottomRightRadius: 32 }}>
          <TopBar />
          <Image source={HERO} accessibilityIgnoresInvertColors resizeMode="contain"
            style={{ width: heroWidth, height: (heroWidth * 333) / 952, marginTop: spacing.xl }} />
        </View>
        <AppText variant="headline" accessibilityRole="header" style={{ marginTop: spacing.xl }}>
          Lihat kondisi asap di wilayah Anda
        </AppText>
        <AppText color="textMuted" style={{ marginTop: spacing.sm }}>
          Pilih wilayah untuk membaca prakiraan PM2.5 per jam. Avela tidak meminta lokasi Anda.
        </AppText>
        <Button label="Pilih wilayah" icon={MapPin} onPress={pickArea} style={{ marginTop: spacing.xl }} />
        <Section>
          <RowList>
            <Row image={require('../../assets/icons3d/masker.png')} title="Panduan perlindungan" subtitle="Cara melindungi diri saat udara berasap"
              onPress={() => navigation.navigate('Panduan')} />
          </RowList>
        </Section>
      </Screen>
    );
  }

  const wasteItems = waste.data && waste.data.data ? waste.data.data.items : [];
  return (
    <Screen
      refreshing={advisory.refreshing}
      onRefresh={() => {
        advisory.refresh();
        waste.refresh();
      }}
    >
      <Header overlap={56}>
        <TopBar area={area} onChangeArea={pickArea} />
        <View style={{ marginTop: spacing.lg, gap: 2, maxWidth: '72%' }}>
          <AppText variant="label" color="textMuted">{greeting()}</AppText>
          <AppText variant="headline" accessibilityRole="header">
            Udara di {area ? area.name : 'wilayah Anda'}
          </AppText>
        </View>
      </Header>

      <View style={{ marginTop: -56 }}>
        {advisory.loading ? <LoadingView /> : null}
        {advisory.error && !advisory.data ? <ErrorView message={advisory.error.message} onRetry={advisory.reload} /> : null}
        {advisory.data ? <Condition advisory={advisory.data} /> : null}
      </View>

      <Button label="Lihat panduan perlindungan" icon={ShieldCheck} onPress={() => navigation.navigate('Panduan')}
        style={{ marginTop: spacing.xl }} />

      <View style={{ flexDirection: 'row', gap: spacing.md, marginTop: spacing.lg }}>
        {!account || account.role === 'resident' ? (
          <ActionTile image={require('../../assets/icons3d/laporan.png')} title="Laporkan keluhan"
            body="Dari rumah, ditinjau petugas"
            onPress={() => navigation.navigate(account ? 'FormLaporan' : 'Laporan')} />
        ) : null}
        <ActionTile image={require('../../assets/icons3d/fasilitas.png')} title="Cari fasilitas"
          body="Layanan, jadwal, dan jarak"
          onPress={() => navigation.navigate('Fasilitas')} />
      </View>

      <LatestReport navigation={navigation} />

      <Section title="Pengelolaan sampah di wilayah ini">
        <PartnerSection envelope={waste.data} loading={waste.loading} isEmpty={!wasteItems.length}>
          {wasteItems.map((item) => (
            <View key={item.wasteType} style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
              <Icon as={Recycle} size={18} color="textMuted" />
              <AppText style={{ flex: 1 }}>
                {item.wasteType[0].toUpperCase() + item.wasteType.slice(1)}
              </AppText>
              <AppText variant="bodyStrong" style={{ fontVariant: ['tabular-nums'] }}>
                {item.volumeKg.toLocaleString('id-ID')} kg
              </AppText>
            </View>
          ))}
          {wasteItems.length && waste.data.data.period ? (
            <AppText variant="caption" color="textMuted">Periode {waste.data.data.period}</AppText>
          ) : null}
        </PartnerSection>
      </Section>
    </Screen>
  );
}
