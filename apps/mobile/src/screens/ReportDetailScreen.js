import { useState } from 'react';
import { Clock } from 'lucide-react-native';

import { ExposurePanel, ReportFacts, StaffResponse, StateHeading, Timeline, latestEvent } from '../components/ReportParts';
import { AppText, Button, ErrorView, LoadingView, Panel, Row, RowList, Screen, Section, SimulationLabel, TextField }
  from '../components/ui';
import { useUpdates } from '../context/UpdatesContext';
import { useLoad } from '../hooks/useLoad';
import { addReportUpdate, cancelReport, getReport, listResults } from '../services/ApiService';
import { formatTime } from '../utils/format';
import { spacing } from '../theme';

export default function ReportDetailScreen({ route, navigation }) {
  const { id } = route.params;
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
      await report.refresh();
      updates.refresh().then(updates.markSeen);
      return true;
    } catch (e) {
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
          <StateHeading report={r} />
          <AppText variant="caption" color="textMuted">Dikirim {formatTime(r.createdAt)}</AppText>
          <SimulationLabel />
          {r.state === 'submitted' ? (
            <Panel tone="info" icon={Clock} style={{ marginTop: spacing.lg }}>
              <AppText color="information">Laporan terkirim. Belum ditinjau petugas.</AppText>
            </Panel>
          ) : null}
          {actionError ? <ErrorView message={actionError} /> : null}

          {response ? (
            <Section>
              <StaffResponse report={r} />
              {response.disposition === 'onsite_assessment' ? (
                <Button label="Cari fasilitas" kind="tonal"
                  onPress={() => navigation.navigate('Tabs', { screen: 'Fasilitas' })} />
              ) : null}
            </Section>
          ) : null}

          {question ? (
            <Section title="Petugas meminta informasi">
              <AppText>{question.text}</AppText>
              <TextField label="Jawaban Anda" multiline value={reply} onChangeText={setReply} error={replyError}
                maxLength={2000} />
              <Button label="Kirim jawaban" onPress={sendReply} loading={busy} />
            </Section>
          ) : null}

          {mine.length ? (
            <Section title="Hasil pemeriksaan">
              <RowList>
                {mine.map((x) => (
                  <Row key={x.id} title={`${x.facilityName}, versi ${x.version}`} meta={`Terbit ${formatTime(x.publishedAt)}`}
                    onPress={() => navigation.navigate('HasilPemeriksaan', { id: x.id })} />
                ))}
              </RowList>
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
          </Section>

          {r.state === 'submitted' ? (
            <Section>
              {confirmCancel ? (
                <>
                  <AppText>Batalkan laporan ini? Laporan yang dibatalkan tidak ditinjau.</AppText>
                  <Button label="Ya, batalkan" kind="danger" loading={busy}
                    onPress={() => act(() => cancelReport(id, r.version)).then(() => setConfirmCancel(false))} />
                  <Button label="Tidak" kind="text" onPress={() => setConfirmCancel(false)} />
                </>
              ) : (
                <Button label="Batalkan laporan" kind="tonal" onPress={() => setConfirmCancel(true)} />
              )}
            </Section>
          ) : null}
        </>
      ) : null}
    </Screen>
  );
}
