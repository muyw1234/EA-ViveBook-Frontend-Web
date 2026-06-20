import { useEffect, useState } from 'react';
import { getSessionToken, SESSION_CHANGED_EVENT } from '../utils/session';

const SESSION_CHECK_INTERVAL_MS = 15_000;

export const useSessionToken = () => {
  const [token, setToken] = useState<string | null>(() => getSessionToken());

  useEffect(() => {
    const refreshSession = () => setToken(getSessionToken());

    window.addEventListener(SESSION_CHANGED_EVENT, refreshSession);
    window.addEventListener('storage', refreshSession);
    const intervalId = window.setInterval(refreshSession, SESSION_CHECK_INTERVAL_MS);

    return () => {
      window.removeEventListener(SESSION_CHANGED_EVENT, refreshSession);
      window.removeEventListener('storage', refreshSession);
      window.clearInterval(intervalId);
    };
  }, []);

  return token;
};
