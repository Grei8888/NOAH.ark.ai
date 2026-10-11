// Read-only upstream connectivity/parsing check. Does not touch DB or any AI provider.
// This is not source-rights clearance or approval to publish content.
import { RSSProvider } from '../lib/news/providers';

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
      if (!data.length) throw new Error('No parseable dated RSS items returned; verify XML structure/date fields');
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
