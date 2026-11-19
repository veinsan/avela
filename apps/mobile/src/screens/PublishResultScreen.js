// Terbitkan Hasil: draft, preview, then publish. A correction of a published result is a new version (D-26).
import { useState } from 'react';
import { View } from 'react-native';

import { AppText, Button, Divider, ErrorView, LoadingView, Panel, Screen, Section, SimulationLabel, TextField }
  from '../components/ui';
import { useLoad } from '../hooks/useLoad';
import { draftCorrection, draftResult, getReport, listReportResults, publishResult } from '../services/ApiService';
import { formatTime } from '../utils/format';
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
    if (await run(() => publishResult(plan.draft.id))) navigation.goBack();
  }

  return (
    <Screen>
      {report.loading || versions.loading ? <LoadingView /> : null}
      {versions.error ? <ErrorView message={versions.error.message} onRetry={versions.reload} /> : null}
      {report.data ? (
        <>
          <AppText variant="headline" accessibilityRole="header">
            Terbitkan hasil
          </AppText>
          <AppText color="textMuted">
            Laporan {owner ? `dari ${owner}` : ''}: {report.data.complaint.split('\n')[0]}
          </AppText>
          <SimulationLabel text="Hasil fiktif; hanya warga pemilik laporan yang dapat membacanya." />
          {failure ? <ErrorView message={failure} /> : null}

          {plan.mode === 'publish' ? (
            <Section title={`Pratinjau versi ${plan.draft.version}`}>
              <Panel tone="surface">
                <AppText>{plan.draft.content}</AppText>
              </Panel>
              <AppText variant="caption" color="textMuted">
                Draf oleh {plan.draft.authorName} · {plan.draft.facilityName} · {formatTime(plan.draft.createdAt)}
              </AppText>
              <Button label="Terbitkan ke warga" onPress={publish} loading={busy} />
            </Section>
          ) : (
            <Section title={plan.mode === 'correct' ? `Koreksi versi ${plan.latest.version}` : 'Hasil baru'}>
              {plan.mode === 'correct' ? (
                <AppText color="textMuted">
                  Koreksi disimpan sebagai versi baru. Versi lama tetap dapat dibaca warga.
                </AppText>
              ) : null}
              <TextField label="Hasil pemeriksaan dan arahan berikutnya" multiline value={content}
                onChangeText={setContent} error={error} maxLength={4000} />
              <Button label="Simpan draf dan lihat pratinjau" onPress={saveDraft} loading={busy} />
            </Section>
          )}

          {versions.data && versions.data.items.length ? (
            <Section title="Versi">
              {versions.data.items.map((v) => (
                <View key={v.id} style={{ paddingVertical: spacing.sm, gap: 2 }}>
                  <AppText variant="bodyStrong">
                    Versi {v.version} · {v.status === 'draft' ? 'draf' : `terbit ${formatTime(v.publishedAt)}`}
                  </AppText>
                  <AppText numberOfLines={3}>{v.content}</AppText>
                  <Divider />
                </View>
              ))}
            </Section>
          ) : null}
        </>
      ) : null}
    </Screen>
  );
}
