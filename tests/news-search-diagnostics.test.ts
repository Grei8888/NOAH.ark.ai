import { describe, expect, it } from "vitest";
import { failureCodeFromStatus, decodeProviderStatus } from "@/lib/news/google-news-search";

describe("diagnostic news search failures without exposing credentials", () => {
  it("distinguishes credential, quota, provider and rejected request HTTP codes", () => {
    expect(failureCodeFromStatus(401)).toBe("invalid_key");
    expect(failureCodeFromStatus(403)).toBe("invalid_key");
    expect(failureCodeFromStatus(429)).toBe("quota");
    expect(failureCodeFromStatus(400)).toBe("upstream_rejected");
    expect(failureCodeFromStatus(503)).toBe("provider_unavailable");
  });
  it("separates known SerpApi errors and good responses", () => {
    expect(decodeProviderStatus({ error: "Invalid API key. Your API key should be here" })).toBe("invalid_key");
    expect(decodeProviderStatus({ error: "Your account has run out of searches." })).toBe("quota");
    expect(decodeProviderStatus({ error: "Upstream Google page unavailable." })).toBe("provider_unavailable");
    expect(decodeProviderStatus({ search_metadata: { status: "Error" } })).toBe("provider_unavailable");
    expect(decodeProviderStatus({ search_metadata: { status: "Success" }, news_results: [] })).toBeNull();
    expect(decodeProviderStatus(null)).toBe("unexpected_response");
  });
});
