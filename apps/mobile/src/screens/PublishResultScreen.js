// Terbitkan Hasil: draft, preview, then publish. A correction of a published result is a new version (D-26).
import { useState } from 'react';
import { View } from 'react-native';

import {
  AppText, Banner, Button, Card, ErrorView, FadeIn, ListGroup, ListRow, LoadingView, Screen, Section, SimulationLabel,
  TextField,
} from '../components/ui';
import { useLoad } from '../hooks/useLoad';
import { draftCorrection, draftResult, getReport, listReportResults, publishResult } from '../services/ApiService';
import { formatTime } from '../utils/format';
import { haptic } from '../utils/haptics';
import { spacing } from '../theme';

export function resultPlan(versions) {
  const draft = versions.find((v) => v.status === 'draft') || null;
  const published = versions.filter((v) => v.status === 'published');
  const latest = published.length ? published[published.length - 1] : null;
  return { draft, latest, mode: draft ? 'publish' : latest ? 'correct' : 'new' };
}

export default function PublishResultScreen({ route, navigation }) {
  const { reportId } = route.params;
  const report = useLoad(() => getReport(reportId), [reportId]);
  const versions = useLoad(() => listReportResults(reportId), [reportId]);
  const [content, setContent] = useState('');
  const [error, setError] = useState(null);
  const [failure, setFailure] = useState(null);
  const [busy, setBusy] = useState(false);

  const plan = resultPlan(versions.data ? versions.data.items : []);
  const owner = report.data && report.data.events[0] ? report.data.events[0].authorName : '';

  async function run(call) {
    setBusy(true);
    setFailure(null);
    try {
      await call();
      await versions.refresh();
      return true;
    } catch (e) {
      haptic.error();
      setFailure(e.message);
      versions.refresh();
      return false;
    } finally {
      setBusy(false);
    }
  }

  async function saveDraft() {
    if (content.trim().length < 3) return setError('Tulis hasil dan arahan berikutnya, minimal 3 huruf.');
    setError(null);
    const ok = await run(() => (plan.latest ? draftCorrection(plan.latest.id, content.trim()) : draftResult(reportId, content.trim())));
    if (ok) setContent('');
  }

  async function publish() {
    if (await run(() => publishResult(plan.draft.id))) {
      haptic.success();
      navigation.goBack();
    }
  }

  const footer = !versions.data ? null : plan.mode === 'publish' ? (
    <Button label="Terbitkan ke warga" icon="send" onPress={publish} loading={busy} />
  ) : (
    <Button label="Simpan draf dan pratinjau" icon="eye-outline" onPress={saveDraft} loading={busy} />
  );

  return (
    <Screen footer={footer}>
      {report.loading || versions.loading ? <LoadingView /> : null}
      {versions.error ? <ErrorView message={versions.error.message} onRetry={versions.reload} /> : null}
      {report.data ? (
        <FadeIn>
          <AppText variant="headline" accessibilityRole="header">Hasil pemeriksaan</AppText>
          <AppText color="textMuted" style={{ marginTop: spacing.xs }}>
            {owner ? `Untuk ${owner}. ` : ''}Laporan: {report.data.complaint.split('\n')[0]}
          </AppText>
          <SimulationLabel text="Hasil fiktif. Hanya warga pemilik laporan yang dapat membacanya." />
          {failure ? (
            <View style={{ marginTop: spacing.lg }}>
              <Banner tone="warning" title="Belum berhasil" animate>{failure}</Banner>
            </View>
          ) : null}

          {plan.mode === 'publish' ? (
            <Section title={`Pratinjau versi ${plan.draft.version}`}>
              <Card>
                <AppText>{plan.draft.content}</AppText>
                <AppText variant="caption" color="textMuted">
                  Draf oleh {plan.draft.authorName}, {plan.draft.facilityName}. {formatTime(plan.draft.createdAt)}.
                </AppText>
              </Card>
              <Banner tone="info" icon="eye-outline">Warga baru dapat membaca hasil ini setelah diterbitkan.</Banner>
            </Section>
          ) : (
            <Section title={plan.mode === 'correct' ? `Koreksi versi ${plan.latest.version}` : 'Hasil baru'}>
              {plan.mode === 'correct' ? (
                <AppText color="textMuted">Koreksi disimpan sebagai versi baru. Versi lama tetap dapat dibaca warga.</AppText>
              ) : null}
              <TextField label="Hasil pemeriksaan dan arahan berikutnya" multiline value={content}
                onChangeText={setContent} error={error} maxLength={4000} />
            </Section>
          )}

          {versions.data && versions.data.items.length ? (
            <Section title="Versi">
              <ListGroup inset={72}>
                {versions.data.items.map((v) => (
                  <ListRow
                    key={v.id}
                    icon={v.status === 'draft' ? 'create-outline' : 'document-text-outline'}
                    title={`Versi ${v.version}${v.status === 'draft' ? ', draf' : ''}`}
                    subtitle={v.content}
                    meta={v.publishedAt ? `Terbit ${formatTime(v.publishedAt)}` : undefined}
                  />
                ))}
              </ListGroup>
            </Section>
          ) : null}
        </FadeIn>
      ) : null}
    </Screen>
  );
}
