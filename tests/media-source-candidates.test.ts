import { describe, it, expect } from "vitest";
import { MEDIA_SOURCE_CANDIDATES, publiclyClearedMediaSources } from "@/lib/news/media-source-candidates";

describe("candidate-only publisher inventory", () => {
  it("tracks diverse real publishers without pretending that YTN has an active official feed", () => {
    expect(MEDIA_SOURCE_CANDIDATES.map((source) => source.id)).toContain("ytn");
    expect(MEDIA_SOURCE_CANDIDATES.find((source) => source.id === "ytn")?.rssUrl).toBeNull();
    expect(new Set(MEDIA_SOURCE_CANDIDATES.map((source) => source.id)).size).toBe(MEDIA_SOURCE_CANDIDATES.length);
    expect(MEDIA_SOURCE_CANDIDATES.length).toBe(9);
  });
  it("requires source-specific permission before public feed activation", () => {
    expect(publiclyClearedMediaSources()).toEqual([]);
    expect(MEDIA_SOURCE_CANDIDATES.every((source) => source.publicEnabled === false && source.permissionStatus === "not-cleared")).toBe(true);
    expect(MEDIA_SOURCE_CANDIDATES.every((source) => source.rssUrl === null || source.rssUrl.startsWith("https://"))).toBe(true);
  });
});
