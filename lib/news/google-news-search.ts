import { unstable_cache } from "next/cache";
import { publicSourceMode } from "@/lib/news/public-official-sources";
import { NEWS_SEARCH_TOPICS, normalizeGoogleNewsResults, type NewsSearchTopic, type NewsSearchSnapshot } from "@/lib/news/news-search-contract";

/**
 * We must report a useful, safe reason when search fails rather than hide every
 * error as "no results". Never expose provider response bodies or API secrets.
 */
export type NewsSearchFailureCode =
  | "configuration"
  | "invalid_key"
  | "quota"
  | "upstream_rejected"
  | "provider_unavailable"
  | "timeout"
  | "unexpected_response"
  | "no_results";
export type NewsSearchOutcome =
  | { ok: true; snapshot: NewsSearchSnapshot }
  | { ok: false; code: NewsSearchFailureCode };

class NewsSearchFailure extends Error {
  constructor(readonly code: NewsSearchFailureCode) {
    super("NOAH news search: " + code);
    this.name = "NewsSearchFailure";
  }
}
const recentFailures = new Map<NewsSearchTopic, { expiresAt: number; code: NewsSearchFailureCode }>();
// This is a best-effort same-process throttle, not a distributed spend cap.
const RETRY_WAIT_MS = 90_000;

export function newsSearchConfigured(): boolean {
  return publicSourceMode() &&
    process.env.NOAH_NEWS_SEARCH_ENABLED === "true" &&
    !!process.env.SERPAPI_KEY?.trim();
}

export function failureCodeFromStatus(status: number): NewsSearchFailureCode {
  if (status === 401 || status === 403) return "invalid_key";
  if (status === 429) return "quota";
  if (status === 400 || status === 422) return "upstream_rejected";
  return "provider_unavailable";
}

export function decodeProviderStatus(payload: unknown): NewsSearchFailureCode | null {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) return "unexpected_response";
  const body = payload as Record<string, unknown>;
  const error = typeof body.error === "string" ? body.error.toLowerCase() : "";
  const meta = body.search_metadata;
  const status = meta && typeof meta === "object" && !Array.isArray(meta)
    ? (meta as Record<string, unknown>).status : undefined;
  if (!error && status !== "Error") return null;
  if (/api.key|unauthoriz|invalid.key|authentication|permission/.test(error)) return "invalid_key";
  if (/searches remaining|quota|limit|credit|exhaust/.test(error)) return "quota";
  return "provider_unavailable";
}

async function searchNewsOnce(topic: NewsSearchTopic): Promise<NewsSearchSnapshot> {
  if (!newsSearchConfigured()) throw new NewsSearchFailure("configuration");
  const selected = NEWS_SEARCH_TOPICS.find(t => t.id === topic)!;
  const query = new URLSearchParams({
    engine: "google_news",
    q: selected.query,
    gl: "kr",
    hl: "ko",
    so: "1",
    api_key: process.env.SERPAPI_KEY!,
  });
  try {
    // A 9s timeout caused needless empty screens during third-party degradation.
    // Don't retry automatically: each new search may consume API quota.
    const response = await fetch("https://serpapi.com/search.json?" + query.toString(), {
      signal: AbortSignal.timeout(18000),
      cache: "no-store",
      headers: { Accept: "application/json" },
    });
    if (!response.ok) throw new NewsSearchFailure(failureCodeFromStatus(response.status));
    let payload: unknown;
    try { payload = await response.json(); }
    catch { throw new NewsSearchFailure("unexpected_response"); }
    const providerError = decodeProviderStatus(payload);
    if (providerError) throw new NewsSearchFailure(providerError);
    const items = normalizeGoogleNewsResults(payload);
    if (items.length === 0) throw new NewsSearchFailure("no_results");
    return {
      topic, items, retrievedAt: new Date().toISOString(),
      provider: "SerpApi / Google News",
    };
  } catch (err) {
    if (err instanceof NewsSearchFailure) throw err;
    if (err instanceof Error && (err.name === "TimeoutError" || err.name === "AbortError"))
      throw new NewsSearchFailure("timeout");
    throw new NewsSearchFailure("provider_unavailable");
  }
}

// A successfully fetched actual result is shared across readers for one day.
// Next/Vercel's cache is not a hard spend cap across invocations or deployments.
const sharedSearch = unstable_cache(searchNewsOnce, ["noah-google-news-v2"], { revalidate: 86400 });

export async function getNewsSearchOutcome(topic: NewsSearchTopic): Promise<NewsSearchOutcome> {
  if (!newsSearchConfigured()) return { ok: false, code: "configuration" };
  const cooldown = recentFailures.get(topic);
  if (cooldown && Date.now() < cooldown.expiresAt) {
    return { ok: false, code: cooldown.code };
  }
  try {
    const snapshot = await sharedSearch(topic);
    recentFailures.delete(topic);
    return { ok: true, snapshot };
  } catch (err) {
    const code = err instanceof NewsSearchFailure ? err.code : "provider_unavailable";
    // No user data, provider content, query URL or credentials are logged.
    console.warn("[NOAH search] topic=%s outcome=%s", topic, code);
    recentFailures.set(topic, { code, expiresAt: Date.now() + RETRY_WAIT_MS });
    return { ok: false, code };
  }
}

export async function getNewsSearchSnapshot(topic: NewsSearchTopic): Promise<NewsSearchSnapshot | null> {
  const result = await getNewsSearchOutcome(topic);
  return result.ok ? result.snapshot : null;
}
