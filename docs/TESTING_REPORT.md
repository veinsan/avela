# Avela Testing Report

**Updated:** 19 November 2026. Source of the testing report PDF (C-10). Scenarios and IDs come from [TEST_PLAN.md](TEST_PLAN.md). A row is passed only when its test ran and passed; rows that need a phone stay open until A-14.

## Environment

| Item | Value |
| --- | --- |
| Machine | Windows 11 laptop, Git Bash |
| Core and integration service | Python 3.13.17 (local), FastAPI 0.162.4, pytest 9.2.0 |
| Mobile | Node.js 26.13.0, Expo SDK 58, React Native 0.88.1, Jest 30.5.2 with `jest-expo` 58.0.15, Testing Library 14.1.0 |
| Data | Fictional accounts from `app.seed`; temporary SQLite databases |

## Automated Tests

| Suite | Command | Result on 19 Nov |
| --- | --- | --- |
| Core API | `services/core`: `.venv/Scripts/python.exe -m pytest -q` | 26 passed |
| Integration service | `services/integration`: `.venv/Scripts/python.exe -m pytest -q` | 15 passed |
| Mobile unit and component | `apps/mobile`: `npm test` | 25 passed, 1 suite skipped (the opt-in integration suite) |
| Mobile API integration | `apps/mobile`: `AVELA_IT_URL=... AVELA_IT_PASSWORD=... AVELA_IT_INTEGRATION_URL=... npm test -- api.integration` against a local core and integration service | 3 passed; 24 requests reached the core |
| Android bundle | `apps/mobile`: `npx expo export --platform android` | Bundle built |

### Mobile Unit Tests (Jest)

| File | What it checks |
| --- | --- |
| `ApiService.test.js` | Bearer token sent; a 401 on a signed-in call signs out; a wrong password does not; timeout becomes a retryable `TIMEOUT`; a 5xx without JSON is retryable; `VERSION_CONFLICT` keeps its code; the idempotency key is sent; a partner outage becomes an unavailable envelope |
| `format.test.js` | Report state, disposition, freshness, and age labels; WIB times; missing values shown as a dash, never zero; report and login validation; onset conversion; update markers |
| `navigation.test.js` | Residents get Beranda, Laporan, Fasilitas, Akun; staff get Antrean, Akun |
| `screens.test.js` | Partner outage collapses to one line; partner source, mock, and stale labels; the emergency screen renders without data; forecast shows only future hours; today's hours in WIB keep unknown apart from closed |
| `reportForm.test.js` | Empty form shows field errors and sends nothing; a retry after a network failure resends the same payload and idempotency key, keeps the typed values, and opens the new report |
| `staff.test.js` | Staff actions per state and per reviewer; draft, preview, and correction plan for results |

### API Integration Tests

`__tests__/api.integration.test.js` drives `ApiService.js` against running services, not mocks:

1. Lists areas, reads the advisory and facilities, submits a report, and resubmits with the same key: one report (T-06).
2. Staff claim; a second claim with the stale version gets `VERSION_CONFLICT` (T-09); staff ask, the resident replies, staff respond with onsite assessment and close.
3. Staff draft and publish a result; the owner reads it; `warga2` and `petugas2` get 404 for the report and the result (T-07, T-08).
4. Veriqu products and the FlowGanic recap arrive through the integration service envelope; the service logged `partner=Veriqu ... result=ok` and `partner=FlowGanic ... result=ok` (fixtures, `isMock: true`, until A-03).
5. An unreachable integration service gives an unavailable envelope instead of an error (T-15).

## Functional Test Table

Run each row on the installed release APK against the deployed services (A-14). "Automated" rows already pass in the suites above; the device run confirms the screen.

| No | Feature | Steps | Test data | Expected | Actual | Result |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Login | Akun, Masuk, enter account, submit | `warga1` | Resident tabs Beranda, Laporan, Fasilitas, Akun | Automated: tab sets by role pass | Device: pending |
| 2 | Login failure | Masuk with a wrong password | `warga1`, wrong password | "Nama pengguna atau kata sandi salah."; typed username kept | Automated: message mapping passes | Device: pending |
| 3 | Area choice | Beranda, Pilih wilayah, Palangka Raya | - | Advisory for Palangka Raya; no location permission prompt | - | Device: pending |
| 4 | Advisory states | Open Beranda with no snapshot, a fresh one, and one older than 2 hours | Integration service stopped and started | "Data kualitas udara belum tersedia."; value with source and age; "Data tersimpan" | API states pass (T-02, T-03, T-31) | Device: pending |
| 5 | Report form validation | Laporan, Buat laporan, submit empty | - | Errors under each field; nothing sent | Automated: `reportForm.test.js` | Device: pending |
| 6 | Report submit and retry | Fill the form, turn data off, send, turn data on, Kirim ulang | `warga1` | One report, "Terkirim, belum ditinjau" | Automated: same key and payload on retry; API idempotency passes | Device: pending |
| 7 | Exposure context | Open the new report | Snapshot pushed for the area | Mean and peak PM2.5, "Prakiraan wilayah, bukan dosis pribadi" | API passes (T-26, T-27) | Device: pending |
| 8 | Staff queue and claim | Sign in as staff, Antrean, open the report, Klaim laporan | `petugas1` | State "Sedang ditinjau petugas", "Diklaim oleh Petugas Simulasi A" | Automated: API flow passes | Device: pending |
| 9 | Information request and reply | Staff ask; resident replies in Detail Laporan | `petugas1`, `warga1` | Question shown to the resident; reply returns the report to review | Automated: API flow passes | Device: pending |
| 10 | Response and update marker | Staff respond with onsite assessment; resident opens the app | `petugas1`, `warga1` | Laporan tab badge; response with reviewer, time, disposition; Cari fasilitas | Marker rule passes | Device: pending |
| 11 | Facility directory | Fasilitas, open Klinik Simulasi Avela B | - | Simulation label; Sabtu "Tidak diketahui", not "Tutup" | Automated: unknown versus closed passes | Device: pending |
| 12 | Result and correction | Staff publish, then correct; resident opens Hasil Pemeriksaan | `petugas1`, `warga1` | Version 2 shown, version 1 in history | API passes (T-34) | Device: pending |
| 13 | Cross-account access | Sign in as `warga2`, open `warga1`'s report link | `warga2` | Not found | Automated: 404 passes (T-07) | Device: pending |
| 14 | Peer API outage | Stop the integration service, open Panduan and Beranda | - | "Data mitra sedang tidak tersedia."; guidance and advisory still show | Automated: unavailable envelope passes (T-15) | Device: pending |
| 15 | Veriqu products | Panduan | - | Products below the guidance with rating and "Sumber: Veriqu · Data contoh (mock)" until the contract | Integration test passes | Device: pending |
| 16 | FlowGanic recap | Beranda | - | Waste per type with "Sumber: FlowGanic" | Integration test passes | Device: pending |
| 17 | Emergency | Signed out, tap Darurat in any header | - | 119 and 112 with call buttons; works offline | Automated: renders without data | Device: pending |
| 18 | Session expiry | Wait 12 hours or revoke the token, open Laporan | `warga1` | Back to the signed-out app | Automated: 401 signs out | Device: pending |
| 19 | Dark theme and large text | System dark mode and 200% font | - | Readable, no clipped text, status in words | - | Device: pending |

## Bugs Found While Testing

| Found | Symptom | Cause | Fix |
| --- | --- | --- | --- |
| Integration test | Requests from the test never reached the local core | `babel-preset-expo` inlines `process.env.EXPO_PUBLIC_*` at build time, so changing it in a test does nothing | The test replaces the config module with `jest.doMock` |
| Integration test | `fetch` returned an empty response | `jest-expo` replaces `fetch` with a stub | The integration test uses a small `fetch` built on Node's `http` |
| Component tests | "render function has not been called" | Testing Library 14 made `render` asynchronous | Tests `await render(...)` |
| Integration service setup | `ImportError: An Application Control policy has blocked this file` | Windows Smart App Control blocked a DLL in a new virtual environment | Run with the core's environment; noted in `README.txt` |
| Code review | Area rows wrapped in a text element | A `View` inside `Text` breaks layout on Android | Rows wrapped in `View` |

## Not Yet Run

Device checks (rows 1 to 19, T-18, T-24), the release APK (A-14), the deployed core and integration service over HTTPS (A-13, D-34), and live Veriqu and FlowGanic calls (A-03).
