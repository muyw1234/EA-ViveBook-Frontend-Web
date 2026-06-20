const LOCAL_BACKEND_URL = 'http://localhost:1337';

const normalizeUrl = (value: string | undefined, fallback: string): string =>
  (value?.trim() || fallback).replace(/\/+$/, '');

export const environment = {
  apiUrl: normalizeUrl(import.meta.env.VITE_API_URL, LOCAL_BACKEND_URL),
  socketUrl: normalizeUrl(
    import.meta.env.VITE_SOCKET_URL,
    import.meta.env.VITE_API_URL || LOCAL_BACKEND_URL,
  ),
  googleClientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
  cloudinary_api: import.meta.env.CLOUDINARY_API_KEY || '123218699491553',
} as const;
