// Read-only upstream connectivity/parsing check. Does not touch DB or any AI provider.
// This is not source-rights clearance or approval to publish content.
import { RSSProvider } from '../lib/news/providers';
import { XMLParser } from 'fast-xml-parser';

const feeds = [
  { name: '중소벤처기업부 사업공고', url: 'https://mss.go.kr/rss/smba/board/310.do' },
  { name: '중소벤처기업부 보도자료', url: 'https://mss.go.kr/rss/smba/board/86.do' },
] as const;

async function main() {
  const from = new Date('2025-01-01T00:00:00.000Z');
  const to = new Date(Date.now() + 24 * 60 * 60 * 1000);
  let failures = 0;
  for (const feed of feeds) {
    try {
      const provider = new RSSProvider([{ url: feed.url, name: feed.name, sourceType: 'GOVERNMENT' }]);
      const data = await provider.fetchArticles({ query: '', from, to });
      if (!data.length) {
        // Structure-only diagnostic: do not print copied articles, titles or body text.
        const res = await fetch(feed.url, { signal: AbortSignal.timeout(20000), cache: 'no-store' });
        const xml = (await res.text()).slice(0, 2000000);
        const parsed = new XMLParser({ processEntities: false }).parse(xml);
        const entries = parsed?.rss?.channel?.item ?? [];
        const first = Array.isArray(entries) ? entries[0] : entries;
        console.error(JSON.stringify({ feed: feed.name, status: res.status,
          contentType: res.headers.get('content-type'), length: xml.length,
          topKeys: Object.keys(parsed ?? {}).slice(0, 8),
          channelKeys: Object.keys(parsed?.rss?.channel ?? {}).slice(0, 15),
          entryCount: Array.isArray(entries) ? entries.length : entries ? 1 : 0,
          itemFields: first && typeof first === 'object' ? Object.keys(first).slice(0, 18) : [],
          dateFields: { pubDate: String(first?.pubDate ?? '').slice(0, 100), published: String(first?.published ?? '').slice(0, 100), date: String(first?.date ?? '').slice(0, 100) },
        }));
        throw new Error('No parseable dated RSS items returned; verify XML structure/date fields');
      }
      const first = data[0];
      console.log(JSON.stringify({ name: feed.name, count: data.length, firstDate: first.publishedAt.toISOString(), firstHost: first.sourceDomain, officialOrigin: first.sourceType === 'GOVERNMENT' }));
    } catch (error) {
      failures++;
      console.error(feed.name, error instanceof Error ? error.message : 'Unspecified feed error');
    }
  }
  if (failures) process.exitCode = 1;
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : 'Smoke check failed');
  process.exitCode = 1;
});
