import { unstable_cache } from "next/cache";
import { publicSourceMode } from "@/lib/news/public-official-sources";
import { NEWS_SEARCH_TOPICS, normalizeGoogleNewsResults, type NewsSearchTopic, type NewsSearchSnapshot } from "@/lib/news/news-search-contract";

/** No key, no spend; never accidentally activate merely by deploying code. */
export function newsSearchConfigured(): boolean {
  return publicSourceMode() &&
    process.env.NOAH_NEWS_SEARCH_ENABLED === "true" &&
    !!process.env.SERPAPI_KEY?.trim();
}

async function searchNewsOnce(topic: NewsSearchTopic): Promise<NewsSearchSnapshot> {
  if (!newsSearchConfigured()) throw new Error("News search not configured");
  const selected = NEWS_SEARCH_TOPICS.find(t => t.id === topic)!;
  const query = new URLSearchParams({
    engine: "google_news",
    q: selected.query,
    gl: "kr",
    hl: "ko",
    so: "1",
    api_key: process.env.SERPAPI_KEY!,
  });
  // Fixed server-defined queries only. API key and raw provider JSON never reach browsers.
  const response = await fetch("https://serpapi.com/search.json?" + query.toString(), {
    signal: AbortSignal.timeout(9000), cache: "no-store",
    headers: { Accept: "application/json" },
  });
  if (!response.ok) throw new Error("Search provider unavailable");
  const json: unknown = await response.json();
  const body = record(json);
  if (body?.error || record(body?.search_metadata)?.status === "Error")
    throw new Error("Search provider returned error");
  return {
    topic,
    items: normalizeGoogleNewsResults(json),
    retrievedAt: new Date().toISOString(),
    provider: "SerpApi / Google News",
  };
}

// Shared across users and requests; fixed query keys. Four topics * ~30d = ~120
// successful upstream searches per month under stable cache conditions.
// This cache is NOT a durable spend limit. Enforce a provider account cap too.
const sharedSearch = unstable_cache(searchNewsOnce, ["noah-google-news-v1"], { revalidate: 86400 });

export async function getNewsSearchSnapshot(topic: NewsSearchTopic): Promise<NewsSearchSnapshot | null> {
  if (!newsSearchConfigured()) return null;
  try { return await sharedSearch(topic); } catch { return null; }
}
