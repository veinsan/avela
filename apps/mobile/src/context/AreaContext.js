// The resident picks a pilot area from a list; the app never asks for location (D-25).
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import * as SecureStore from 'expo-secure-store';

const AREA_KEY = 'avela.area';
const AreaContext = createContext(null);

export function AreaProvider({ children }) {
  const [area, setAreaState] = useState(null); // { id, name } or null until chosen
  const [ready, setReady] = useState(false);

  useEffect(() => {
    SecureStore.getItemAsync(AREA_KEY)
      .then((saved) => saved && setAreaState(JSON.parse(saved)))
      .catch(() => {})
      .finally(() => setReady(true));
  }, []);

  const setArea = useCallback((next) => {
    setAreaState(next);
    SecureStore.setItemAsync(AREA_KEY, JSON.stringify(next)).catch(() => {});
  }, []);

  const value = useMemo(() => ({ area, setArea, ready }), [area, setArea, ready]);
  return <AreaContext.Provider value={value}>{children}</AreaContext.Provider>;
}

export function useArea() {
  return useContext(AreaContext);
}
