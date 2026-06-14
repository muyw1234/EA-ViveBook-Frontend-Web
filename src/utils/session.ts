import { jwtDecode } from 'jwt-decode';

const TOKEN_KEY = 'token';
const SESSION_REASON_KEY = 'session-reason';

export const SESSION_CHANGED_EVENT = 'vivebook:session-changed';

export type SessionReason = 'expired' | 'rejected';

type JwtPayload = {
  exp?: number;
};

const notifySessionChanged = () => {
  window.dispatchEvent(new Event(SESSION_CHANGED_EVENT));
};

const storeSessionReason = (reason?: SessionReason) => {
  if (reason) {
    sessionStorage.setItem(SESSION_REASON_KEY, reason);
  } else {
    sessionStorage.removeItem(SESSION_REASON_KEY);
  }
};

export const clearSession = (reason?: SessionReason) => {
  localStorage.removeItem(TOKEN_KEY);
  storeSessionReason(reason);
  notifySessionChanged();
};

export const setSessionToken = (token: string) => {
  localStorage.setItem(TOKEN_KEY, token);
  storeSessionReason();
  notifySessionChanged();
};

export const getSessionToken = (): string | null => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) {
    return null;
  }

  try {
    const payload = jwtDecode<JwtPayload>(token);
    if (payload.exp !== undefined && payload.exp * 1000 <= Date.now()) {
      clearSession('expired');
      return null;
    }

    return token;
  } catch {
    clearSession('rejected');
    return null;
  }
};

export const consumeSessionReason = (): SessionReason | null => {
  const reason = sessionStorage.getItem(SESSION_REASON_KEY) as SessionReason | null;
  sessionStorage.removeItem(SESSION_REASON_KEY);
  return reason;
};

export const redirectToLogin = () => {
  if (window.location.pathname !== '/login') {
    window.location.assign('/login');
  }
};
