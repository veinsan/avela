// Notifications context (DDD paper): in-app update markers derived from report and result changes (FR-17).
// No push service: the app compares each item's last change with the last time Laporan was opened.
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import * as SecureStore from 'expo-secure-store';

import { useAuth } from './AuthContext';
import { listReports, listResults } from '../services/ApiService';
import { hasUpdate } from '../utils/format';

const SEEN_KEY = 'avela.seenAt';
const UpdatesContext = createContext(null);

export const nowIso = () => new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');

export function UpdatesProvider({ children }) {
  const { account } = useAuth();
  const isResident = account && account.role === 'resident';
  const [seenAt, setSeenAt] = useState(null);
  const [reports, setReports] = useState([]);
  const [results, setResults] = useState([]);

  useEffect(() => {
    SecureStore.getItemAsync(SEEN_KEY)
      .then((saved) => setSeenAt(saved || nowIso())) // first run: nothing is marked yet
      .catch(() => setSeenAt(nowIso()));
  }, []);

  const refresh = useCallback(async () => {
    if (!isResident) return;
    try {
      const [r, s] = await Promise.all([listReports(), listResults()]);
      setReports(r.items);
      setResults(s.items);
    } catch {
      // Markers are a convenience; the screens show their own errors.
    }
  }, [isResident]);

  useEffect(() => {
    if (isResident) refresh();
    else {
      setReports([]);
      setResults([]);
    }
  }, [isResident, refresh]);

  const markSeen = useCallback(() => {
    const at = nowIso();
    setSeenAt(at);
    SecureStore.setItemAsync(SEEN_KEY, at).catch(() => {});
  }, []);

  const count = [...reports, ...results].filter((item) => hasUpdate(item, seenAt)).length;
  const value = useMemo(
    () => ({ seenAt, reports, results, count, refresh, markSeen }),
    [seenAt, reports, results, count, refresh, markSeen],
  );
  return <UpdatesContext.Provider value={value}>{children}</UpdatesContext.Provider>;
}

export function useUpdates() {
  return useContext(UpdatesContext);
}
