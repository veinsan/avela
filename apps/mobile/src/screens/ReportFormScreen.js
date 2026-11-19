import { useRef, useState } from 'react';
import { View } from 'react-native';

import { AppText, Button, Chip, ErrorView, LoadingView, Panel, Screen, Section, TextField } from '../components/ui';
import { useArea } from '../context/AreaContext';
import { useUpdates } from '../context/UpdatesContext';
import { useLoad } from '../hooks/useLoad';
import { createReport, listFacilities, newIdempotencyKey } from '../services/ApiService';
import { COURSES, formatTime, onsetIso, validateReport } from '../utils/format';
import { CONSENT_VERSION } from '../config';
import { PILOT_AREAS } from './AreaPickerScreen';
import { ReceiptNotice } from './ReportsScreen';
import { spacing } from '../theme';

export default function ReportFormScreen({ navigation }) {
  const { area } = useArea();
  const updates = useUpdates();
  const [form, setForm] = useState({
    areaId: area ? area.id : null, facilityId: null, complaint: '', onsetHoursAgo: '', course: null,
    additionalContext: '', consent: false,
  });
  const [errors, setErrors] = useState({});
  const [step, setStep] = useState('edit');
  const [sending, setSending] = useState(false);
  const [failure, setFailure] = useState(null);
  // One key and one onset per reviewed payload, so a retry after a network failure is the same request (NFR-06).
  const attempt = useRef(null);

  const facilities = useLoad(() => (form.areaId ? listFacilities(form.areaId) : Promise.resolve({ items: [] })),
    [form.areaId]);
  const set = (patch) => setForm((f) => ({ ...f, ...patch }));

  function review() {
    const found = validateReport(form);
    setErrors(found);
    if (Object.keys(found).length) return;
    attempt.current = { key: newIdempotencyKey(), onsetAt: onsetIso(form.onsetHoursAgo) };
    setFailure(null);
    setStep('review');
  }

  async function send() {
    setSending(true);
    setFailure(null);
    const body = {
      areaId: form.areaId, facilityId: form.facilityId, complaint: form.complaint.trim(),
      onsetAt: attempt.current.onsetAt, course: form.course,
      additionalContext: form.additionalContext.trim() || null, consentVersion: CONSENT_VERSION,
    };
    try {
      const report = await createReport(body, attempt.current.key);
      await updates.refresh();
      updates.markSeen();
      navigation.replace('DetailLaporan', { id: report.id });
    } catch (e) {
      setFailure(e); // the form keeps every value; "Kirim ulang" reuses the same key
    } finally {
      setSending(false);
    }
  }

  const facilityName = (facilities.data?.items || []).find((f) => f.id === form.facilityId)?.name;
  const areaName = PILOT_AREAS.find((a) => a.id === form.areaId)?.name;

  if (step === 'review') {
    return (
      <Screen>
        <AppText variant="headline" accessibilityRole="header">
          Periksa laporan
        </AppText>
        <Panel style={{ marginTop: spacing.lg }}>
          <AppText variant="caption" color="textMuted">Wilayah dan fasilitas</AppText>
          <AppText>{areaName} · {facilityName}</AppText>
          <AppText variant="caption" color="textMuted">Keluhan</AppText>
          <AppText>{form.complaint.trim()}</AppText>
          <AppText variant="caption" color="textMuted">Mulai</AppText>
          <AppText>{formatTime(attempt.current.onsetAt)} (sekitar {form.onsetHoursAgo} jam lalu)</AppText>
          <AppText variant="caption" color="textMuted">Perkembangan</AppText>
          <AppText>{COURSES[form.course]}</AppText>
          {form.additionalContext.trim() ? (
            <>
              <AppText variant="caption" color="textMuted">Riwayat yang relevan</AppText>
              <AppText>{form.additionalContext.trim()}</AppText>
            </>
          ) : null}
        </Panel>
        <View style={{ marginTop: spacing.lg }}>
          <ReceiptNotice />
        </View>
        {failure ? <ErrorView message={failure.message} /> : null}
        <Section>
          <Button label={failure && failure.retryable ? 'Kirim ulang' : 'Kirim laporan'} onPress={send} loading={sending} />
          <Button label="Ubah isian" kind="tonal" disabled={sending} onPress={() => setStep('edit')} />
        </Section>
      </Screen>
    );
  }

  return (
    <Screen>
      <AppText variant="headline" accessibilityRole="header">
        Laporan keluhan
      </AppText>
      <AppText color="textMuted" style={{ marginTop: spacing.sm }}>
        Semua isian wajib, kecuali riwayat. Laporan dibaca petugas fasilitas simulasi.
      </AppText>

      <Section title="Wilayah">
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }} accessibilityRole="radiogroup">
          {PILOT_AREAS.map((a) => (
            <Chip key={a.id} label={a.name} selected={form.areaId === a.id}
              onPress={() => set({ areaId: a.id, facilityId: null })} />
          ))}
        </View>
        {errors.areaId ? <AppText variant="caption" color="danger">{errors.areaId}</AppText> : null}
      </Section>

      <Section title="Fasilitas tujuan">
        {facilities.loading ? <LoadingView /> : null}
        {facilities.error ? <ErrorView message={facilities.error.message} onRetry={facilities.reload} /> : null}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }} accessibilityRole="radiogroup">
          {(facilities.data?.items || []).map((f) => (
            <Chip key={f.id} label={f.name} selected={form.facilityId === f.id} onPress={() => set({ facilityId: f.id })} />
          ))}
        </View>
        {facilities.data && !facilities.data.items.length ? (
          <AppText color="textMuted">Belum ada fasilitas di wilayah ini.</AppText>
        ) : null}
        {errors.facilityId ? <AppText variant="caption" color="danger">{errors.facilityId}</AppText> : null}
      </Section>

      <Section>
        <TextField label="Keluhan" hint="Contoh: batuk, sesak, mata perih." multiline value={form.complaint}
          onChangeText={(complaint) => set({ complaint })} error={errors.complaint} maxLength={2000} />
        <TextField label="Mulai berapa jam yang lalu?" hint="Angka jam, maksimal 336 (14 hari)."
          keyboardType="number-pad" value={form.onsetHoursAgo}
          onChangeText={(onsetHoursAgo) => set({ onsetHoursAgo })} error={errors.onsetHoursAgo} maxLength={3} />
      </Section>

      <Section title="Perkembangan keluhan">
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }} accessibilityRole="radiogroup">
          {Object.entries(COURSES).map(([value, label]) => (
            <Chip key={value} label={label} selected={form.course === value} onPress={() => set({ course: value })} />
          ))}
        </View>
        {errors.course ? <AppText variant="caption" color="danger">{errors.course}</AppText> : null}
      </Section>

      <Section>
        <TextField label="Riwayat yang relevan (opsional)" hint="Contoh: asma, sedang hamil, obat rutin." multiline
          value={form.additionalContext} onChangeText={(additionalContext) => set({ additionalContext })}
          error={errors.additionalContext} maxLength={2000} />
        <Chip
          label="Saya paham laporan ini bukan layanan darurat dan petugasnya simulasi."
          selected={form.consent}
          onPress={() => set({ consent: !form.consent })}
        />
        {errors.consent ? <AppText variant="caption" color="danger">{errors.consent}</AppText> : null}
      </Section>

      <Section>
        {Object.keys(errors).length ? (
          <AppText color="danger" accessibilityLiveRegion="polite">Ada isian yang perlu diperbaiki.</AppText>
        ) : null}
        <Button label="Periksa laporan" onPress={review} />
      </Section>
    </Screen>
  );
}
