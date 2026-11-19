// Failures the user cannot act on (device storage, update markers) are logged with what was being done.
// Screens report the failures a user can act on; this is for the ones that degrade quietly.
export function logFailure(context, error) {
  if (__DEV__) console.warn(`[avela] ${context} failed:`, error && error.message ? error.message : error);
  return null;
}
