import '@testing-library/jest-dom/vitest';
import '../i18n';
import { cleanup } from '@testing-library/react';
import { afterAll, afterEach, beforeAll } from 'vitest';
import { server } from './mocks/server';

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' });
});

afterEach(() => {
  server.resetHandlers();
  cleanup();
  localStorage.clear();
  sessionStorage.clear();
});

afterAll(() => {
  server.close();
});
