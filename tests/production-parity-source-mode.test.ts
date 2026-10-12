import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { publicSourceMode } from "@/lib/news/public-official-sources";

const names = [
  "VERCEL_ENV", "NODE_ENV", "NOAH_LIVE_LINKS_V1", "NOAH_REAL_SOURCE_PREVIEW",
  "NEWS_PROVIDER", "AI_PROVIDER",
] as const;
const previous = Object.fromEntries(names.map(name => [name, process.env[name]]));

beforeEach(() => {
  process.env.VERCEL_ENV = "preview";
  process.env.NOAH_REAL_SOURCE_PREVIEW = "true";
  process.env.NEWS_PROVIDER = "government";
  process.env.AI_PROVIDER = "off";
});
afterEach(() => {
  for (const name of names) {
    const value = previous[name];
    if (value === undefined) delete process.env[name];
    else process.env[name] = value;
  }
});

describe("production-parity real RSS mode", () => {
  it("runs the same ministry collector on explicitly opted-in preview", () => {
    expect(publicSourceMode()).toBe(true);
    delete process.env.NOAH_REAL_SOURCE_PREVIEW;
    expect(publicSourceMode()).toBe(false);
  });
  it("does not silently use mock news or AI when real sources were requested", () => {
    process.env.NEWS_PROVIDER = "mock";
    expect(publicSourceMode()).toBe(false);
    process.env.NEWS_PROVIDER = "government";
    process.env.AI_PROVIDER = "mock";
    expect(publicSourceMode()).toBe(false);
  });
  it("does not accept preview feature flag in production; production keeps its existing switch", () => {
    process.env.VERCEL_ENV = "production";
    expect(publicSourceMode()).toBe(false);
    process.env.NOAH_LIVE_LINKS_V1 = "true";
    expect(publicSourceMode()).toBe(true);
    process.env.AI_PROVIDER = "openai";
    expect(publicSourceMode()).toBe(false);
  });
  it("never enables an unapproved standalone production server", () => {
    delete process.env.VERCEL_ENV;
    process.env.NODE_ENV = "production";
    expect(publicSourceMode()).toBe(false);
  });
});
