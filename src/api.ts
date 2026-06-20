import axios from 'axios';
import { clearSession, getSessionToken, redirectToLogin } from './utils/session';
import { environment } from './config/environment';

const api = axios.create({
  baseURL: environment.apiUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const hadStoredToken = Boolean(localStorage.getItem('token'));
    const token = getSessionToken();

    if (hadStoredToken && !token) {
      redirectToLogin();
      return Promise.reject(new axios.CanceledError('La sesión ha expirado'));
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    const status = error.response?.status;
    const requestHadToken = Boolean(error.config?.headers?.Authorization);

    if ((status === 401 || status === 403) && requestHadToken) {
      clearSession(status === 401 ? 'expired' : 'rejected');
      redirectToLogin();
    }

    return Promise.reject(error);
  },
);
// como una matrioska
api.interceptors.response.use(
  (response) => {
    if (
      response.data &&
      typeof response.data === 'object' &&
      'success' in response.data &&
      'data' in response.data
    ) {
      response.data = response.data.data;
    }
    return response;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export default api;
