import { unstable_cache } from 'next/cache';
import { RSSProvider } from '@/lib/news/providers';
import { normalizeUrl } from '@/lib/news/normalize';

export type OfficialFeedKind = 'notice' | 'press';
export interface OfficialSourceLink {
  id: string;
  title: string;
  url: string;
  sourceName: string;
  publishedAt: string;
  kind: OfficialFeedKind;
}

export interface OfficialFeedSnapshot {
  items: OfficialSourceLink[];
  retrievedAt: string;
  availableFeeds: number;
  totalFeeds: number;
}

const FEEDS = [
  { kind: 'notice', name: '중소벤처기업부 · 사업공고', url: 'https://mss.go.kr/rss/smba/board/310.do' },
  { kind: 'press', name: '중소벤처기업부 · 보도자료', url: 'https://mss.go.kr/rss/smba/board/86.do' },
] as const;

export function publicSourceMode(): boolean {
  return process.env.NOAH_LIVE_LINKS_V1 === 'true' &&
    process.env.NEWS_PROVIDER === 'government' &&
    process.env.AI_PROVIDER === 'off' &&
    process.env.VERCEL_ENV === 'production';
}

export function validMinistryLink(input: string): string | null {
  try {
    const normalized = normalizeUrl(input);
    const parsed = new URL(normalized);
    if (parsed.protocol !== 'https:') return null;
    const host = parsed.hostname.toLowerCase();
    if (host !== 'mss.go.kr' && host !== 'www.mss.go.kr') return null;
    return normalized;
  } catch { return null; }
}

export function curateOfficialSources(
  rows: Array<{ title: string; url: string; publishedAt: Date; kind: OfficialFeedKind; sourceName: string }>,
  now = new Date(),
): OfficialSourceLink[] {
  const maxTime = now.getTime();
  const minTime = maxTime - 14 * 86400000;
  const seen = new Set<string>();
  const sorted = [...rows].sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());
  const items: OfficialSourceLink[] = [];
  for (const row of sorted) {
    const url = validMinistryLink(row.url);
    const date = row.publishedAt.getTime();
    const title = row.title.replace(/\s+/g, ' ').trim();
    if (!url || !title || title.length > 240 || !Number.isFinite(date) || date > maxTime || date < minTime || seen.has(url)) continue;
    seen.add(url);
    items.push({
      id: url,
      title,
      url,
      sourceName: row.sourceName,
      publishedAt: row.publishedAt.toISOString(),
      kind: row.kind,
    });
    if (items.length >= 40) break;
  }
  return items;
}

// Server-side, official publisher feeds only. Never copy body, descriptions or photographs.
// Cached to avoid hammering ministry servers on each visitor request (30-minute refresh).
const cachedSnapshot = unstable_cache(async (): Promise<OfficialFeedSnapshot> => {
  const now = new Date();
  const from = new Date(now.getTime() - 14 * 86400000);
  const until = new Date(now.getTime() + 60_000);
  const results = await Promise.allSettled(FEEDS.map(async feed => {
    const provider = new RSSProvider([{ url: feed.url, name: feed.name, sourceType: 'GOVERNMENT' }]);
    const articles = await provider.fetchArticles({ from, to: until, query: '' });
    return articles.filter(a => a.sourceType === 'GOVERNMENT').map(a => ({
      title: a.title,
      url: a.url,
      publishedAt: a.publishedAt,
      kind: feed.kind as OfficialFeedKind,
      sourceName: feed.name,
    }));
  }));
  const rows = results.flatMap(result => result.status === 'fulfilled' ? result.value : []);
  return {
    items: curateOfficialSources(rows, now),
    retrievedAt: now.toISOString(),
    availableFeeds: results.filter(r => r.status === 'fulfilled').length,
    totalFeeds: FEEDS.length,
  };
}, ['noah-real-ministry-rss-v1'], { revalidate: 1800 });

export async function getOfficialSourceSnapshot(): Promise<OfficialFeedSnapshot> {
  if (!publicSourceMode()) return { items: [], retrievedAt: new Date().toISOString(), availableFeeds: 0, totalFeeds: FEEDS.length };
  try {
    return await cachedSnapshot();
  } catch {
    return { items: [], retrievedAt: new Date().toISOString(), availableFeeds: 0, totalFeeds: FEEDS.length };
  }
}
