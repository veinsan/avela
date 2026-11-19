// Pure mapping and validation helpers. App text is Indonesian; times show in WIB with the zone (DESIGN).

export const REPORT_STATES = {
  submitted: 'Terkirim, belum ditinjau',
  in_review: 'Sedang ditinjau petugas',
  awaiting_information: 'Petugas meminta informasi',
  responded: 'Tanggapan petugas tersedia',
  closed: 'Selesai',
  cancelled: 'Dibatalkan',
};

export const DISPOSITIONS = {
  self_care: 'Pemantauan mandiri',
  remote_follow_up: 'Kontak lanjutan jarak jauh',
  onsite_assessment: 'Pemeriksaan langsung di fasilitas',
};

export const COURSES = { better: 'Membaik', unchanged: 'Tetap', worse: 'Memburuk' };

export const EVENT_KINDS = {
  submitted: 'Laporan dikirim',
  claimed: 'Diklaim petugas',
  information_request: 'Petugas meminta informasi',
  resident_update: 'Informasi tambahan dari warga',
  staff_response: 'Tanggapan petugas',
  closed: 'Laporan ditutup',
  cancelled: 'Laporan dibatalkan',
};

export const ROLES = { resident: 'Warga', staff: 'Petugas' };

export const WEEKDAYS = { mon: 'Senin', tue: 'Selasa', wed: 'Rabu', thu: 'Kamis', fri: 'Jumat', sat: 'Sabtu', sun: 'Minggu' };

export const stateLabel = (state) => REPORT_STATES[state] || state;
export const dispositionLabel = (d) => DISPOSITIONS[d] || d;

export function freshnessLabel(freshness) {
  return { fresh: 'Data terbaru', stale: 'Data tersimpan', unavailable: 'Data belum tersedia' }[freshness] || freshness;
}

export function ageLabel(minutes) {
  if (minutes === null || minutes === undefined) return 'umur data tidak diketahui';
  if (minutes < 1) return 'baru saja';
  if (minutes < 60) return `${minutes} menit lalu`;
  const hours = Math.floor(minutes / 60);
  if (hours < 48) return `${hours} jam lalu`;
  return `${Math.floor(hours / 24)} hari lalu`;
}

const WIB_OFFSET_MS = 7 * 60 * 60 * 1000;
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
const pad = (n) => String(n).padStart(2, '0');

// Transport timestamps are UTC; the pilot areas are in WIB (UTC+7). A missing value is said in words (DESIGN).
export function formatTime(iso, { withDate = true } = {}) {
  if (!iso) return 'waktu tidak diketahui';
  const t = new Date(new Date(iso).getTime() + WIB_OFFSET_MS);
  if (Number.isNaN(t.getTime())) return 'waktu tidak diketahui';
  const time = `${pad(t.getUTCHours())}.${pad(t.getUTCMinutes())} WIB`;
  return withDate ? `${t.getUTCDate()} ${MONTHS[t.getUTCMonth()]} ${t.getUTCFullYear()}, ${time}` : time;
}

export function waitingLabel(iso, now = Date.now()) {
  const minutes = Math.max(0, Math.floor((now - new Date(iso).getTime()) / 60000));
  return `menunggu ${ageLabel(minutes).replace(' lalu', '')}`;
}

export function hoursLabel(hours) {
  if (hours === null || hours === undefined) return 'Tidak diketahui';
  if (hours === 'closed') return 'Tutup';
  return `${hours.replace('-', '–').replace(/:/g, '.')} WIB`;
}

export function pm25(value) {
  return value === null || value === undefined ? 'tidak ada data' : `${Number(value).toFixed(1)} µg/m³`;
}

export const MAX_ONSET_HOURS = 14 * 24;

export function validateReport(form) {
  const errors = {};
  const complaint = (form.complaint || '').trim();
  if (!form.areaId) errors.areaId = 'Pilih wilayah.';
  if (!form.facilityId) errors.facilityId = 'Pilih fasilitas tujuan.';
  if (complaint.length < 3) errors.complaint = 'Tuliskan keluhan, minimal 3 huruf.';
  else if (complaint.length > 2000) errors.complaint = 'Keluhan terlalu panjang, maksimal 2000 huruf.';
  const hours = String(form.onsetHoursAgo ?? '').trim();
  if (!/^\d+$/.test(hours)) errors.onsetHoursAgo = 'Isi dengan angka jam, misalnya 3.';
  else if (Number(hours) > MAX_ONSET_HOURS) errors.onsetHoursAgo = 'Maksimal 336 jam (14 hari) yang lalu.';
  if (!form.course) errors.course = 'Pilih perkembangan keluhan.';
  if ((form.additionalContext || '').length > 2000) errors.additionalContext = 'Maksimal 2000 huruf.';
  if (!form.consent) errors.consent = 'Centang pernyataan ini untuk mengirim.';
  return errors;
}

export function onsetIso(hoursAgo, now = Date.now()) {
  return new Date(now - Number(hoursAgo) * 3600 * 1000).toISOString().replace(/\.\d{3}Z$/, 'Z');
}

export function validateLogin({ username, password }) {
  const errors = {};
  if (!(username || '').trim()) errors.username = 'Isi nama pengguna.';
  if (!password) errors.password = 'Isi kata sandi.';
  return errors;
}

// Update markers (FR-17): anything changed after the resident last opened Laporan.
export function hasUpdate(item, seenAt) {
  const changed = item.publishedAt || item.updatedAt;
  return Boolean(seenAt && changed && changed > seenAt);
}
