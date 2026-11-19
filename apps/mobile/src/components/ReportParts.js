import { View } from 'react-native';

import { AppText, Card, Divider, Icon, StatusPill } from './ui';
import { COURSES, EVENT_KINDS, ROLES, dispositionLabel, formatTime, pm25 } from '../utils/format';
import { rounded, spacing, useTheme } from '../theme';

export const latestEvent = (report, kind) => [...(report.events || [])].reverse().find((e) => e.kind === kind);

// Context for the reviewer, never a verdict: no warning or danger colors (DESIGN, Exposure Context).
export function ExposurePanel({ report }) {
  const { colors } = useTheme();
  const ctx = report.exposureContext;
  return (
    <View style={{ backgroundColor: colors.informationSurface, borderRadius: rounded.control, padding: spacing.lg, gap: spacing.md }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
        <Icon name="cloudy-outline" size={20} color="information" />
        <AppText variant="bodyStrong" style={{ flex: 1 }}>Konteks paparan</AppText>
      </View>
      {ctx ? (
        <>
          <View style={{ flexDirection: 'row', gap: spacing.lg }}>
            <View style={{ flex: 1 }}>
              <AppText variant="caption" color="textMuted">Rata-rata</AppText>
              <AppText variant="title">{pm25(ctx.meanPm25)}</AppText>
            </View>
            <View style={{ flex: 1 }}>
              <AppText variant="caption" color="textMuted">Puncak</AppText>
              <AppText variant="title">{pm25(ctx.peakPm25)}</AppText>
            </View>
          </View>
          <AppText variant="caption" color="textMuted">
            {formatTime(ctx.windowStart)} sampai {formatTime(ctx.windowEnd)}, {ctx.points} titik jam. Sumber{' '}
            {ctx.provider === 'open-meteo' ? 'Open-Meteo dan CAMS' : ctx.provider}.
          </AppText>
        </>
      ) : (
        <AppText>Konteks paparan tidak tersedia.</AppText>
      )}
      <AppText variant="caption" color="textMuted">Prakiraan wilayah, bukan dosis pribadi.</AppText>
    </View>
  );
}

export function StaffResponse({ report }) {
  const response = latestEvent(report, 'staff_response');
  if (!response) return null;
  return (
    <Card style={{ gap: spacing.md }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
        <Icon name="chatbubble-ellipses-outline" size={20} />
        <AppText variant="title" style={{ flex: 1 }}>Tanggapan petugas</AppText>
      </View>
      <AppText variant="bodyStrong">{dispositionLabel(response.disposition)}</AppText>
      <AppText>{response.text}</AppText>
      <AppText variant="caption" color="textMuted">
        {response.authorName}, petugas simulasi. {formatTime(response.createdAt)}.
      </AppText>
    </Card>
  );
}

function Fact({ label, value }) {
  return (
    <View style={{ paddingVertical: spacing.md, gap: 2 }}>
      <AppText variant="caption" color="textMuted">{label}</AppText>
      <AppText>{value}</AppText>
    </View>
  );
}

export function ReportFacts({ report }) {
  const facts = [
    ['Keluhan', report.complaint],
    ['Mulai', formatTime(report.onsetAt)],
    ['Perkembangan', COURSES[report.course] || report.course],
    report.additionalContext ? ['Riwayat yang relevan', report.additionalContext] : null,
  ].filter(Boolean);
  return (
    <Card style={{ paddingVertical: spacing.xs, gap: 0 }}>
      {facts.map(([label, value], i) => (
        <View key={label}>
          {i > 0 ? <Divider /> : null}
          <Fact label={label} value={value} />
        </View>
      ))}
    </Card>
  );
}

const EVENT_ICONS = {
  submitted: 'paper-plane-outline',
  claimed: 'hand-left-outline',
  information_request: 'help-circle-outline',
  resident_update: 'return-down-forward-outline',
  staff_response: 'chatbubble-ellipses-outline',
  closed: 'checkmark-done-outline',
  cancelled: 'close-circle-outline',
};

// A vertical line with one node per event; staff and resident events get different icons (DESIGN, timeline).
export function Timeline({ report }) {
  const { colors } = useTheme();
  const events = report.events || [];
  return (
    <View accessibilityLabel="Riwayat laporan">
      {events.map((e, i) => {
        const last = i === events.length - 1;
        return (
          <View key={e.id} style={{ flexDirection: 'row', gap: spacing.md }}>
            <View style={{ alignItems: 'center', width: 32 }}>
              <View style={{ width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center',
                backgroundColor: last ? colors.selected : colors.surface }}>
                <Icon name={EVENT_ICONS[e.kind] || 'ellipse-outline'} size={16} color={last ? 'onSelected' : 'text'} />
              </View>
              {last ? null : <View style={{ flex: 1, width: 2, backgroundColor: colors.divider, marginVertical: 2 }} />}
            </View>
            <View style={{ flex: 1, paddingBottom: last ? 0 : spacing.lg, gap: 2, paddingTop: 5 }}>
              <AppText variant="bodyStrong">{EVENT_KINDS[e.kind] || e.kind}</AppText>
              {e.text ? <AppText>{e.text}</AppText> : null}
              <AppText variant="caption" color="textMuted">
                {ROLES[e.authorRole] || e.authorRole} {e.authorName}, {formatTime(e.createdAt)}
              </AppText>
            </View>
          </View>
        );
      })}
    </View>
  );
}

export function StateHeading({ report }) {
  return (
    <View style={{ gap: spacing.sm }}>
      <StatusPill state={report.state} />
      <AppText variant="headline" accessibilityRole="header" numberOfLines={3}>
        {report.complaint.split('\n')[0]}
      </AppText>
      <AppText variant="caption" color="textMuted">Dikirim {formatTime(report.createdAt)}</AppText>
    </View>
  );
}
