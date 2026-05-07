import dotenv from "dotenv";
import { defineConfig, devices } from "@playwright/test";

dotenv.config({ path: ".env.local" });
dotenv.config();

const baseURL =
  process.env.PLAYWRIGHT_BASE_URL ??
  process.env.NEXTAUTH_URL ??
  process.env.AUTH_URL;

if (!baseURL) {
  throw new Error(
    "Set PLAYWRIGHT_BASE_URL (or NEXTAUTH_URL/AUTH_URL in env) before running live Playwright tests.",
  );
}

export default defineConfig({
  testDir: "./tests/e2e-live",
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 1,
  workers: 1,
  timeout: 60_000,
  expect: {
    timeout: 15_000,
  },
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    acceptDownloads: true,
  },
  projects: [
    {
      name: "chromium-live",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
