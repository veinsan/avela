import {
  ageLabel, dispositionLabel, formatTime, freshnessLabel, hasUpdate, hoursLabel, onsetIso, pm25, stateLabel,
  validateLogin, validateReport,
} from '../src/utils/format';

const valid = {
  areaId: 'pekanbaru', facilityId: 'demo-facility-001', complaint: 'Batuk dan mata perih', onsetHoursAgo: '3',
  course: 'worse', additionalContext: '', consent: true,
};

test('a submitted report never reads as reviewed', () => {
  expect(stateLabel('submitted')).toBe('Terkirim, belum ditinjau');
  expect(stateLabel('responded')).toBe('Tanggapan petugas tersedia');
  expect(dispositionLabel('onsite_assessment')).toBe('Pemeriksaan langsung di fasilitas');
});

test('freshness and age labels', () => {
  expect(freshnessLabel('stale')).toBe('Data tersimpan');
  expect(ageLabel(0)).toBe('baru saja');
  expect(ageLabel(45)).toBe('45 menit lalu');
  expect(ageLabel(150)).toBe('2 jam lalu');
  expect(ageLabel(60 * 72)).toBe('3 hari lalu');
  expect(ageLabel(null)).toBe('umur data tidak diketahui');
});

test('times show in WIB and missing values are said in words, never as zero', () => {
  expect(formatTime('2026-11-19T17:30:00Z')).toBe('20 Nov 2026, 00.30 WIB');
  expect(formatTime(null)).toBe('waktu tidak diketahui');
  expect(pm25(null)).toBe('tidak ada data');
  expect(pm25(41.25)).toBe('41.3 µg/m³');
  expect(hoursLabel(null)).toBe('Tidak diketahui');
  expect(hoursLabel('closed')).toBe('Tutup');
  expect(hoursLabel('07:30-14:00')).toBe('07.30–14.00 WIB');
});

test('report form validation', () => {
  expect(validateReport(valid)).toEqual({});
  const errors = validateReport({ ...valid, complaint: ' ', onsetHoursAgo: 'kemarin', facilityId: '', consent: false });
  expect(Object.keys(errors).sort()).toEqual(['complaint', 'consent', 'facilityId', 'onsetHoursAgo']);
  expect(validateReport({ ...valid, onsetHoursAgo: '400' }).onsetHoursAgo).toMatch(/336/);
  expect(validateReport({ ...valid, areaId: null, course: null })).toHaveProperty('course');
});

test('onset hours become a UTC timestamp without milliseconds', () => {
  expect(onsetIso(3, Date.parse('2026-11-20T05:00:00Z'))).toBe('2026-11-20T02:00:00Z');
});

test('login validation', () => {
  expect(validateLogin({ username: '', password: '' })).toEqual({ username: 'Isi nama pengguna.', password: 'Isi kata sandi.' });
  expect(validateLogin({ username: 'warga1', password: 'x' })).toEqual({});
});

test('update markers compare against the last time Laporan was opened', () => {
  expect(hasUpdate({ updatedAt: '2026-11-20T03:00:00Z' }, '2026-11-20T02:00:00Z')).toBe(true);
  expect(hasUpdate({ updatedAt: '2026-11-20T01:00:00Z' }, '2026-11-20T02:00:00Z')).toBe(false);
  expect(hasUpdate({ publishedAt: '2026-11-20T03:00:00Z' }, null)).toBe(false);
});
