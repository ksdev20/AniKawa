import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",

  timeout: 30 * 1000,

  expect: {
    timeout: 5000,
  },

  fullyParallel: true,

  forbidOnly: !!process.env.CI,

  retries: process.env.CI ? 2 : 0,

  workers: process.env.CI ? 1 : undefined,

  reporter: [["html"], ["github"]],

  use: {
    // Local:
    // http://localhost:4321
    //
    // CI:
    // BASE_URL=https://vercel-preview-url

    baseURL: process.env.BASE_URL || "http://localhost:4321",

    trace: "on-first-retry",

    screenshot: "only-on-failure",

    video: "retain-on-failure",
  },

  projects: [
    {
      name: "chromium",

      use: {
        ...devices["Desktop Chrome"],
      },
    },

    {
      name: "mobile",

      use: {
        ...devices["Pixel 7"],
      },
    },
  ],

  /*
    Uncomment this if you want Playwright
    to automatically start Astro locally.

    For now we will not use it because
    Vercel preview testing is the goal.

  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:4321',
    reuseExistingServer: !process.env.CI,
  },

  */
});
