import { describe, it, expect, afterEach, vi } from 'vitest';
import { RSSProvider } from '@/lib/news/providers';

afterEach(() => vi.unstubAllGlobals());

const feedUrl = 'https://mss.go.kr/rss/smba/board/310.do';
const sample = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"><channel><title>공식 사업공고</title><item>
<title><![CDATA[2026년 창업 지원사업 공고]]></title>
<link>https://mss.go.kr/site/smba/ex/bbs/View.do?cbIdx=310&amp;bcIdx=5</link>
<pubDate>Sun, 11 Oct 2026 09:00:00 GMT</pubDate>
<description><![CDATA[<p>신청 기한은 원문 확인</p>]]></description>
</item><item><title>기간 외 항목</title>
<link>https://mss.go.kr/older</link>
<pubDate>Mon, 06 Jul 2020 09:00:00 GMT</pubDate>
</item></channel></rss>`;

describe('RSS official source parser', () => {
  it('parses source title/link/date and keeps attribution as evidence, not AI analysis', async () => {
    const mockFetch = vi.fn().mockResolvedValue(new Response(sample, { status: 200, headers: { 'Content-Type': 'text/xml' } }));
    vi.stubGlobal('fetch', mockFetch);
    const provider = new RSSProvider([{ url: feedUrl, name: '중소벤처기업부', sourceType: 'GOVERNMENT' }]);
    const items = await provider.fetchArticles({ query: '', from: new Date('2026-10-01'), to: new Date('2026-10-21') });
    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({
      provider: 'rss',
      sourceName: '중소벤처기업부',
      sourceType: 'GOVERNMENT',
      title: '2026년 창업 지원사업 공고',
      url: 'https://mss.go.kr/site/smba/ex/bbs/View.do?bcIdx=5&cbIdx=310',
      description: '신청 기한은 원문 확인',
    });
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });
  it('never labels cross-host article links as an official source', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(sample.replaceAll('https://mss.go.kr/site/smba/ex/bbs/View.do', 'https://outside.example.org/link'), { status: 200 })));
    const items = await new RSSProvider([{ url: feedUrl, name: '중소벤처기업부', sourceType: 'GOVERNMENT' }]).fetchArticles({ query: '', from: new Date('2026-10-01'), to: new Date('2026-10-21') });
    expect(items[0].sourceType).toBe('NEWS_MEDIA');
  });
});
