import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import * as SecureStore from 'expo-secure-store';

import { getMe, login, setToken, setUnauthorizedHandler } from '../services/ApiService';

const TOKEN_KEY = 'avela.session';
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [status, setStatus] = useState('loading'); // loading | signedOut | signedIn
  const [account, setAccount] = useState(null);

  const signOut = useCallback(async () => {
    setToken(null);
    setAccount(null);
    setStatus('signedOut');
    await SecureStore.deleteItemAsync(TOKEN_KEY).catch(() => {});
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      signOut();
    });
    (async () => {
      const saved = await SecureStore.getItemAsync(TOKEN_KEY).catch(() => null);
      if (!saved) return setStatus('signedOut');
      setToken(saved);
      try {
        setAccount(await getMe());
        setStatus('signedIn');
      } catch {
        // An expired session or no connection at start: show the signed-out app, which still works.
        setToken(null);
        setStatus('signedOut');
      }
    })();
  }, [signOut]);

  const signIn = useCallback(async (username, password) => {
    const { accessToken } = await login(username, password);
    setToken(accessToken);
    const me = await getMe();
    await SecureStore.setItemAsync(TOKEN_KEY, accessToken);
    setAccount(me);
    setStatus('signedIn');
    return me;
  }, []);

  const value = useMemo(() => ({ status, account, signIn, signOut }), [status, account, signIn, signOut]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
