import { useRef, useState } from 'react';
import { View } from 'react-native';

import {
  AppText, Button, Card, Chip, ChipRow, Divider, ErrorView, FadeIn, FieldError, LoadingView, Screen, Section,
  TextField,
} from '../components/ui';
import { useArea } from '../context/AreaContext';
import { useUpdates } from '../context/UpdatesContext';
import { useLoad } from '../hooks/useLoad';
import { createReport, listFacilities, newIdempotencyKey } from '../services/ApiService';
import { COURSES, formatTime, onsetIso, validateReport } from '../utils/format';
import { haptic } from '../utils/haptics';
import { CONSENT_VERSION } from '../config';
import { PILOT_AREAS } from './AreaPickerScreen';
import { ReceiptNotice } from './ReportsScreen';
import { rounded, spacing, useTheme } from '../theme';

function Step({ step }) {
  const { colors } = useTheme();
  return (
    <View style={{ gap: spacing.sm }}>
      <AppText variant="label" color="textMuted">Langkah {step} dari 2</AppText>
      <View style={{ flexDirection: 'row', gap: spacing.xs }}>
        {[1, 2].map((n) => (
          <View key={n} style={{ flex: 1, height: 4, borderRadius: rounded.pill,
            backgroundColor: n <= step ? colors.text : colors.tonal }} />
        ))}
      </View>
    </View>
  );
}

function Summary({ label, value }) {
  return (
    <View style={{ paddingVertical: spacing.md, gap: 2 }}>
      <AppText variant="caption" color="textMuted">{label}</AppText>
      <AppText>{value}</AppText>
    </View>
  );
}

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
    if (Object.keys(found).length) {
      haptic.error();
      return;
    }
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
      haptic.success();
      await updates.refresh();
      updates.markSeen();
      navigation.replace('DetailLaporan', { id: report.id, justSent: true });
    } catch (e) {
      haptic.error();
      setFailure(e); // the form keeps every value; "Kirim ulang" reuses the same key
    } finally {
      setSending(false);
    }
  }

  const facilityName = (facilities.data?.items || []).find((f) => f.id === form.facilityId)?.name;
  const areaName = PILOT_AREAS.find((a) => a.id === form.areaId)?.name;

  if (step === 'review') {
    const rows = [
      ['Wilayah', areaName],
      ['Fasilitas tujuan', facilityName],
      ['Keluhan', form.complaint.trim()],
      ['Mulai', `${formatTime(attempt.current.onsetAt)}, sekitar ${form.onsetHoursAgo} jam lalu`],
      ['Perkembangan', COURSES[form.course]],
      form.additionalContext.trim() ? ['Riwayat yang relevan', form.additionalContext.trim()] : null,
    ].filter(Boolean);
    return (
      <Screen
        footer={
          <View style={{ gap: spacing.sm }}>
            <Button label={failure && failure.retryable ? 'Kirim ulang' : 'Kirim laporan'} icon="paper-plane"
              onPress={send} loading={sending} />
            <Button label="Ubah isian" kind="ghost" icon="create-outline" disabled={sending} onPress={() => setStep('edit')} />
          </View>
        }
      >
        <Step step={2} />
        <AppText variant="headline" style={{ marginTop: spacing.lg }} accessibilityRole="header">Periksa laporan</AppText>
        <FadeIn>
          <Card style={{ marginTop: spacing.lg, paddingVertical: spacing.xs, gap: 0 }}>
            {rows.map(([label, value], i) => (
              <View key={label}>
                {i > 0 ? <Divider /> : null}
                <Summary label={label} value={value} />
              </View>
            ))}
          </Card>
        </FadeIn>
        <View style={{ marginTop: spacing.lg }}>
          <ReceiptNotice />
        </View>
        {failure ? <ErrorView message={failure.message} /> : null}
      </Screen>
    );
  }

  return (
    <Screen footer={<Button label="Periksa laporan" icon="arrow-forward" onPress={review} />}>
      <Step step={1} />
      <AppText variant="headline" style={{ marginTop: spacing.lg }} accessibilityRole="header">Ceritakan keluhan Anda</AppText>
      <AppText color="textMuted" style={{ marginTop: spacing.xs }}>
        Semua isian wajib, kecuali riwayat. Laporan dibaca petugas fasilitas simulasi.
      </AppText>

      <Section title="Wilayah">
        <ChipRow>
          {PILOT_AREAS.map((a) => (
            <Chip key={a.id} label={a.name} icon="location-outline" selected={form.areaId === a.id}
              onPress={() => set({ areaId: a.id, facilityId: null })} />
          ))}
        </ChipRow>
        <FieldError message={errors.areaId} />
      </Section>

      <Section title="Fasilitas tujuan">
        {facilities.loading ? <LoadingView card={false} /> : null}
        {facilities.error ? <ErrorView message={facilities.error.message} onRetry={facilities.reload} /> : null}
        <ChipRow>
          {(facilities.data?.items || []).map((f) => (
            <Chip key={f.id} label={f.name} icon="business-outline" selected={form.facilityId === f.id}
              onPress={() => set({ facilityId: f.id })} />
          ))}
        </ChipRow>
        {facilities.data && !facilities.data.items.length ? (
          <AppText color="textMuted">Belum ada fasilitas di wilayah ini.</AppText>
        ) : null}
        <FieldError message={errors.facilityId} />
      </Section>

      <Section title="Keluhan">
        <TextField label="Apa yang Anda rasakan?" hint="Contoh: batuk, sesak, mata perih." multiline value={form.complaint}
          onChangeText={(complaint) => set({ complaint })} error={errors.complaint} maxLength={2000} />
        <TextField label="Mulai berapa jam yang lalu?" hint="Angka jam, paling lama 336 jam (14 hari)."
          keyboardType="number-pad" value={form.onsetHoursAgo}
          onChangeText={(onsetHoursAgo) => set({ onsetHoursAgo })} error={errors.onsetHoursAgo} maxLength={3} />
      </Section>

      <Section title="Perkembangan">
        <ChipRow>
          {Object.entries(COURSES).map(([value, label]) => (
            <Chip key={value} label={label} selected={form.course === value} onPress={() => set({ course: value })} />
          ))}
        </ChipRow>
        <FieldError message={errors.course} />
      </Section>

      <Section title="Riwayat">
        <TextField label="Riwayat yang relevan (opsional)" hint="Contoh: asma, sedang hamil, obat rutin." multiline
          value={form.additionalContext} onChangeText={(additionalContext) => set({ additionalContext })}
          error={errors.additionalContext} maxLength={2000} />
      </Section>

      <Section title="Persetujuan">
        <Chip
          label="Saya paham ini bukan layanan darurat dan petugasnya simulasi."
          icon="square-outline"
          selected={form.consent}
          onPress={() => set({ consent: !form.consent })}
        />
        <FieldError message={errors.consent} />
      </Section>

      {Object.keys(errors).length ? (
        <AppText color="danger" accessibilityLiveRegion="polite" style={{ marginTop: spacing.lg }}>
          Ada isian yang perlu diperbaiki.
        </AppText>
      ) : null}
    </Screen>
  );
}
