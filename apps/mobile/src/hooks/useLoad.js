import { useCallback, useEffect, useRef, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';

// Loading, error, and refresh state for one screen's data. A refresh keeps the last data on screen (DESIGN).
export function useLoad(load, deps, { refreshOnFocus = false } = {}) {
  const [state, setState] = useState({ data: null, error: null, loading: true, refreshing: false });
  const first = useRef(true);

  const run = useCallback(async (refresh = false) => {
    setState((s) => ({ ...s, error: null, loading: !refresh && s.data === null, refreshing: refresh }));
    try {
      const data = await load();
      setState({ data, error: null, loading: false, refreshing: false });
    } catch (error) {
      setState((s) => ({ ...s, error, loading: false, refreshing: false }));
    }
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    run();
  }, [run]);

  useFocusEffect(
    useCallback(() => {
      if (first.current) first.current = false;
      else if (refreshOnFocus) run(true);
    }, [run, refreshOnFocus]),
  );

  return { ...state, reload: () => run(false), refresh: () => run(true) };
}
