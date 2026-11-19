// The only module that calls the network (AGENTS). Screens get data through these functions.
// Core calls throw ApiError with an Indonesian message. Partner calls never throw: a failure becomes an
// "unavailable" envelope so a peer outage cannot crash a screen (NFR-04).
import { API_URL, INTEGRATION_URL, REQUEST_TIMEOUT_MS } from '../config';

export class ApiError extends Error {
  constructor(status, code, message, retryable) {
    super(message);
    this.status = status;
    this.code = code;
    this.retryable = retryable;
  }
}

const MESSAGES = {
  INVALID_CREDENTIALS: 'Nama pengguna atau kata sandi salah.',
  UNAUTHENTICATED: 'Sesi berakhir. Silakan masuk lagi.',
  FORBIDDEN: 'Akun ini tidak dapat melakukan tindakan tersebut.',
  NOT_REVIEWER: 'Hanya petugas yang mengklaim laporan ini yang dapat melakukannya.',
  NOT_FOUND: 'Data tidak ditemukan.',
  VALIDATION_FAILED: 'Isian belum valid. Periksa kembali.',
  UNKNOWN_AREA: 'Wilayah tidak tersedia.',
  UNKNOWN_FACILITY: 'Fasilitas tidak tersedia untuk wilayah ini.',
  IDEMPOTENCY_CONFLICT: 'Laporan ini sudah terkirim dengan isi berbeda. Muat ulang formulir.',
  VERSION_CONFLICT: 'Laporan ini baru saja diubah. Data dimuat ulang.',
  REPORT_NOT_RESPONDED: 'Hasil hanya dapat dibuat setelah tanggapan terbit.',
  RATE_LIMITED: 'Terlalu banyak permintaan. Tunggu sebentar lalu coba lagi.',
  NETWORK: 'Tidak dapat terhubung. Coba lagi.',
  TIMEOUT: 'Tidak dapat terhubung. Coba lagi.',
};

let token = null;
let onUnauthorized = () => {};

export function setToken(value) {
  token = value;
}

export function setUnauthorizedHandler(handler) {
  onUnauthorized = handler;
}

export function newIdempotencyKey() {
  return `avela-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
}

async function request(base, path, { method = 'GET', body, headers = {} } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  let response;
  try {
    response = await fetch(base + path, {
      method,
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
        ...(body ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (e) {
    const code = e && e.name === 'AbortError' ? 'TIMEOUT' : 'NETWORK';
    throw new ApiError(0, code, MESSAGES[code], true);
  } finally {
    clearTimeout(timer);
  }
  let data = null;
  try {
    data = await response.json();
  } catch {
    data = null; // an empty or non-JSON body is handled by the status below
  }
  if (!response.ok) {
    const error = (data && data.error) || {};
    const code = error.code || `HTTP_${response.status}`;
    if (response.status === 401 && token) onUnauthorized();
    const fallback = response.status >= 500 ? 'Layanan sedang bermasalah. Coba lagi.' : 'Permintaan gagal.';
    throw new ApiError(response.status, code, MESSAGES[code] || fallback, error.retryable ?? response.status >= 500);
  }
  return data;
}

const core = (path, options) => request(API_URL, `/api/v1${path}`, options);
const post = (path, body, headers) => core(path, { method: 'POST', body, headers });

async function partner(path, source) {
  try {
    return await request(INTEGRATION_URL, path);
  } catch {
    return { source, retrievedAt: null, freshness: 'unavailable', isMock: false, data: null };
  }
}

// Identity
export const login = (username, password) => post('/auth/login', { username, password });
export const getMe = () => core('/me');

// Environment, guidance, facilities (open)
export const listAreas = () => core('/areas');
export const getAdvisory = (areaId) => core(`/areas/${encodeURIComponent(areaId)}/advisory`);
export const getGuidance = () => core('/guidance');
export const listFacilities = (areaId) =>
  core(areaId ? `/facilities?areaId=${encodeURIComponent(areaId)}` : '/facilities');
export const getFacility = (id) => core(`/facilities/${encodeURIComponent(id)}`);

// Resident reports and results
export const listReports = () => core('/reports?limit=50');
export const getReport = (id) => core(`/reports/${encodeURIComponent(id)}`);
export const createReport = (body, idempotencyKey) => post('/reports', body, { 'Idempotency-Key': idempotencyKey });
export const addReportUpdate = (id, expectedVersion, text) =>
  post(`/reports/${encodeURIComponent(id)}/updates`, { expectedVersion, text });
export const cancelReport = (id, expectedVersion) =>
  post(`/reports/${encodeURIComponent(id)}/cancel`, { expectedVersion });
export const listResults = () => core('/results');
export const getResult = (id) => core(`/results/${encodeURIComponent(id)}`);

// Staff
export const staffQueue = (state) =>
  core(`/staff/reports?limit=50${state ? `&state=${encodeURIComponent(state)}` : ''}`);
const staffAction = (id, action, body) => post(`/staff/reports/${encodeURIComponent(id)}/${action}`, body);
export const claimReport = (id, expectedVersion) => staffAction(id, 'claim', { expectedVersion });
export const requestInformation = (id, expectedVersion, text) =>
  staffAction(id, 'information-requests', { expectedVersion, text });
export const respondToReport = (id, expectedVersion, text, disposition) =>
  staffAction(id, 'responses', { expectedVersion, text, disposition });
export const closeReport = (id, expectedVersion) => staffAction(id, 'close', { expectedVersion });
export const listReportResults = (reportId) => core(`/staff/results?reportId=${encodeURIComponent(reportId)}`);
export const draftResult = (reportId, content) => post('/staff/results', { reportId, content });
export const draftCorrection = (resultId, content) =>
  post(`/staff/results/${encodeURIComponent(resultId)}/corrections`, { content });
export const publishResult = (resultId) => post(`/staff/results/${encodeURIComponent(resultId)}/publish`);

// Partners, through the integration service (never throws)
export const getProtectiveProducts = () => partner('/guidance/products', 'Veriqu');
export const getWasteRecap = (areaId) => partner(`/areas/${encodeURIComponent(areaId)}/waste`, 'FlowGanic');
