// Tinjau Laporan: exactly one primary action for the current state (DESIGN, Staff Queue and Review).
import { useState } from 'react';
import { View } from 'react-native';

import { ExposurePanel, ReportFacts, StaffResponse, StateHeading, Timeline } from '../components/ReportParts';
import {
  AppText, Banner, Button, Card, Chip, ChipRow, ErrorView, FadeIn, FieldError, LoadingView, Screen, Section,
  SimulationLabel, TextField,
} from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { useLoad } from '../hooks/useLoad';
import { claimReport, closeReport, getReport, requestInformation, respondToReport } from '../services/ApiService';
import { DISPOSITIONS } from '../utils/format';
import { haptic } from '../utils/haptics';
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

const DISPOSITION_ICONS = {
  self_care: 'home-outline',
  remote_follow_up: 'chatbubbles-outline',
  onsite_assessment: 'business-outline',
};

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
      haptic.success();
      setText('');
      setDisposition(null);
      await report.refresh();
    } catch (e) {
      haptic.error();
      setFailure(e.message);
      if (e.code === 'VERSION_CONFLICT') report.refresh(); // reload so the valid action shows (Flow D step 6)
    } finally {
      setBusy(null);
    }
  }

  const r = report.data;

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

  const actions = r && account ? staffActions(r, account.id) : [];
  const owner = r && r.events && r.events[0] ? r.events[0].authorName : null;

  return (
    <Screen refreshing={report.refreshing} onRefresh={report.refresh}>
      {report.loading ? <LoadingView /> : null}
      {report.error && !r ? <ErrorView message={report.error.message} onRetry={report.reload} /> : null}
      {r ? (
        <>
          <FadeIn>
            <StateHeading report={r} />
            <AppText color="textMuted" style={{ marginTop: spacing.sm }}>
              {owner ? `Dari ${owner}. ` : ''}{r.reviewerName ? `Diklaim oleh ${r.reviewerName}.` : 'Belum diklaim.'}
            </AppText>
          </FadeIn>
          {failure ? (
            <View style={{ marginTop: spacing.lg }}>
              <Banner tone="warning" title="Belum berhasil" animate>{failure}</Banner>
            </View>
          ) : null}

          <Section>
            <ExposurePanel report={r} />
          </Section>
          <Section title="Isi laporan">
            <ReportFacts report={r} />
          </Section>
          {r.state === 'responded' || r.state === 'closed' ? (
            <Section>
              <StaffResponse report={r} />
            </Section>
          ) : null}

          <Section title="Tindakan">
            {actions.includes('claim') ? (
              <Button label="Klaim laporan" icon="hand-left-outline" loading={busy === 'claim'}
                onPress={() => act('claim', () => claimReport(id, r.version))} />
            ) : null}
            {actions.includes('respond') ? (
              <Card style={{ gap: spacing.lg }}>
                <TextField label="Tanggapan atau pertanyaan untuk warga" multiline value={text} onChangeText={setText}
                  error={errors.text} maxLength={2000} />
                <View style={{ gap: spacing.sm }}>
                  <AppText variant="label">Jenis tanggapan</AppText>
                  <ChipRow>
                    {Object.entries(DISPOSITIONS).map(([value, label]) => (
                      <Chip key={value} label={label} icon={DISPOSITION_ICONS[value]} selected={disposition === value}
                        onPress={() => setDisposition(value)} />
                    ))}
                  </ChipRow>
                  <FieldError message={errors.disposition} />
                </View>
                <Button label="Terbitkan tanggapan" icon="send" loading={busy === 'respond'} onPress={respond} />
                <Button label="Minta informasi tambahan" kind="tonal" icon="help-circle-outline" loading={busy === 'ask'}
                  onPress={ask} />
              </Card>
            ) : null}
            {actions.includes('close') ? (
              <Button label="Tutup laporan" icon="checkmark-done" loading={busy === 'close'}
                onPress={() => act('close', () => closeReport(id, r.version))} />
            ) : null}
            {actions.includes('result') ? (
              <Button label="Terbitkan hasil pemeriksaan" icon="clipboard-outline"
                kind={actions.includes('close') ? 'tonal' : 'primary'}
                onPress={() => navigation.navigate('TerbitkanHasil', { reportId: id })} />
            ) : null}
            {r.state === 'in_review' && !actions.length ? (
              <Banner tone="neutral" icon="eye-outline">{`Sedang ditinjau oleh ${r.reviewerName}.`}</Banner>
            ) : null}
            {r.state === 'awaiting_information' ? (
              <Banner tone="neutral" icon="hourglass-outline">Menunggu jawaban warga.</Banner>
            ) : null}
            {r.state === 'cancelled' ? (
              <Banner tone="neutral" icon="close-circle-outline">Laporan dibatalkan oleh warga.</Banner>
            ) : null}
          </Section>

          <Section title="Riwayat">
            <Timeline report={r} />
            <SimulationLabel />
          </Section>
        </>
      ) : null}
    </Screen>
  );
}
