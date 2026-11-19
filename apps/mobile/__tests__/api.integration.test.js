// API integration test: ApiService.js against a running core with seeded demo accounts. Opt-in, because it needs
// a server: AVELA_IT_URL=http://127.0.0.1:8000 AVELA_IT_PASSWORD=<demo password> npm test -- api.integration
// Add AVELA_IT_INTEGRATION_URL=http://127.0.0.1:8100 to check the partner endpoints of the integration service too.
const BASE = process.env.AVELA_IT_URL;
const INTEGRATION = process.env.AVELA_IT_INTEGRATION_URL;
const PASSWORD = process.env.AVELA_IT_PASSWORD;
const run = BASE && PASSWORD ? describe : describe.skip;

// jest-expo replaces fetch with a stub, so this file talks HTTP through Node's http module instead.
function nodeFetch(url, { method = 'GET', headers = {}, body } = {}) {
  const http = jest.requireActual('http');
  return new Promise((resolve, reject) => {
    const req = http.request(url, { method, headers }, (res) => {
      let text = '';
      res.on('data', (chunk) => { text += chunk; });
      res.on('end', () => resolve({ ok: res.statusCode < 300, status: res.statusCode,
        json: () => Promise.resolve(JSON.parse(text)) }));
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

run('ApiService against a live core', () => {
  let Api;

  beforeAll(() => {
    global.fetch = nodeFetch;
    // EXPO_PUBLIC_* values are inlined at build time, so point the client at the test server through its config.
    jest.resetModules();
    jest.doMock('../src/config', () => ({ API_URL: BASE, INTEGRATION_URL: INTEGRATION || 'http://127.0.0.1:9',
      REQUEST_TIMEOUT_MS: 10000 }));
    Api = require('../src/services/ApiService');
  });

  async function as(username) {
    const { accessToken } = await Api.login(username, PASSWORD);
    Api.setToken(accessToken);
  }

  test('resident report, staff review, and result delivery end to end', async () => {
    await as('warga1');
    const areas = await Api.listAreas();
    expect(areas.items.map((a) => a.id).sort()).toEqual(['palangka-raya', 'pekanbaru']);
    const advisory = await Api.getAdvisory('pekanbaru');
    expect(['fresh', 'stale', 'unavailable']).toContain(advisory.freshness);
    const facilities = await Api.listFacilities('pekanbaru');
    const facilityId = facilities.items[0].id;

    const key = Api.newIdempotencyKey();
    const body = { areaId: 'pekanbaru', facilityId, complaint: 'Keluhan fiktif uji integrasi',
      onsetAt: new Date(Date.now() - 3 * 3600e3).toISOString().replace(/\.\d{3}Z$/, 'Z'), course: 'worse',
      additionalContext: null, consentVersion: 'demo-v1' };
    const report = await Api.createReport(body, key);
    const retry = await Api.createReport(body, key);
    expect(retry.id).toBe(report.id); // T-06 through the app's client
    expect(report.state).toBe('submitted');
    expect(report).toHaveProperty('exposureContextReason');

    await as('petugas1');
    let r = await Api.claimReport(report.id, report.version);
    await expect(Api.claimReport(report.id, report.version)).rejects.toMatchObject({ code: 'VERSION_CONFLICT' });
    r = await Api.requestInformation(report.id, r.version, 'Sejak kapan batuk?');

    await as('warga1');
    r = await Api.addReportUpdate(report.id, r.version, 'Sejak kemarin sore');
    expect(r.state).toBe('in_review');

    await as('petugas1');
    r = await Api.respondToReport(report.id, r.version, 'Datang ke puskesmas', 'onsite_assessment');
    r = await Api.closeReport(report.id, r.version);
    expect(r.state).toBe('closed');
    const draft = await Api.draftResult(report.id, 'Hasil fiktif uji integrasi');
    await Api.publishResult(draft.id);

    await as('warga1');
    const mine = await Api.getResult(draft.id);
    expect(mine.status).toBe('published');

    await as('warga2');
    await expect(Api.getReport(report.id)).rejects.toMatchObject({ status: 404 }); // T-07
    await expect(Api.getResult(draft.id)).rejects.toMatchObject({ status: 404 });

    await as('petugas2');
    await expect(Api.getReport(report.id)).rejects.toMatchObject({ status: 404 }); // T-08
  });

  (INTEGRATION ? test : test.skip)('partner data arrives through the integration service envelope', async () => {
    const products = await Api.getProtectiveProducts();
    expect(products).toMatchObject({ source: 'Veriqu', freshness: 'fresh' });
    expect(products.data.every((p) => ['masker', 'pembersih-udara'].includes(p.category))).toBe(true);
    const waste = await Api.getWasteRecap('pekanbaru');
    expect(waste).toMatchObject({ source: 'FlowGanic', freshness: 'fresh' });
    expect(waste.data.areaId).toBe('pekanbaru');
  });

  test('a partner service that cannot be reached gives an unavailable envelope', async () => {
    jest.resetModules();
    jest.doMock('../src/config', () => ({ API_URL: BASE, INTEGRATION_URL: 'http://127.0.0.1:9', REQUEST_TIMEOUT_MS: 3000 }));
    const Offline = require('../src/services/ApiService');
    await expect(Offline.getWasteRecap('pekanbaru')).resolves.toMatchObject({ freshness: 'unavailable', data: null });
  });
});
