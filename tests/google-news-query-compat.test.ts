import { describe, expect, it } from "vitest";
import { NEWS_SEARCH_TOPICS } from "@/lib/news/news-search-contract";
import { buildGoogleNewsQuery } from "@/lib/news/google-news-search";

describe("SerpApi Google News query compatibility", () => {
  it.each(NEWS_SEARCH_TOPICS)("uses only documented standard search parameters for $label", item => {
    const query = buildGoogleNewsQuery(item.id, "test-secret-placeholder");
    expect(query.get("engine")).toBe("google_news");
    expect(query.get("q")).toBe(item.query);
    expect(query.get("gl")).toBe("kr");
    expect(query.get("hl")).toBe("ko");
    expect(query.get("api_key")).toBe("test-secret-placeholder");
    // q and advanced news parameters must not be combined:
    expect(query.has("so")).toBe(false);
    expect(query.has("topic_token")).toBe(false);
    expect(query.has("section_token")).toBe(false);
    expect([...query.keys()].sort()).toEqual(["api_key", "engine", "gl", "hl", "q"]);
  });
  it("does not permit an arbitrary user search query to reach the billed adapter", () => {
    expect(() => buildGoogleNewsQuery("random user q" as "economy", "fake")).toThrow("Unsupported search category");
  });
});
