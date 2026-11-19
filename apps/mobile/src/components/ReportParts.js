import { View } from 'react-native';

import { AppText, Divider, Panel } from './ui';
import { COURSES, EVENT_KINDS, ROLES, dispositionLabel, formatTime, pm25, stateLabel } from '../utils/format';
import { spacing } from '../theme';

export const latestEvent = (report, kind) => [...(report.events || [])].reverse().find((e) => e.kind === kind);

// Context for the reviewer, never a verdict: no warning or danger colors (DESIGN, Exposure Context).
export function ExposurePanel({ report }) {
  const ctx = report.exposureContext;
  return (
    <Panel tone="info">
      <AppText variant="bodyStrong">Konteks paparan</AppText>
      {ctx ? (
        <>
          <AppText>
            Rata-rata {pm25(ctx.meanPm25)} · puncak {pm25(ctx.peakPm25)}
          </AppText>
          <AppText variant="caption" color="textMuted">
            {formatTime(ctx.windowStart)} sampai {formatTime(ctx.windowEnd)} · {ctx.points} titik jam · Sumber:{' '}
            {ctx.provider === 'open-meteo' ? 'Open-Meteo, CAMS' : ctx.provider}
          </AppText>
        </>
      ) : (
        <AppText>Konteks paparan tidak tersedia.</AppText>
      )}
      <AppText variant="caption" color="textMuted">
        Prakiraan wilayah, bukan dosis pribadi.
      </AppText>
    </Panel>
  );
}

export function StaffResponse({ report }) {
  const response = latestEvent(report, 'staff_response');
  if (!response) return null;
  return (
    <Panel tone="surface" style={{ borderWidth: 1, borderColor: 'transparent' }}>
      <AppText variant="title">Tanggapan petugas</AppText>
      <AppText variant="bodyStrong">{dispositionLabel(response.disposition)}</AppText>
      <AppText>{response.text}</AppText>
      <AppText variant="caption" color="textMuted">
        {response.authorName} · {formatTime(response.createdAt)} · Petugas simulasi
      </AppText>
    </Panel>
  );
}

export function ReportFacts({ report }) {
  return (
    <View style={{ gap: spacing.xs }}>
      <AppText variant="caption" color="textMuted">Keluhan</AppText>
      <AppText>{report.complaint}</AppText>
      <AppText variant="caption" color="textMuted">Mulai</AppText>
      <AppText>{formatTime(report.onsetAt)}</AppText>
      <AppText variant="caption" color="textMuted">Perkembangan</AppText>
      <AppText>{COURSES[report.course] || report.course}</AppText>
      {report.additionalContext ? (
        <>
          <AppText variant="caption" color="textMuted">Riwayat yang relevan</AppText>
          <AppText>{report.additionalContext}</AppText>
        </>
      ) : null}
    </View>
  );
}

export function Timeline({ report }) {
  return (
    <View accessibilityLabel="Riwayat laporan">
      {(report.events || []).map((e) => (
        <View key={e.id} style={{ paddingVertical: spacing.sm, gap: 2 }}>
          <AppText variant="bodyStrong">{EVENT_KINDS[e.kind] || e.kind}</AppText>
          {e.text ? <AppText>{e.text}</AppText> : null}
          <AppText variant="caption" color="textMuted">
            {ROLES[e.authorRole] || e.authorRole}: {e.authorName} · {formatTime(e.createdAt)}
          </AppText>
          <Divider />
        </View>
      ))}
    </View>
  );
}

export function StateHeading({ report }) {
  return (
    <AppText variant="headline" accessibilityRole="header">
      {stateLabel(report.state)}
    </AppText>
  );
}
