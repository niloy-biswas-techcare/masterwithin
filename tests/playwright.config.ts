import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E config (§20, §21.2).
 *
 * - `webServer` spins up a production build of the web app before running tests.
 *   In CI, pass `CI=true` to skip the server spin-up (handled by the workflow).
 * - All critical journeys listed in §20 are covered in `e2e/` and `e2e/admin/`.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: process.env.BASE_URL ?? 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 14'] },
    },
  ],
  webServer: process.env.CI
    ? undefined
    : {
        command: 'pnpm --filter web start',
        url: 'http://localhost:3000',
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      },
});
