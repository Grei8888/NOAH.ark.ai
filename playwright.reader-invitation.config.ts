import { defineConfig } from "@playwright/test";
import { createHash } from "node:crypto";
import { READER_TEST_INVITE } from "./tests/reader-browser/fixtures";

// Match Next's local request origin; the exact-origin security check stays intact.
const baseURL = "http://localhost:3113";
export default defineConfig({
  testDir: "tests/reader-browser",
  outputDir: ".noah/reader-invitation-results",
  reporter: "list",
  workers: 1,
  use: { baseURL, launchOptions: { executablePath: process.env.NOAH_CHROMIUM_PATH ?? "/usr/bin/chromium" } },
  webServer: {
    command: "node --import ./tests/fixtures/reader-auth-network.mjs node_modules/next/dist/bin/next start -H localhost -p 3113",
    url: baseURL, timeout: 30000, reuseExistingServer: false,
    env: {
      VERCEL_ENV: "preview", NOAH_REAL_SOURCE_PREVIEW: "true", NEWS_PROVIDER: "government", AI_PROVIDER: "off",
      NOAH_READER_LAB_ENABLED: "true", NOAH_READER_LAB_INVITE_HASHES: createHash("sha256").update(READER_TEST_INVITE).digest("hex"),
      OPENAI_API_KEY: "sk-test-not-a-real-key", NOAH_NEWS_SEARCH_ENABLED: "true", SERPAPI_KEY: "test-not-a-real-key",
      NOAH_BUSINESS_SUPPORT_ENABLED: "false", SOURCE_LINKS_ENABLED: "false", NOAH_READER_TEST_FIXTURES: "true",
    },
  },
});
