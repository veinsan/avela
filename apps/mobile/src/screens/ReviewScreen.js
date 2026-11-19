// Tinjau Laporan: exactly one primary action for the current state (DESIGN, Staff Queue and Review).
import { useState } from 'react';
import { View } from 'react-native';

import { ExposurePanel, ReportFacts, StaffResponse, StateHeading, Timeline } from '../components/ReportParts';
import { AppText, Button, Chip, ErrorView, LoadingView, Panel, Screen, Section, SimulationLabel, TextField }
  from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { useLoad } from '../hooks/useLoad';
import { claimReport, closeReport, getReport, requestInformation, respondToReport } from '../services/ApiService';
import { DISPOSITIONS, formatTime } from '../utils/format';
import { spacing } from '../theme';

// What the signed-in staff member can do with a report in this state.
export function staffActions(report, accountId) {
  const mine = report.reviewerId === accountId;
  switch (report.state) {
    case 'submitted':
      return ['claim'];
    case 'in_review':
      return mine ? ['respond', 'ask'] : [];
    case 'responded':
      return mine ? ['close', 'result'] : ['result'];
    case 'closed':
      return ['result'];
    default:
      return [];
  }
}

export default function ReviewScreen({ route, navigation }) {
  const { id } = route.params;
  const { account } = useAuth();
  const report = useLoad(() => getReport(id), [id], { refreshOnFocus: true });
  const [text, setText] = useState('');
  const [disposition, setDisposition] = useState(null);
  const [errors, setErrors] = useState({});
  const [failure, setFailure] = useState(null);
  const [busy, setBusy] = useState(null);

  async function act(name, call) {
    setBusy(name);
    setFailure(null);
    try {
      await call();
      setText('');
      setDisposition(null);
      await report.refresh();
    } catch (e) {
      setFailure(e.message);
      if (e.code === 'VERSION_CONFLICT') report.refresh(); // reload so the valid action shows (Flow D step 6)
    } finally {
      setBusy(null);
    }
  }

  function respond() {
    const found = {};
    if (!text.trim()) found.text = 'Tulis tanggapan untuk warga.';
    if (!disposition) found.disposition = 'Pilih jenis tanggapan.';
    setErrors(found);
    if (!Object.keys(found).length) act('respond', () => respondToReport(id, r.version, text.trim(), disposition));
  }

  function ask() {
    if (!text.trim()) return setErrors({ text: 'Tulis pertanyaan untuk warga.' });
    setErrors({});
    act('ask', () => requestInformation(id, r.version, text.trim()));
  }

  const r = report.data;
  const actions = r && account ? staffActions(r, account.id) : [];
  const owner = r && r.events && r.events[0] ? r.events[0].authorName : null;

  return (
    <Screen refreshing={report.refreshing} onRefresh={report.refresh}>
      {report.loading ? <LoadingView /> : null}
      {report.error && !r ? <ErrorView message={report.error.message} onRetry={report.reload} /> : null}
      {r ? (
        <>
          <StateHeading report={r} />
          <AppText color="textMuted">
            {owner ? `Dari ${owner} · ` : ''}masuk {formatTime(r.createdAt)}
          </AppText>
          <AppText color="textMuted">{r.reviewerName ? `Diklaim oleh ${r.reviewerName}` : 'Belum diklaim'}</AppText>
          <SimulationLabel />
          {failure ? <ErrorView message={failure} /> : null}

          <Section title="Keluhan">
            <ReportFacts report={r} />
          </Section>
          <Section>
            <ExposurePanel report={r} />
          </Section>
          <Section>
            <StaffResponse report={r} />
          </Section>

          <Section title="Tindakan">
            {actions.includes('claim') ? (
              <Button label="Klaim laporan" loading={busy === 'claim'} onPress={() => act('claim', () => claimReport(id, r.version))} />
            ) : null}
            {actions.includes('respond') ? (
              <View style={{ gap: spacing.md }}>
                <TextField label="Tanggapan atau pertanyaan untuk warga" multiline value={text} onChangeText={setText}
                  error={errors.text} maxLength={2000} />
                <AppText variant="label">Jenis tanggapan</AppText>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }} accessibilityRole="radiogroup">
                  {Object.entries(DISPOSITIONS).map(([value, label]) => (
                    <Chip key={value} label={label} selected={disposition === value} onPress={() => setDisposition(value)} />
                  ))}
                </View>
                {errors.disposition ? <AppText variant="caption" color="danger">{errors.disposition}</AppText> : null}
                <Button label="Terbitkan tanggapan" loading={busy === 'respond'} onPress={respond} />
                <Button label="Minta informasi tambahan" kind="tonal" loading={busy === 'ask'} onPress={ask} />
              </View>
            ) : null}
            {actions.includes('close') ? (
              <Button label="Tutup laporan" loading={busy === 'close'} onPress={() => act('close', () => closeReport(id, r.version))} />
            ) : null}
            {actions.includes('result') ? (
              <Button label="Terbitkan hasil pemeriksaan" kind={actions.includes('close') ? 'tonal' : 'primary'}
                onPress={() => navigation.navigate('TerbitkanHasil', { reportId: id })} />
            ) : null}
            {r.state === 'in_review' && !actions.length ? (
              <Panel tone="info"><AppText>Sedang ditinjau oleh {r.reviewerName}.</AppText></Panel>
            ) : null}
            {r.state === 'awaiting_information' ? (
              <Panel tone="info"><AppText>Menunggu jawaban warga.</AppText></Panel>
            ) : null}
            {r.state === 'cancelled' ? (
              <Panel tone="neutral"><AppText>Laporan dibatalkan oleh warga.</AppText></Panel>
            ) : null}
          </Section>

          <Section title="Riwayat">
            <Timeline report={r} />
          </Section>
        </>
      ) : null}
    </Screen>
  );
}
