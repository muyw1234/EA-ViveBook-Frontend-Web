import type { FullConfig } from '@playwright/test';

export default async function globalTeardown(_config: FullConfig) {
  await fetch('http://127.0.0.1:4179/__e2e-shutdown').catch(() => undefined);
  await new Promise((resolve) => setTimeout(resolve, 250));
}
