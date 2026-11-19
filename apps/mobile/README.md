# Avela Mobile App

React Native (Expo SDK 58) app for Avela, in JavaScript (D-28). One APK serves residents and simulated facility staff; the signed-in role decides the tabs. App text is Indonesian. All accounts, staff, facilities, and cases are fictional, and the app says so.

## Run

Prerequisites: Node.js 20 or newer, and Expo Go or an Android development build on a phone.

```bash
cd apps/mobile
npm install
npx expo start
```

Scan the QR code with Expo Go. By default the app calls the deployed services over HTTPS:

| Service | Default | Override |
| --- | --- | --- |
| Core API | `https://avela.stei.fun` | `EXPO_PUBLIC_API_URL` |
| Integration service | `https://avela-int.stei.fun` | `EXPO_PUBLIC_INTEGRATION_URL` |

To use services running on the laptop, start them with `--host 0.0.0.0` and run, for example, `EXPO_PUBLIC_API_URL=http://192.168.1.10:8000 npx expo start`.

## Demo Accounts

| Username | Role | Facility |
| --- | --- | --- |
| `warga1`, `warga2` | Resident | - |
| `petugas1` | Staff | Puskesmas Simulasi Avela A, Pekanbaru |
| `petugas2` | Staff | Klinik Simulasi Avela B, Palangka Raya |

The password is the `AVELA_DEMO_PASSWORD` set on the core; it is given with the submission, not stored here.

## Test

```bash
npm test
```

Jest with `jest-expo`. Tests live in `__tests__/`.

## Structure

```text
App.js                     Providers and the navigator
src/config.js              Service URLs (HTTPS by default)
src/services/ApiService.js The only module that calls the network
src/context/               Session (AuthContext) and chosen pilot area (AreaContext)
src/navigation/            Stack and tab navigation; tabs by role
src/screens/               One file per screen
src/components/ui.js       Shared components built on the theme
src/theme/index.js         Tokens mirrored from docs/DESIGN.md
src/utils/format.js        Labels, WIB times, form validation
```

No API key ships in the app. Partner data comes through the integration service, which holds the keys.
