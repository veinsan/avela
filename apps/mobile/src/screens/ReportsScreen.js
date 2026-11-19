import { useCallback, useState } from 'react';
import { View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import { AppText, Button, Divider, EmptyView, Panel, Row, Screen, Section } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { useUpdates } from '../context/UpdatesContext';
import { formatTime, hasUpdate, stateLabel } from '../utils/format';
import { spacing } from '../theme';

export function ReceiptNotice() {
  return (
    <Panel tone="info">
      <AppText>
        Laporan dikirim ke petugas fasilitas simulasi. Mengirim laporan bukan pertolongan darurat, tidak dipantau
        terus-menerus, dan tidak ada janji waktu tanggapan.
      </AppText>
    </Panel>
  );
}

export default function ReportsScreen({ navigation }) {
  const { account } = useAuth();
  const updates = useUpdates();
  const [markersSince, setMarkersSince] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Show what changed since the last visit, then count this visit as seen.
  useFocusEffect(
    useCallback(() => {
      if (!account) return;
      setMarkersSince(updates.seenAt);
      updates.refresh().then(updates.markSeen);
    }, [account]), // eslint-disable-line react-hooks/exhaustive-deps
  );

  if (!account) {
    return (
      <Screen>
        <AppText variant="headline" accessibilityRole="header">
          Laporan keluhan
        </AppText>
        <AppText color="textMuted" style={{ marginVertical: spacing.md }}>
          Masuk untuk mengirim keluhan dari rumah dan mengikuti tinjauan petugas.
        </AppText>
        <ReceiptNotice />
        <Button label="Masuk" onPress={() => navigation.navigate('Masuk')} style={{ marginTop: spacing.lg }} />
      </Screen>
    );
  }

  const onRefresh = async () => {
    setRefreshing(true);
    await updates.refresh();
    setRefreshing(false);
  };

  return (
    <Screen refreshing={refreshing} onRefresh={onRefresh}>
      <ReceiptNotice />
      <Button label="Buat laporan" onPress={() => navigation.navigate('FormLaporan')} style={{ marginTop: spacing.lg }} />

      <Section title="Laporan saya">
        {updates.reports.length ? (
          updates.reports.map((r) => (
            <View key={r.id}>
              <Row
                title={r.complaint.split('\n')[0]}
                subtitle={stateLabel(r.state)}
                meta={`Dikirim ${formatTime(r.createdAt)}`}
                marker={hasUpdate(r, markersSince)}
                accessibilityLabel={`${r.complaint}. ${stateLabel(r.state)}${hasUpdate(r, markersSince) ? '. Ada pembaruan' : ''}`}
                onPress={() => navigation.navigate('DetailLaporan', { id: r.id })}
              />
              <Divider />
            </View>
          ))
        ) : (
          <EmptyView
            title="Belum ada laporan."
            body="Laporan berisi keluhan, kapan mulai, dan perkembangannya. Petugas fasilitas simulasi akan meninjaunya."
          />
        )}
      </Section>

      {updates.results.length ? (
        <Section title="Hasil pemeriksaan">
          {updates.results.map((r) => (
            <View key={r.id}>
              <Row
                title={`${r.facilityName} · versi ${r.version}`}
                subtitle={`Oleh ${r.authorName}`}
                meta={`Terbit ${formatTime(r.publishedAt)}`}
                marker={hasUpdate(r, markersSince)}
                onPress={() => navigation.navigate('HasilPemeriksaan', { id: r.id })}
              />
              <Divider />
            </View>
          ))}
        </Section>
      ) : null}
    </Screen>
  );
}
