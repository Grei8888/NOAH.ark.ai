import { describe, it, expect, afterEach, vi } from 'vitest';
import { safeOriginalUrl, sourceDiscoveryEnabled, toSourceLinks } from '@/lib/source-links';

afterEach(() => vi.unstubAllEnvs());

describe('live source links (not Event/NOAH Brief)', () => {
  it('requires explicit rights-review launch flag and excludes mock mode', () => {
    vi.stubEnv('NEWS_PROVIDER', 'government');
    vi.stubEnv('AI_PROVIDER', 'off');
    vi.stubEnv('SOURCE_LINKS_ENABLED', '');
    expect(sourceDiscoveryEnabled()).toBe(false);
    vi.stubEnv('SOURCE_LINKS_ENABLED', 'true');
    expect(sourceDiscoveryEnabled()).toBe(true);
    vi.stubEnv('NEWS_PROVIDER', 'mock');
    vi.stubEnv('AI_PROVIDER', 'mock');
    expect(sourceDiscoveryEnabled()).toBe(false);
  });

  it('rejects unsafe or credential-bearing URLs', () => {
    expect(safeOriginalUrl('javascript:alert(1)')).toBeNull();
    expect(safeOriginalUrl('http://mss.go.kr/test')).toBeNull();
    expect(safeOriginalUrl('https://alice:pw@mss.go.kr/test')).toBeNull();
    expect(safeOriginalUrl('/relative')).toBeNull();
    expect(safeOriginalUrl('https://mss.go.kr/notice')).toBe('https://mss.go.kr/notice');
  });

  it('returns distinct safe links and minimal attributed fields only', () => {
    const publishedAt = new Date('2026-10-11T09:00:00.000Z');
    const links = toSourceLinks([
      { id: '1', title: '공식 창업 공고', canonicalUrl: 'https://mss.go.kr/board/123', sourceName: '중소벤처기업부', publishedAt },
      { id: '2', title: '중복 링크', canonicalUrl: 'https://mss.go.kr/board/123', sourceName: '중소벤처기업부', publishedAt },
      { id: '3', title: '잘못된 링크', canonicalUrl: 'javascript:alert(1)', sourceName: 'Unknown', publishedAt },
      { id: '4', title: '  ', canonicalUrl: 'https://mss.go.kr/board/4', sourceName: '중소벤처기업부', publishedAt },
    ]);
    expect(links).toEqual([{ id: '1', title: '공식 창업 공고', url: 'https://mss.go.kr/board/123', sourceName: '중소벤처기업부', publishedAt: '2026-10-11T09:00:00.000Z' }]);
    expect(links[0]).not.toHaveProperty('description');
    expect(links[0]).not.toHaveProperty('rawPayload');
  });
});
