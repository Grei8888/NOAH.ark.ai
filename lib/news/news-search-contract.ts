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

