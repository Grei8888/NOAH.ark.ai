import { unstable_cache } from "next/cache";
import { publicSourceMode } from "@/lib/news/public-official-sources";

/** Search-provider discovery only; article bodies, images and snippets are never used. */
export const NEWS_SEARCH_TOPICS = [
  { id: "economy", label: "경제", query: "한국 경제 물가 금리 기업" },
  { id: "startup", label: "창업", query: "스타트업 창업 소상공인" },
  { id: "finance", label: "금융", query: "금리 대출 금융 시장" },
  { id: "policy", label: "정책", query: "정부 경제 정책 중소기업 지원" },
] as const;

export type NewsSearchTopic = (typeof NEWS_SEARCH_TOPICS)[number]["id"];
export type NewsSearchItem = {
  title: string;
  sourceName: string;
  url: string;
  publishedAt: string | null;
};
export type NewsSearchSnapshot = {
  topic: NewsSearchTopic;
  items: NewsSearchItem[];
  retrievedAt: string;
  provider: "SerpApi / Google News";
};

/** No key, no spend; never accidentally activate merely by deploying code. */
export function newsSearchConfigured(): boolean {
  return publicSourceMode() &&
    process.env.NOAH_NEWS_SEARCH_ENABLED === "true" &&
    !!process.env.SERPAPI_KEY?.trim();
}

export function parseNewsSearchTopic(value: unknown): NewsSearchTopic | null {
  return typeof value === "string" &&
    NEWS_SEARCH_TOPICS.some(topic => topic.id === value)
      ? value as NewsSearchTopic : null;
}
function record(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown> : null;
}
function canonicalPublisherUrl(input: unknown): string | null {
  if (typeof input !== "string" || input.length > 1800) return null;
  try {
    const url = new URL(input);
    if (url.protocol !== "https:" || url.username || url.password || url.port) return null;
    const host = url.hostname.toLowerCase();
    if (host === "localhost" || /^\d+\.\d+\.\d+\.\d+$/.test(host) ||
      host === "google.com" || host.endsWith(".google.com") ||
      host === "serpapi.com" || host.endsWith(".serpapi.com")) return null;
    url.hash = "";
    // Remove common marketing parameters only; preserve article IDs in query.
    for (const key of [...url.searchParams.keys()]) {
      if (/^utm_/i.test(key) || ["fbclid", "gclid", "igshid"].includes(key.toLowerCase())) {
        url.searchParams.delete(key);
      }
    }
    return url.toString();
  } catch { return null; }
}

export function normalizeGoogleNewsResults(payload: unknown): NewsSearchItem[] {
  const root = record(payload);
  const entries = Array.isArray(root?.news_results) ? root.news_results.slice(0, 100) : [];
  const candidates: unknown[] = [];
  for (const entry of entries) {
    const obj = record(entry);
    if (!obj) continue;
    if (record(obj.highlight)) candidates.push(obj.highlight);
    if (Array.isArray(obj.stories)) candidates.push(...obj.stories.slice(0, 12));
    if (typeof obj.title === "string" && typeof obj.link === "string") candidates.push(obj);
  }
  const seen = new Set<string>();
  const items: NewsSearchItem[] = [];
  for (const candidate of candidates) {
    const item = record(candidate);
    if (!item) continue;
    const src = record(item.source);
    const title = typeof item.title === "string" ? item.title.replace(/\s+/g, " ").trim() : "";
    const sourceName = typeof src?.name === "string" ? src.name.replace(/\s+/g, " ").trim() : "";
    const url = canonicalPublisherUrl(item.link);
    if (!url || !title || title.length > 240 || !sourceName || sourceName.length > 65 || seen.has(url)) continue;
    seen.add(url);
    const timestamp = typeof item.iso_date === "string" ? Date.parse(item.iso_date) : NaN;
    const publishedAt = Number.isFinite(timestamp) && timestamp < Date.now() + 86400000
      ? new Date(timestamp).toISOString() : null;
    items.push({ title, sourceName, url, publishedAt });
    if (items.length >= 20) break;
  }
  return items;
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
