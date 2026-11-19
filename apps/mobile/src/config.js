// HTTPS URLs for the release build (C-11). For a local run, set EXPO_PUBLIC_API_URL and
// EXPO_PUBLIC_INTEGRATION_URL, for example to http://<laptop-ip>:8000 and http://<laptop-ip>:8100.
// No API key ever ships in the app: peer and service keys live in the integration service.
export const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://avela.stei.fun';
export const INTEGRATION_URL = process.env.EXPO_PUBLIC_INTEGRATION_URL || 'https://avela-int.stei.fun';
export const REQUEST_TIMEOUT_MS = 10000;
export const CONSENT_VERSION = 'demo-v1';
