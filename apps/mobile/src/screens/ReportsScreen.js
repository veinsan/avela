import { useCallback, useState } from 'react';
import { View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Info, LogIn, SquarePen } from 'lucide-react-native';

import { AppText, Button, EmptyView, Panel, Row, RowList, Screen, StatusPill, Section } from '../components/ui';

const EMPTY = require('../../assets/illustrations/empty-reports.png');
import { useAuth } from '../context/AuthContext';
import { useUpdates } from '../context/UpdatesContext';
import { formatTime, hasUpdate, stateLabel } from '../utils/format';
import { spacing } from '../theme';

export function ReceiptNotice() {
  return (
    <Panel tone="info" icon={Info}>
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
        <EmptyView illustration={EMPTY} title="Kirim keluhan dari rumah"
          body="Masuk untuk mengirim keluhan dan mengikuti tinjauan petugas fasilitas." />
        <Button label="Masuk" icon={LogIn} onPress={() => navigation.navigate('Masuk')}
          style={{ marginTop: spacing.xl, marginBottom: spacing.xl }} />
        <ReceiptNotice />
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
      <Button label="Buat laporan" icon={SquarePen} onPress={() => navigation.navigate('FormLaporan')} />
      <View style={{ marginTop: spacing.lg }}>
        <ReceiptNotice />
      </View>

      <Section title="Laporan saya">
        {updates.reports.length ? (
          <RowList>
          {updates.reports.map((r) => (
              <Row
                key={r.id}
                title={r.complaint.split('\n')[0]}
                subtitle={<StatusPill state={r.state} label={stateLabel(r.state)} />}
                meta={`Dikirim ${formatTime(r.createdAt)}`}
                marker={hasUpdate(r, markersSince)}
                accessibilityLabel={`${r.complaint}. ${stateLabel(r.state)}${hasUpdate(r, markersSince) ? '. Ada pembaruan' : ''}`}
                onPress={() => navigation.navigate('DetailLaporan', { id: r.id })}
              />
          ))}
          </RowList>
        ) : (
          <EmptyView
            illustration={EMPTY}
            title="Belum ada laporan."
            body="Laporan berisi keluhan, kapan mulai, dan perkembangannya. Petugas fasilitas simulasi akan meninjaunya."
          />
        )}
      </Section>

      {updates.results.length ? (
        <Section title="Hasil pemeriksaan">
          <RowList>
          {updates.results.map((r) => (
              <Row
                key={r.id}
                title={`${r.facilityName}, versi ${r.version}`}
                subtitle={`Oleh ${r.authorName}`}
                meta={`Terbit ${formatTime(r.publishedAt)}`}
                marker={hasUpdate(r, markersSince)}
                onPress={() => navigation.navigate('HasilPemeriksaan', { id: r.id })}
              />
          ))}
          </RowList>
        </Section>
      ) : null}
    </Screen>
  );
}
