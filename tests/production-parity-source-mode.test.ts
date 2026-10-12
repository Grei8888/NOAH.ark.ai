import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { publicSourceMode } from "@/lib/news/public-official-sources";

beforeEach(() => {
  vi.stubEnv("VERCEL_ENV", "preview");
  vi.stubEnv("NOAH_REAL_SOURCE_PREVIEW", "true");
  vi.stubEnv("NEWS_PROVIDER", "government");
  vi.stubEnv("AI_PROVIDER", "off");
});
afterEach(() => vi.unstubAllEnvs());

describe("production-parity real RSS mode", () => {
  it("runs the same ministry collector on explicitly opted-in preview", () => {
    expect(publicSourceMode()).toBe(true);
    vi.stubEnv("NOAH_REAL_SOURCE_PREVIEW", "");
    expect(publicSourceMode()).toBe(false);
  });
  it("does not silently use mock news or AI when real sources were requested", () => {
    vi.stubEnv("NEWS_PROVIDER", "mock");
    expect(publicSourceMode()).toBe(false);
    vi.stubEnv("NEWS_PROVIDER", "government");
    vi.stubEnv("AI_PROVIDER", "mock");
    expect(publicSourceMode()).toBe(false);
  });
  it("does not accept preview feature flag in production; production keeps its existing switch", () => {
    vi.stubEnv("VERCEL_ENV", "production");
    vi.stubEnv("NOAH_LIVE_LINKS_V1", "");
    expect(publicSourceMode()).toBe(false);
    vi.stubEnv("NOAH_LIVE_LINKS_V1", "true");
    expect(publicSourceMode()).toBe(true);
    vi.stubEnv("AI_PROVIDER", "openai");
    expect(publicSourceMode()).toBe(false);
  });
  it("never enables an unapproved standalone production server", () => {
    vi.stubEnv("VERCEL_ENV", "");
    vi.stubEnv("NODE_ENV", "production");
    expect(publicSourceMode()).toBe(false);
  });
});
