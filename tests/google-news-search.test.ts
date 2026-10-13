import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { GET } from "@/app/api/news/discovery/route";
import {
  NEWS_SEARCH_TOPICS, normalizeGoogleNewsResults, parseNewsSearchTopic,
} from "@/lib/news/news-search-contract";
import { newsSearchConfigured } from "@/lib/news/google-news-search";

beforeEach(() => {
  vi.stubEnv("VERCEL_ENV", "preview");
  vi.stubEnv("NEWS_PROVIDER", "government");
  vi.stubEnv("AI_PROVIDER", "off");
  vi.stubEnv("NOAH_REAL_SOURCE_PREVIEW", "true");
  vi.stubEnv("NOAH_NEWS_SEARCH_ENABLED", "true");
  vi.stubEnv("SERPAPI_KEY", "test-not-a-valid-paid-key");
});
afterEach(() => { vi.restoreAllMocks(); vi.unstubAllEnvs(); });

describe("Google News search-only integration", () => {
  it("limits the 10-user shared billable search set to exactly four topics", () => {
    expect(NEWS_SEARCH_TOPICS.map(x => x.id)).toEqual(["economy", "startup", "finance", "policy"]);
    expect(parseNewsSearchTopic("economy")).toBe("economy");
    expect(parseNewsSearchTopic("noah custom unlimited search")).toBeNull();
    expect(parseNewsSearchTopic({ topic: "economy" })).toBeNull();
  });
  it("normalizes only publisher-attributed HTTPS original metadata (flat + grouped)", () => {
    const data = {
      news_results: [
        { title: "금리 인하 전망", source: { name: "경제신문 A" },
          link: "https://news.example.com/story/12?utm_source=news&article=12#section",
          iso_date: "2026-10-12T09:00:00Z", thumbnail: "should-not-be-copied",
          description: "should-not-be-copied" },
        { highlight: { title: "창업 지원 확대", link: "https://press.example.org/article1",
          source: { name: "방송 B" } },
          stories: [
            { title: "지원 정책 반론", source: { name: "신문 C" }, link: "https://paper.example.net/track?sid=20" },
            { title: "금리 인하 전망", source: { name: "경제신문 A" },
              link: "https://news.example.com/story/12?article=12" },
          ] },
        { title: "뉴스 리다이렉트", source: { name: "Google" }, link: "https://news.google.com/articles/abc" },
        { title: "악의적인 링크", source: { name: "가짜 출처" }, link: "javascript:alert(1)" },
        { title: "출처 없음", link: "https://sample.example.com/1" },
      ],
    };
    const rows = normalizeGoogleNewsResults(data);
    expect(rows.map(x => x.sourceName)).toEqual(["경제신문 A", "방송 B", "신문 C"]);
    expect(rows[0].url).toBe("https://news.example.com/story/12?article=12");
    expect(rows[0].publishedAt).toBe("2026-10-12T09:00:00.000Z");
    expect(Object.keys(rows[0]).sort()).toEqual(["publishedAt", "sourceName", "title", "url"]);
    expect(rows.some(x => x.url.includes("news.google.com"))).toBe(false);
  });
  it("fails closed on key/feature flags and production without an explicit setting", async () => {
    const outbound = vi.spyOn(globalThis, "fetch");
    expect(newsSearchConfigured()).toBe(true);
    vi.stubEnv("SERPAPI_KEY", "");
    expect(newsSearchConfigured()).toBe(false);
    const response = await GET(new NextRequest("http://localhost:3000/api/news/discovery?topic=economy"));
    expect(response.status).toBe(503);
    expect(outbound).not.toHaveBeenCalled();
    vi.stubEnv("SERPAPI_KEY", "test");
    vi.stubEnv("NOAH_NEWS_SEARCH_ENABLED", "false");
    expect(newsSearchConfigured()).toBe(false);
    vi.stubEnv("NOAH_NEWS_SEARCH_ENABLED", "true");
    vi.stubEnv("VERCEL_ENV", "production");
    vi.stubEnv("NOAH_LIVE_LINKS_V1", "");
    expect(newsSearchConfigured()).toBe(false);
  });
  it("rejects arbitrary user queries without billing the upstream provider", async () => {
    const outbound = vi.spyOn(globalThis, "fetch");
    const response = await GET(new NextRequest("http://localhost:3000/api/news/discovery?topic=unlimited-user-query"));
    expect(response.status).toBe(400);
    expect(outbound).not.toHaveBeenCalled();
  });
});
