import { useState } from 'react';
import { View } from 'react-native';

import { ExposurePanel, ReportFacts, StaffResponse, StateHeading, Timeline, latestEvent } from '../components/ReportParts';
import {
  AppText, Banner, Button, Card, ErrorView, FadeIn, ListGroup, ListRow, LoadingView, Screen, Section, SimulationLabel,
  TextField,
} from '../components/ui';
import { useUpdates } from '../context/UpdatesContext';
import { useLoad } from '../hooks/useLoad';
import { addReportUpdate, cancelReport, getReport, listResults } from '../services/ApiService';
import { formatTime } from '../utils/format';
import { haptic } from '../utils/haptics';
import { spacing } from '../theme';

export default function ReportDetailScreen({ route, navigation }) {
  const { id, justSent } = route.params;
  const updates = useUpdates();
  const report = useLoad(() => getReport(id), [id], { refreshOnFocus: true });
  const results = useLoad(() => listResults(), [id], { refreshOnFocus: true });
  const [reply, setReply] = useState('');
  const [replyError, setReplyError] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);

  async function act(call) {
    setBusy(true);
    setActionError(null);
    try {
      await call();
      haptic.success();
      await report.refresh();
      updates.refresh().then(updates.markSeen);
      return true;
    } catch (e) {
      haptic.error();
      setActionError(e.message);
      if (e.code === 'VERSION_CONFLICT') report.refresh(); // someone changed it first; show the new state
      return false;
    } finally {
      setBusy(false);
    }
  }

  async function sendReply() {
    if (!reply.trim()) return setReplyError('Tulis jawaban terlebih dahulu.');
    setReplyError(null);
    if (await act(() => addReportUpdate(id, report.data.version, reply.trim()))) setReply('');
  }

  const r = report.data;
  const mine = (results.data?.items || []).filter((x) => x.reportId === id);
  const question = r && r.state === 'awaiting_information' ? latestEvent(r, 'information_request') : null;
  const response = r ? latestEvent(r, 'staff_response') : null;

  return (
    <Screen refreshing={report.refreshing} onRefresh={report.refresh}>
      {report.loading ? <LoadingView /> : null}
      {report.error && !r ? <ErrorView message={report.error.message} onRetry={report.reload} /> : null}
      {r ? (
        <>
          <FadeIn>
            <StateHeading report={r} />
          </FadeIn>
          <View style={{ gap: spacing.md, marginTop: spacing.lg }}>
            {justSent && r.state === 'submitted' ? (
              <Banner tone="info" icon="checkmark-circle-outline" title="Laporan terkirim" animate>
                Belum ditinjau petugas. Status akan berubah di sini.
              </Banner>
            ) : r.state === 'submitted' ? (
              <Banner tone="info" icon="paper-plane-outline">Laporan terkirim. Belum ditinjau petugas.</Banner>
            ) : null}
            {actionError ? <Banner tone="warning" title="Belum berhasil" animate>{actionError}</Banner> : null}
          </View>

          {question ? (
            <Section title="Petugas bertanya">
              <FadeIn>
                <Card style={{ gap: spacing.lg }}>
                  <AppText variant="bodyStrong">{question.text}</AppText>
                  <TextField label="Jawaban Anda" multiline value={reply} onChangeText={setReply} error={replyError}
                    maxLength={2000} />
                  <Button label="Kirim jawaban" icon="send" onPress={sendReply} loading={busy} />
                </Card>
              </FadeIn>
            </Section>
          ) : null}

          {response ? (
            <Section>
              <FadeIn>
                <StaffResponse report={r} />
              </FadeIn>
              {response.disposition === 'onsite_assessment' ? (
                <Button label="Cari fasilitas" kind="tonal" icon="business-outline"
                  onPress={() => navigation.navigate('Tabs', { screen: 'Fasilitas' })} />
              ) : null}
            </Section>
          ) : null}

          {mine.length ? (
            <Section title="Hasil pemeriksaan">
              <ListGroup inset={72}>
                {mine.map((x) => (
                  <ListRow key={x.id} icon="clipboard-outline" title={x.facilityName} subtitle={`Versi ${x.version}`}
                    meta={`Terbit ${formatTime(x.publishedAt)}`}
                    onPress={() => navigation.navigate('HasilPemeriksaan', { id: x.id })} />
                ))}
              </ListGroup>
            </Section>
          ) : null}

          <Section>
            <ExposurePanel report={r} />
          </Section>
          <Section title="Riwayat">
            <Timeline report={r} />
          </Section>
          <Section title="Isi laporan">
            <ReportFacts report={r} />
            <SimulationLabel />
          </Section>

          {r.state === 'submitted' ? (
            <Section>
              {confirmCancel ? (
                <FadeIn>
                  <Card style={{ gap: spacing.md }}>
                    <AppText variant="bodyStrong">Batalkan laporan ini?</AppText>
                    <AppText color="textMuted">Laporan yang dibatalkan tidak akan ditinjau.</AppText>
                    <Button label="Ya, batalkan" kind="danger" icon="close-circle-outline" loading={busy}
                      onPress={() => act(() => cancelReport(id, r.version)).then(() => setConfirmCancel(false))} />
                    <Button label="Tidak jadi" kind="ghost" onPress={() => setConfirmCancel(false)} />
                  </Card>
                </FadeIn>
              ) : (
                <Button label="Batalkan laporan" kind="ghost" icon="close-circle-outline" onPress={() => setConfirmCancel(true)} />
              )}
            </Section>
          ) : null}
        </>
      ) : null}
    </Screen>
  );
}
