// Beranda: what the data says about the area, what to do next, and the latest report state (DESIGN, Overview).
import { View } from 'react-native';

import PartnerSection from '../components/PartnerSection';
import {
  AppText, Banner, Button, Card, ErrorView, FadeIn, Icon, ListGroup, ListRow, LoadingView, Screen, Section,
  SimulationLabel, StatusPill,
} from '../components/ui';
import { useArea } from '../context/AreaContext';
import { useAuth } from '../context/AuthContext';
import { useUpdates } from '../context/UpdatesContext';
import { useLoad } from '../hooks/useLoad';
import { getAdvisory, getWasteRecap } from '../services/ApiService';
import { ageLabel, formatTime, pm25 } from '../utils/format';
import { rounded, spacing, useTheme } from '../theme';

export function forecastAhead(series, now = Date.now(), count = 6) {
  return (series || []).filter((p) => new Date(p.validAt).getTime() > now).slice(0, count);
}

function MetaLine({ icon, children }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
      <Icon name={icon} size={16} color="textMuted" />
      <AppText variant="caption" color="textMuted" style={{ flex: 1 }}>{children}</AppText>
    </View>
  );
}

function ForecastBars({ points }) {
  const { colors } = useTheme();
  const top = Math.max(1, ...points.map((p) => p.value || 0));
  const spoken = points.map((p) => `${formatTime(p.validAt, { withDate: false })} ${pm25(p.value)}`).join(', ');
  return (
    <View style={{ flexDirection: 'row', gap: spacing.sm }} accessible accessibilityLabel={`Prakiraan per jam: ${spoken}`}>
      {points.map((p, i) => (
        <View key={p.validAt} style={{ flex: 1, alignItems: 'center', gap: spacing.xs }}>
          <AppText variant="caption" style={{ color: i === 0 ? colors.text : colors.textMuted }}>
            {p.value === null ? 'n/a' : Math.round(p.value)}
          </AppText>
          <View style={{ height: 72, width: '100%', justifyContent: 'flex-end' }}>
            <View
              style={{
                height: p.value === null ? 4 : Math.max(6, (72 * p.value) / top),
                borderRadius: rounded.small,
                backgroundColor: i === 0 ? colors.text : colors.tonalPressed,
              }}
            />
          </View>
          <AppText variant="caption" color="textMuted">
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
      <Card tone="container">
        <Icon name="cloud-offline-outline" size={28} color="textMuted" />
        <AppText variant="title">Data kualitas udara belum tersedia</AppText>
        <AppText color="textMuted">Coba lagi nanti. Panduan dan nomor darurat tetap dapat dibuka.</AppText>
      </Card>
    );
  }
  const current = advisory.current;
  const label = advisory.category && advisory.category.label;
  return (
    <Card tone="container" style={{ gap: spacing.lg, padding: spacing.xl }}>
      <AppText variant="label" color="textMuted">Prakiraan model PM2.5</AppText>
      {current && current.value !== null ? (
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: spacing.sm }}>
          <AppText variant="display" accessibilityLabel={`PM2.5 ${pm25(current.value)}`}>
            {Number(current.value).toFixed(1)}
          </AppText>
          <AppText variant="bodyStrong" color="textMuted" style={{ marginBottom: 8 }}>µg/m³</AppText>
        </View>
      ) : (
        <AppText variant="title">Belum ada nilai untuk jam ini</AppText>
      )}
      {label ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flexWrap: 'wrap' }}>
          <View style={{ borderRadius: rounded.pill, backgroundColor: colors.surface, paddingHorizontal: 12, paddingVertical: 6 }}>
            <AppText variant="label">{label}</AppText>
          </View>
          <AppText variant="caption" color="textMuted">mengacu ISPU</AppText>
        </View>
      ) : null}
      <View style={{ gap: spacing.xs }}>
        <MetaLine icon="time-outline">Berlaku {formatTime(current && current.validAt, { withDate: false })}</MetaLine>
        <MetaLine icon="refresh-outline">Diperbarui {ageLabel(advisory.ageMinutes)}</MetaLine>
        <MetaLine icon="globe-outline">Sumber {advisory.attributions.join(' dan ') || advisory.provider}</MetaLine>
      </View>
      {label ? (
        <AppText variant="caption" color="textMuted">
          Kategori dihitung dari rata-rata prakiraan 24 jam ({pm25(advisory.category.mean24h)}). Ini bukan pembacaan ISPU
          resmi.
        </AppText>
      ) : null}
      {advisory.freshness === 'stale' ? (
        <Banner tone="warning" icon="hourglass-outline" title="Data tersimpan">
          {`Diambil ${formatTime(advisory.retrievedAt)}. Data terbaru belum masuk.`}
        </Banner>
      ) : null}
      {advisory.isSynthetic ? <SimulationLabel text="Data uji sintetis" /> : null}
    </Card>
  );
}

function LatestReport({ navigation }) {
  const { account } = useAuth();
  const { reports } = useUpdates();
  if (!account || account.role !== 'resident' || !reports[0]) return null;
  const latest = reports[0];
  return (
    <Section title="Laporan terakhir">
      <FadeIn>
        <ListGroup>
          <ListRow
            title={latest.complaint.split('\n')[0]}
            meta={<View style={{ marginTop: spacing.xs }}><StatusPill state={latest.state} /></View>}
            onPress={() => navigation.navigate('DetailLaporan', { id: latest.id })}
          />
        </ListGroup>
      </FadeIn>
    </Section>
  );
}

export default function HomeScreen({ navigation }) {
  const { colors } = useTheme();
  const { area, ready } = useArea();
  const { account } = useAuth();
  const isResident = !account || account.role === 'resident';
  const advisory = useLoad(() => (area ? getAdvisory(area.id) : Promise.resolve(null)), [area && area.id],
    { refreshOnFocus: true });
  const waste = useLoad(() => (area ? getWasteRecap(area.id) : Promise.resolve(null)), [area && area.id]);

  if (ready && !area) {
    return (
      <Screen title="Avela" subtitle="Pendamping warga saat asap karhutla">
        <FadeIn>
          <Card style={{ padding: spacing.xl, gap: spacing.lg }}>
            <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: colors.surfaceContainer,
              alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="location-outline" size={24} />
            </View>
            <AppText variant="title">Pilih wilayah Anda</AppText>
            <AppText color="textMuted">
              Avela menampilkan prakiraan asap PM2.5 untuk Pekanbaru dan Palangka Raya. Aplikasi tidak meminta lokasi
              Anda.
            </AppText>
            <Button label="Pilih wilayah" icon="location" onPress={() => navigation.navigate('PilihWilayah')} />
          </Card>
        </FadeIn>
        <Section>
          <ListGroup inset={72}>
            <ListRow icon="shield-checkmark-outline" title="Panduan perlindungan" subtitle="Cara mengurangi paparan asap"
              onPress={() => navigation.navigate('Panduan')} />
            <ListRow icon="business-outline" title="Fasilitas kesehatan" subtitle="Direktori simulasi"
              onPress={() => navigation.navigate('Fasilitas')} />
          </ListGroup>
        </Section>
      </Screen>
    );
  }

  const points = advisory.data ? forecastAhead(advisory.data.series) : [];
  const signal = advisory.data && advisory.data.communitySignal;
  const wasteData = waste.data && waste.data.data;
  const wasteItems = wasteData ? wasteData.items : [];
  const wasteTop = Math.max(1, ...wasteItems.map((i) => i.volumeKg));

  return (
    <Screen
      title={area ? area.name : 'Beranda'}
      subtitle="Kondisi asap di wilayah Anda"
      refreshing={advisory.refreshing}
      onRefresh={() => {
        advisory.refresh();
        waste.refresh();
      }}
    >
      <Button
        label="Ganti wilayah"
        kind="ghost"
        icon="swap-horizontal"
        onPress={() => navigation.navigate('PilihWilayah')}
        style={{ alignSelf: 'flex-start', marginTop: -spacing.md, marginLeft: -spacing.md, marginBottom: spacing.sm }}
      />

      {advisory.loading ? <LoadingView /> : null}
      {advisory.error && !advisory.data ? <ErrorView message={advisory.error.message} onRetry={advisory.reload} /> : null}
      {advisory.data ? (
        <FadeIn>
          <Condition advisory={advisory.data} />
        </FadeIn>
      ) : null}

      {advisory.data && advisory.data.freshness !== 'unavailable' ? (
        <Section title="Enam jam ke depan">
          <FadeIn index={1}>
            <Card>
              {points.length ? (
                <ForecastBars points={points} />
              ) : (
                <AppText color="textMuted">Belum ada prakiraan untuk jam berikutnya.</AppText>
              )}
              <AppText variant="caption" color="textMuted">Nilai dalam µg/m³, waktu dalam WIB.</AppText>
            </Card>
          </FadeIn>
        </Section>
      ) : null}

      {signal ? (
        <FadeIn index={2} style={{ marginTop: spacing.lg }}>
          <ListGroup>
            <ListRow
              icon="people-outline"
              title={signal.suppressed || signal.reportCount === null ? 'Belum cukup data' : `${signal.reportCount} laporan`}
              subtitle="Laporan warga di wilayah ini, 7 hari terakhir (data simulasi)"
            />
          </ListGroup>
        </FadeIn>
      ) : null}

      <View style={{ marginTop: spacing.xl, gap: spacing.md }}>
        <Button label="Lihat panduan perlindungan" icon="shield-checkmark" onPress={() => navigation.navigate('Panduan')} />
        <ListGroup inset={72}>
          {isResident ? (
            <ListRow
              icon="create-outline"
              title="Laporkan keluhan"
              subtitle="Petugas fasilitas simulasi akan meninjau"
              onPress={() => navigation.navigate(account ? 'FormLaporan' : 'Laporan')}
            />
          ) : null}
          <ListRow icon="business-outline" title="Cari fasilitas kesehatan" subtitle="Layanan dan jadwal buka"
            onPress={() => navigation.navigate('Fasilitas')} />
        </ListGroup>
      </View>

      <LatestReport navigation={navigation} />

      <Section title="Pengelolaan sampah">
        <Card>
          <PartnerSection envelope={waste.data} loading={waste.loading} isEmpty={!wasteItems.length}>
            {wasteItems.map((item) => (
              <View key={item.wasteType} style={{ gap: spacing.xs }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <AppText>{item.wasteType[0].toUpperCase() + item.wasteType.slice(1)}</AppText>
                  <AppText variant="bodyStrong">{item.volumeKg.toLocaleString('id-ID')} kg</AppText>
                </View>
                <View style={{ height: 6, borderRadius: 3, backgroundColor: colors.surfaceContainer }}>
                  <View style={{ height: 6, borderRadius: 3, width: `${(100 * item.volumeKg) / wasteTop}%`,
                    backgroundColor: colors.outline }} />
                </View>
              </View>
            ))}
            {wasteData && wasteData.period ? (
              <AppText variant="caption" color="textMuted">Periode {wasteData.period}</AppText>
            ) : null}
          </PartnerSection>
        </Card>
      </Section>
    </Screen>
  );
}
