import { defineConfig } from "@playwright/test";

// Uses an existing browser only; this workflow never installs a browser.
const baseURL = "http://127.0.0.1:3102";
export default defineConfig({
  testDir: "tests/browser",
  outputDir: ".noah/browser-results",
  reporter: "list",
  workers: 1,
  use: {
    baseURL,
    launchOptions: { executablePath: process.env.NOAH_CHROMIUM_PATH ?? "/usr/bin/chromium" },
  },
  webServer: {
    command: "node node_modules/next/dist/bin/next start -H 127.0.0.1 -p 3102",
    url: baseURL,
    timeout: 30000,
    reuseExistingServer: false,
    env: { NEWS_PROVIDER: "mock", AI_PROVIDER: "mock", DB_MODE: "local", APP_URL: baseURL },
  },
});
