import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const fetchStub = vi.hoisted(() => vi.fn());

vi.mock('next/cache', () => ({
  unstable_cache: (fn: (...args: unknown[]) => unknown) => fn,
}));
vi.mock('@/lib/news/providers', () => ({
  RSSProvider: class {
    constructor(readonly feeds: Array<{ name: string; url: string }>, readonly timeoutMs: number) {}
    async fetchArticles() { return fetchStub(this.feeds[0].name); }
  },
}));

import {
  getManualOfficialSourceSnapshot,
  getOfficialSourceSnapshot,
  publicSourceMode,
} from '@/lib/news/public-official-sources';

beforeEach(() => {
  vi.stubEnv('VERCEL_ENV', 'production');
  vi.stubEnv('NOAH_LIVE_LINKS_V1', 'true');
  vi.stubEnv('NEWS_PROVIDER', 'government');
  vi.stubEnv('AI_PROVIDER', 'off');
  fetchStub.mockReset();
});
afterEach(() => vi.unstubAllEnvs());

const item = {
  sourceType: 'GOVERNMENT',
  title: '2026년 창업 지원사업 모집',
  url: 'https://www.mss.go.kr/site/smba/ex/bbs/View.do?cbIdx=310&bcIdx=11',
  publishedAt: new Date(),
};

describe('manually refreshed public government RSS', () => {
  it('is only available in explicit production source-only mode', async () => {
    expect(publicSourceMode()).toBe(true);
    vi.stubEnv('AI_PROVIDER', 'openai');
    expect(publicSourceMode()).toBe(false);
    expect((await getManualOfficialSourceSnapshot()).items).toEqual([]);
    expect(fetchStub).not.toHaveBeenCalled();
  });

  it('only returns safe original links and a genuine completed check time', async () => {
    fetchStub.mockResolvedValue([item]);
    const result = await getManualOfficialSourceSnapshot();
    expect(result.availableFeeds).toBe(2);
    expect(result.items).toHaveLength(1); // Deduplicate identical publisher links.
    expect(result.items[0].url.startsWith('https://www.mss.go.kr/')).toBe(true);
    expect(result.items[0]).not.toHaveProperty('description');
    expect(result.items[0]).not.toHaveProperty('imageUrl');
    expect(Number.isFinite(new Date(result.retrievedAt).getTime())).toBe(true);
  });

  it('returns partial results when one publisher feed fails', async () => {
    fetchStub.mockImplementation((name: string) =>
      name.includes('사업공고') ? Promise.reject(new Error('publisher timeout')) : Promise.resolve([item]));
    const r = await getManualOfficialSourceSnapshot();
    expect(r.availableFeeds).toBe(1);
    expect(r.items).toHaveLength(1);
  });

  it('marks an all-feeds failure and does not synthesize stories', async () => {
    fetchStub.mockRejectedValue(new Error('publisher unreachable'));
    const result = await getManualOfficialSourceSnapshot();
    expect(result.availableFeeds).toBe(0);
    expect(result.items).toEqual([]);
    const baseline = await getOfficialSourceSnapshot();
    expect(baseline.availableFeeds).toBe(0);
    expect(baseline.items).toEqual([]);
  });
});
