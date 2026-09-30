import { defineConfig, devices } from "@playwright/test";

/**
 * Browser smoke tests.
 *
 * These drive a real browser through the primary journey so that client-side
 * behaviour is covered, not just the HTTP surface. The live verifier
 * (scripts/verify-live.mjs) already proves the API; these prove the UI.
 *
 * Uses the system Edge channel so no Chromium download is required. Set
 * FM_BROWSER=chromium to use Playwright's own build instead.
 */
const channel = process.env.FM_BROWSER === "chromium" ? undefined : "msedge";
const baseURL = process.env.FM_BASE_URL ?? "https://folio-motion.vercel.app";

export default defineConfig({
  testDir: "./e2e",
  timeout: 90_000,
  expect: { timeout: 20_000 },
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [["list"]],
  use: {
    baseURL,
    channel,
    trace: "off",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "desktop",
      use: { ...devices["Desktop Chrome"], channel },
    },
    {
      name: "mobile",
      use: { ...devices["Pixel 7"], channel, isMobile: true },
    },
  ],
});
