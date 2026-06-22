import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright e2e config. Boots the production server (`npm run start`, which
 * requires a prior `npm run build`) and drives it with headless Chromium.
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? [["github"], ["list"]] : "list",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  webServer: {
    command: "npm run start",
    url: "http://localhost:3000",
    timeout: 120_000,
    reuseExistingServer: !process.env.CI,
    // Force the free integrations offline so the empty-shell e2e is deterministic
    // (no live OpenSanctions / Google-News calls).
    env: {
      SANCTIONS_LIVE: "false",
      ADVERSE_MEDIA_LIVE: "false",
    },
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
