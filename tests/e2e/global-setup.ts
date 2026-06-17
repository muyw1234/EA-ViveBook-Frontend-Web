import { spawn } from 'node:child_process';
import type { FullConfig } from '@playwright/test';

const serverUrl = 'http://127.0.0.1:4179';

const waitForServer = async () => {
  const timeoutAt = Date.now() + 120_000;

  while (Date.now() < timeoutAt) {
    try {
      const response = await fetch(serverUrl);
      if (response.ok) {
        return;
      }
    } catch {
      // Keep polling until Vite is ready.
    }

    await new Promise((resolve) => setTimeout(resolve, 250));
  }

  throw new Error(`E2E dev server did not start at ${serverUrl}`);
};

export default async function globalSetup(_config: FullConfig) {
  spawn(process.execPath, ['./tests/e2e/vite-server.mjs'], {
    cwd: process.cwd(),
    detached: true,
    stdio: 'ignore',
  }).unref();

  await waitForServer();
}
