import { useCallback, useState } from 'react';
import { View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import {
  AppText, Banner, Button, Card, EmptyState, FadeIn, Icon, ListGroup, ListRow, Screen, Section, StatusPill,
} from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { useUpdates } from '../context/UpdatesContext';
import { formatTime, hasUpdate } from '../utils/format';
import { spacing, useTheme } from '../theme';

export function ReceiptNotice() {
  return (
    <Banner tone="info" icon="information-circle-outline">
      Laporan dibaca petugas fasilitas simulasi. Ini bukan pertolongan darurat, tidak dipantau terus-menerus, dan tidak
      ada janji waktu tanggapan.
    </Banner>
  );
}

export default function ReportsScreen({ navigation }) {
  const { colors } = useTheme();
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
      <Screen title="Laporan" subtitle="Keluhan dan tinjauan petugas">
        <FadeIn>
          <Card style={{ padding: spacing.xl, gap: spacing.lg }}>
            <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: colors.surfaceContainer,
              alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="lock-closed-outline" size={24} />
            </View>
            <AppText variant="title">Masuk untuk melapor</AppText>
            <AppText color="textMuted">
              Kirim keluhan dari rumah, lalu ikuti tinjauan petugas di sini.
            </AppText>
            <Button label="Masuk" icon="log-in-outline" onPress={() => navigation.navigate('Masuk')} />
          </Card>
        </FadeIn>
        <View style={{ marginTop: spacing.lg }}>
          <ReceiptNotice />
        </View>
      </Screen>
    );
  }

  const onRefresh = async () => {
    setRefreshing(true);
    await updates.refresh();
    setRefreshing(false);
  };

  return (
    <Screen title="Laporan" subtitle="Keluhan dan tinjauan petugas" refreshing={refreshing} onRefresh={onRefresh}>
      <Button label="Buat laporan" icon="add" onPress={() => navigation.navigate('FormLaporan')} />
      <View style={{ marginTop: spacing.lg }}>
        <ReceiptNotice />
      </View>

      <Section title="Laporan saya">
        {updates.reports.length ? (
          <FadeIn>
            <ListGroup>
              {updates.reports.map((r) => (
                <ListRow
                  key={r.id}
                  title={r.complaint.split('\n')[0]}
                  marker={hasUpdate(r, markersSince)}
                  meta={
                    <View style={{ gap: spacing.sm, marginTop: spacing.xs }}>
                      <StatusPill state={r.state} />
                      <AppText variant="caption" color="textMuted">Dikirim {formatTime(r.createdAt)}</AppText>
                    </View>
                  }
                  accessibilityLabel={`${r.complaint}${hasUpdate(r, markersSince) ? ', ada pembaruan' : ''}`}
                  onPress={() => navigation.navigate('DetailLaporan', { id: r.id })}
                />
              ))}
            </ListGroup>
          </FadeIn>
        ) : (
          <EmptyState
            icon="document-text-outline"
            title="Belum ada laporan"
            body="Laporan berisi keluhan, kapan mulai, dan perkembangannya. Petugas fasilitas simulasi akan meninjaunya."
          />
        )}
      </Section>

      {updates.results.length ? (
        <Section title="Hasil pemeriksaan">
          <FadeIn>
            <ListGroup inset={72}>
              {updates.results.map((r) => (
                <ListRow
                  key={r.id}
                  icon="clipboard-outline"
                  title={r.facilityName}
                  subtitle={`Versi ${r.version}, oleh ${r.authorName}`}
                  meta={`Terbit ${formatTime(r.publishedAt)}`}
                  marker={hasUpdate(r, markersSince)}
                  onPress={() => navigation.navigate('HasilPemeriksaan', { id: r.id })}
                />
              ))}
            </ListGroup>
          </FadeIn>
        </Section>
      ) : null}
    </Screen>
  );
}
