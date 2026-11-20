// Beranda: what the data says about the area, what to do next, and the latest report state (DESIGN, Overview).
import { useState } from 'react';
import { Image, Pressable, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronDown, ChevronUp, MapPin, ShieldCheck, TriangleAlert } from 'lucide-react-native';

import EmergencyButton from '../components/EmergencyButton';
import PartnerSection from '../components/PartnerSection';
import { ActionTile, AppText, Button, ErrorView, Icon, LoadingView, Panel, Row, RowList, Screen, Section, SimulationLabel,
  StatusPill, SunMark, shadow } from '../components/ui';
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

// One plain answer before the chart: where the forecast ends up against this hour. Both numbers are said, so the word
// carries no threshold of its own.
export function forecastTrend(current, points) {
  const last = [...points].reverse().find((p) => p.value !== null);
  if (!current || current.value === null || !last) return null;
  const from = Math.round(current.value * 10);
  const to = Math.round(last.value * 10);
  return { word: to > from ? 'naik' : to < from ? 'turun' : 'tetap', last };
}

// The highest hour in the window, skipping missing values; null when every hour is missing.
export function peakPoint(points) {
  return points.reduce((top, p) => (p.value !== null && (!top || p.value > top.value) ? p : top), null);
}

function Swatch({ color, dashed, label }) {
  const { colors } = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
      <View style={{ width: 12, height: 12, borderRadius: 3, backgroundColor: dashed ? 'transparent' : colors[color],
        borderWidth: dashed ? 1.5 : 0, borderStyle: 'dashed', borderColor: colors.outline }} />
      <AppText variant="caption" color="textMuted">{label}</AppText>
    </View>
  );
}

// ISPU category colors (S-08), always beside the name in text (D-38). ISPU yellow shows as the warning amber because
// the sun yellow belongs to the primary button; ISPU black shows as ink.
const CATEGORY_TONES = {
  Baik: ['goodSurface', 'good'],
  Sedang: ['informationSurface', 'information'],
  'Tidak Sehat': ['warningSurface', 'warning'],
  'Sangat Tidak Sehat': ['dangerSurface', 'danger'],
  Berbahaya: ['selected', 'onSelected'],
};

function CategoryChip({ label }) {
  const { colors } = useTheme();
  const [bg, fg] = CATEGORY_TONES[label] || ['surface', 'text'];
  return (
    <View style={{ alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
      backgroundColor: colors[bg], borderRadius: rounded.pill, paddingHorizontal: spacing.md, paddingVertical: 6 }}>
      <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: colors[fg] }} />
      <AppText variant="label" color={bg === 'selected' ? 'onSelected' : 'text'}>{label}, mengacu ISPU</AppText>
    </View>
  );
}

// shortcut: copies the PM2.5 band edges of ISPU_BANDS in the core (D-29) and caps the last band at 500 for drawing;
// send the edges in the advisory payload if the bands ever change.
const ISPU_EDGES = [0, 15.5, 55.4, 150.4, 250.4, 500];
const ISPU_SEGMENTS = ['good', 'information', 'warning', 'danger', 'selected'];

// Where a 24-hour mean sits on a scale of five equal segments, one per ISPU band, from 0 to 1.
export function ispuPosition(mean) {
  const v = Math.min(Math.max(mean, 0), ISPU_EDGES[5]);
  let i = 0;
  while (i < 4 && v > ISPU_EDGES[i + 1]) i += 1;
  return (i + (v - ISPU_EDGES[i]) / (ISPU_EDGES[i + 1] - ISPU_EDGES[i])) / 5;
}

// The five ISPU bands in their colors with a ring at the 24-hour mean, so the chip's category has a place on a scale.
function IspuScale({ mean, label }) {
  const { colors } = useTheme();
  return (
    <View accessible accessibilityLabel={`Skala ISPU dari Baik sampai Berbahaya. Rata-rata 24 jam ${pm25(mean)}, ${label}.`}
      style={{ gap: 6 }}>
      <View style={{ height: 18, justifyContent: 'center' }}>
        <View style={{ flexDirection: 'row', height: 8, borderRadius: 4, overflow: 'hidden' }}>
          {ISPU_SEGMENTS.map((tone) => <View key={tone} style={{ flex: 1, backgroundColor: colors[tone] }} />)}
        </View>
        <View style={{ position: 'absolute', left: `${ispuPosition(mean) * 100}%`, marginLeft: -9, width: 18, height: 18,
          borderRadius: 9, borderWidth: 4, borderColor: colors.text, backgroundColor: colors.background }} />
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <AppText variant="caption" color="textMuted">Baik</AppText>
        <AppText variant="caption" color="textMuted">Berbahaya</AppText>
      </View>
    </View>
  );
}

// The next hours as a row of columns on the haze panel. A missing hour stays an empty slot, never a zero.
function ForecastStrip({ points }) {
  const { colors } = useTheme();
  const top = Math.max(1, ...points.map((p) => p.value || 0));
  const said = points.map((p) => `${formatTime(p.validAt, { withDate: false })} ${pm25(p.value)}`).join(', ');
  const peak = peakPoint(points);
  return (
    <>
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
    {/* One-line legend: the highlighted hour, missing hours when there are any, and the highest value. */}
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', columnGap: spacing.lg, rowGap: spacing.xs }}>
      <Swatch color="accent" label="Jam terdekat" />
      {points.some((p) => p.value === null) ? <Swatch dashed label="Tidak ada data" /> : null}
      <AppText variant="caption" color="textMuted">
        {peak ? `Tertinggi ${pm25(peak.value)} pukul ${formatTime(peak.validAt, { withDate: false })}` : 'Belum ada nilai'}
      </AppText>
    </View>
    </>
  );
}

function Condition({ advisory }) {
  const { colors } = useTheme();
  const [about, setAbout] = useState(false);
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
  const trend = forecastTrend(current, ahead);
  return (
    <View style={[{ padding: spacing.xl, gap: spacing.md, borderRadius: rounded.panel, backgroundColor: colors.background },
      shadow]}>
      <AppText variant="label" color="textMuted">
        {current && current.validAt
          ? `PM2.5 pukul ${formatTime(current.validAt, { withDate: false })}, prakiraan model`
          : 'PM2.5 jam ini, prakiraan model'}
      </AppText>
      {current && current.value !== null ? (
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', flexWrap: 'wrap', gap: spacing.sm }}
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
        <CategoryChip label={category} />
      ) : null}
      {category && advisory.category.mean24h !== null ? (
        <IspuScale mean={advisory.category.mean24h} label={category} />
      ) : null}

      <View style={{ height: 1, backgroundColor: colors.divider, marginVertical: spacing.xs }} />
      {trend ? (
        <AppText>
          Sampai {formatTime(trend.last.validAt, { withDate: false })}, PM2.5 diprakirakan{' '}
          <AppText variant="bodyStrong">{trend.word}</AppText> {trend.word === 'tetap' ? 'di' : 'ke'} {pm25(trend.last.value)}.
        </AppText>
      ) : (
        <AppText variant="label">Beberapa jam ke depan</AppText>
      )}
      {ahead.length ? (
        <ForecastStrip points={ahead} />
      ) : (
        <AppText color="textMuted">Belum ada prakiraan untuk jam berikutnya.</AppText>
      )}

      {/* Source and age stay in view; the method and the community signal open on request. */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md,
        marginTop: spacing.xs }}>
        <AppText variant="caption" color="textMuted" style={{ flexShrink: 1 }}>
          {advisory.attributions.join(', ') || advisory.provider}, diperbarui {ageLabel(advisory.ageMinutes)}
        </AppText>
        <Pressable accessibilityRole="button" accessibilityState={{ expanded: about }} onPress={() => setAbout(!about)}
          hitSlop={8} style={{ flexDirection: 'row', alignItems: 'center', gap: 4, minHeight: 40 }}>
          <AppText variant="label">{about ? 'Tutup' : 'Tentang data'}</AppText>
          <Icon as={about ? ChevronUp : ChevronDown} size={16} />
        </Pressable>
      </View>
      {about ? (
        <View style={{ gap: spacing.xs }}>
          <AppText variant="caption" color="textMuted">Berlaku {formatTime(current && current.validAt)}.</AppText>
          {category ? (
            <AppText variant="caption" color="textMuted">
              Kategori dihitung dari rata-rata prakiraan 24 jam ({pm25(advisory.category.mean24h)}), bukan pembacaan ISPU
              resmi.
            </AppText>
          ) : null}
          <CommunitySignal signal={advisory.communitySignal} />
        </View>
      ) : null}
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
  const wasteMax = Math.max(1, ...wasteItems.map((i) => i.volumeKg || 0));
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
          {[...wasteItems].sort((a, b) => b.volumeKg - a.volumeKg).map((item) => {
            const name = item.wasteType[0].toUpperCase() + item.wasteType.slice(1);
            const kg = `${item.volumeKg.toLocaleString('id-ID')} kg`;
            return (
              <View key={item.wasteType} accessible accessibilityLabel={`${name}: ${kg}`} style={{ gap: 6 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md }}>
                  <AppText style={{ flexShrink: 1 }}>{name}</AppText>
                  <AppText variant="bodyStrong" style={{ fontVariant: ['tabular-nums'] }}>{kg}</AppText>
                </View>
                <View style={{ height: 6, borderRadius: 3, backgroundColor: colors.surface }}>
                  <View style={{ width: `${(100 * item.volumeKg) / wasteMax}%`, height: 6, borderRadius: 3,
                    backgroundColor: colors.text }} />
                </View>
              </View>
            );
          })}
          {wasteItems.length && waste.data.data.period ? (
            <AppText variant="caption" color="textMuted">Periode {waste.data.data.period}</AppText>
          ) : null}
        </PartnerSection>
      </Section>
    </Screen>
  );
}
