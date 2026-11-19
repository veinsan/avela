import * as Api from '../src/services/ApiService';

function reply(status, body) {
  return Promise.resolve({ ok: status >= 200 && status < 300, status, json: () => Promise.resolve(body) });
}

beforeEach(() => {
  global.fetch = jest.fn();
  Api.setToken(null);
  Api.setUnauthorizedHandler(() => {});
});

test('a successful call sends the bearer token and returns the body', async () => {
  Api.setToken('tok-1');
  fetch.mockReturnValue(reply(200, { items: [] }));
  await expect(Api.listReports()).resolves.toEqual({ items: [] });
  const [url, init] = fetch.mock.calls[0];
  expect(url).toBe('https://avela.stei.fun/api/v1/reports?limit=50');
  expect(init.headers.Authorization).toBe('Bearer tok-1');
});

test('a 401 on a signed-in call signs the user out', async () => {
  const signOut = jest.fn();
  Api.setUnauthorizedHandler(signOut);
  Api.setToken('expired');
  fetch.mockReturnValue(reply(401, { error: { code: 'UNAUTHENTICATED', retryable: false } }));
  await expect(Api.getMe()).rejects.toMatchObject({ status: 401, code: 'UNAUTHENTICATED' });
  expect(signOut).toHaveBeenCalledTimes(1);
});

test('a wrong password does not trigger sign-out and gives an Indonesian message', async () => {
  const signOut = jest.fn();
  Api.setUnauthorizedHandler(signOut);
  fetch.mockReturnValue(reply(401, { error: { code: 'INVALID_CREDENTIALS' } }));
  await expect(Api.login('warga1', 'salah')).rejects.toMatchObject({
    message: 'Nama pengguna atau kata sandi salah.',
  });
  expect(signOut).not.toHaveBeenCalled();
});

test('a timeout becomes a retryable TIMEOUT error', async () => {
  fetch.mockReturnValue(Promise.reject(Object.assign(new Error('aborted'), { name: 'AbortError' })));
  await expect(Api.getGuidance()).rejects.toMatchObject({ code: 'TIMEOUT', retryable: true });
});

test('a 5xx without a JSON body is retryable', async () => {
  fetch.mockReturnValue(Promise.resolve({ ok: false, status: 502, json: () => Promise.reject(new Error('html')) }));
  await expect(Api.listAreas()).rejects.toMatchObject({ status: 502, retryable: true });
});

test('a version conflict keeps its code for the screen to reload', async () => {
  fetch.mockReturnValue(reply(409, { error: { code: 'VERSION_CONFLICT', retryable: false } }));
  await expect(Api.claimReport('r1', 1)).rejects.toMatchObject({
    code: 'VERSION_CONFLICT',
    message: 'Laporan ini baru saja diubah. Data dimuat ulang.',
  });
});

test('createReport sends the idempotency key it is given', async () => {
  fetch.mockReturnValue(reply(201, { id: 'r1' }));
  await Api.createReport({ complaint: 'x' }, 'avela-key-1');
  expect(fetch.mock.calls[0][1].headers['Idempotency-Key']).toBe('avela-key-1');
  expect(Api.newIdempotencyKey()).not.toBe(Api.newIdempotencyKey());
});

test('a partner outage becomes an unavailable envelope instead of an error', async () => {
  fetch.mockReturnValue(Promise.reject(new TypeError('Network request failed')));
  await expect(Api.getProtectiveProducts()).resolves.toEqual({
    source: 'Veriqu', retrievedAt: null, freshness: 'unavailable', isMock: false, data: null,
  });
  fetch.mockReturnValue(reply(200, { source: 'FlowGanic', freshness: 'stale', data: { items: [] } }));
  await expect(Api.getWasteRecap('pekanbaru')).resolves.toMatchObject({ freshness: 'stale' });
  expect(fetch.mock.calls[1][0]).toBe('https://avela-int.stei.fun/areas/pekanbaru/waste');
});
