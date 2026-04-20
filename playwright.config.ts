import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright config — smoke e2e only (navigation + form rendering).
 *
 * Heavier browser matrices (mobile viewports, cross-browser) are kept out
 * of the default run to keep CI fast. Local devs can opt in with `--project`.
 */
export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 30_000,
  expect: { timeout: 5_000 },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : [["list"]],
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    // Build once, start the prod server. Avoids dev-server flakiness from
    // Turbopack recompiling in the middle of a test.
    command: "pnpm build && pnpm start -p 3000",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
    stdout: "pipe",
    stderr: "pipe",
  },
});
