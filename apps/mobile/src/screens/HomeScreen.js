// Beranda: what the data says about the area, what to do next, and the latest report state (DESIGN, Overview).
import { View } from 'react-native';

import PartnerSection from '../components/PartnerSection';
import { AppText, Button, ErrorView, LoadingView, Panel, Screen, Section, SimulationLabel } from '../components/ui';
import { useArea } from '../context/AreaContext';
import { useAuth } from '../context/AuthContext';
import { useUpdates } from '../context/UpdatesContext';
import { useLoad } from '../hooks/useLoad';
import { getAdvisory, getWasteRecap } from '../services/ApiService';
import { ageLabel, formatTime, pm25, stateLabel } from '../utils/format';
import { rounded, spacing, useTheme } from '../theme';

export function forecastAhead(series, now = Date.now(), count = 6) {
  return (series || []).filter((p) => new Date(p.validAt).getTime() > now).slice(0, count);
}

function ForecastRows({ points }) {
  const { colors } = useTheme();
  const top = Math.max(1, ...points.map((p) => p.value || 0));
  return (
    <View style={{ gap: spacing.xs }} accessibilityLabel="Prakiraan beberapa jam ke depan">
      {points.map((p) => (
        <View key={p.validAt} style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
          <AppText variant="caption" style={{ width: 84 }}>
            {formatTime(p.validAt, { withDate: false })}
          </AppText>
          <View style={{ flex: 1, height: 8, borderRadius: rounded.small, backgroundColor: colors.divider }}>
            {p.value !== null ? (
              <View style={{ width: `${(100 * p.value) / top}%`, height: 8, borderRadius: rounded.small,
                backgroundColor: colors.outline }} />
            ) : null}
          </View>
          <AppText variant="caption" style={{ width: 96, textAlign: 'right' }}>
            {pm25(p.value)}
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
        <AppText variant="bodyStrong">Data kualitas udara belum tersedia.</AppText>
        <AppText color="textMuted">Coba lagi nanti. Informasi darurat dan panduan tetap dapat dibuka.</AppText>
      </Panel>
    );
  }
  const current = advisory.current;
  const category = advisory.category && advisory.category.label;
  return (
    <Panel>
      <AppText variant="caption" color="textMuted">
        Prakiraan model · PM2.5 · {advisory.areaName}
      </AppText>
      <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: spacing.md }}>
        <AppText variant="display" accessibilityLabel={`PM2.5 ${pm25(current && current.value)}`}>
          {current && current.value !== null ? Number(current.value).toFixed(1) : '—'}
        </AppText>
        <AppText variant="bodyStrong">µg/m³</AppText>
        {category ? (
          <View style={{ borderWidth: 1, borderColor: colors.outline, borderRadius: rounded.small,
            paddingHorizontal: spacing.sm, paddingVertical: spacing.xs }}>
            <AppText variant="label">{category} · mengacu ISPU</AppText>
          </View>
        ) : null}
      </View>
      <AppText variant="caption" color="textMuted">
        Berlaku {formatTime(current && current.validAt)} · Sumber: {advisory.attributions.join(', ') || advisory.provider}
        {' '}· diperbarui {ageLabel(advisory.ageMinutes)}
      </AppText>
      {category ? (
        <AppText variant="caption" color="textMuted">
          Kategori dari rata-rata prakiraan 24 jam ({pm25(advisory.category.mean24h)}), bukan pembacaan ISPU resmi.
        </AppText>
      ) : null}
      {advisory.freshness === 'stale' ? (
        <Panel tone="warning">
          <AppText color="warning">
            Data tersimpan dari {formatTime(advisory.retrievedAt)}. Data terbaru belum masuk.
          </AppText>
        </Panel>
      ) : null}
      {advisory.isSynthetic ? <SimulationLabel text="Data uji sintetis." /> : null}
    </Panel>
  );
}

function CommunitySignal({ signal }) {
  if (!signal) return null;
  return (
    <AppText variant="caption" color="textMuted">
      {signal.suppressed || signal.reportCount === null
        ? 'Laporan warga 7 hari terakhir: Belum cukup data'
        : `Laporan warga 7 hari terakhir: ${signal.reportCount}`}
      {' '}· data simulasi
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
        <Panel tone={latest.state === 'submitted' ? 'info' : 'neutral'}>
          <AppText variant="bodyStrong">{stateLabel(latest.state)}</AppText>
          <AppText numberOfLines={2}>{latest.complaint}</AppText>
          <Button label="Buka laporan" kind="tonal" onPress={() => navigation.navigate('DetailLaporan', { id: latest.id })} />
        </Panel>
      ) : (
        <AppText color="textMuted">Belum ada laporan.</AppText>
      )}
    </Section>
  );
}

export default function HomeScreen({ navigation }) {
  const { area, ready } = useArea();
  const { account } = useAuth();
  const advisory = useLoad(() => (area ? getAdvisory(area.id) : Promise.resolve(null)), [area && area.id],
    { refreshOnFocus: true });
  const waste = useLoad(() => (area ? getWasteRecap(area.id) : Promise.resolve(null)), [area && area.id]);

  if (ready && !area) {
    return (
      <Screen>
        <AppText variant="headline" accessibilityRole="header">
          Selamat datang di Avela
        </AppText>
        <AppText color="textMuted" style={{ marginVertical: spacing.md }}>
          Pilih wilayah untuk melihat prakiraan asap PM2.5. Aplikasi tidak meminta lokasi Anda.
        </AppText>
        <Button label="Pilih wilayah" onPress={() => navigation.navigate('PilihWilayah')} />
        <Section>
          <Button label="Panduan perlindungan" kind="tonal" onPress={() => navigation.navigate('Panduan')} />
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
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <AppText variant="headline" accessibilityRole="header">
          {area ? area.name : ''}
        </AppText>
        <Button label="Ganti wilayah" kind="text" onPress={() => navigation.navigate('PilihWilayah')} />
      </View>

      <View style={{ marginTop: spacing.md }}>
        {advisory.loading ? <LoadingView /> : null}
        {advisory.error && !advisory.data ? <ErrorView message={advisory.error.message} onRetry={advisory.reload} /> : null}
        {advisory.data ? <Condition advisory={advisory.data} /> : null}
      </View>

      {advisory.data ? (
        <Section title="Beberapa jam ke depan">
          {forecastAhead(advisory.data.series).length ? (
            <ForecastRows points={forecastAhead(advisory.data.series)} />
          ) : (
            <AppText color="textMuted">Belum ada prakiraan untuk jam berikutnya.</AppText>
          )}
          <CommunitySignal signal={advisory.data.communitySignal} />
        </Section>
      ) : null}

      <Section>
        <Button label="Lihat panduan perlindungan" onPress={() => navigation.navigate('Panduan')} />
        <Button label="Cari fasilitas kesehatan" kind="tonal" onPress={() => navigation.navigate('Fasilitas')} />
        {!account || account.role === 'resident' ? (
          <Button label="Laporkan keluhan" kind="tonal"
            onPress={() => navigation.navigate(account ? 'FormLaporan' : 'Laporan')} />
        ) : null}
      </Section>

      <LatestReport navigation={navigation} />

      <Section title="Pengelolaan sampah di wilayah ini">
        <PartnerSection envelope={waste.data} loading={waste.loading} isEmpty={!wasteItems.length}>
          {wasteItems.map((item) => (
            <AppText key={item.wasteType}>
              {item.wasteType[0].toUpperCase() + item.wasteType.slice(1)}: {item.volumeKg.toLocaleString('id-ID')} kg
              {waste.data.data.period ? ` (periode ${waste.data.data.period})` : ''}
            </AppText>
          ))}
        </PartnerSection>
      </Section>
    </Screen>
  );
}
