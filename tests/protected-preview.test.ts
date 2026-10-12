import { afterEach, describe, expect, it, vi } from 'vitest';
import { PublicEventSchema, getEdition, getPublicEvent } from '@/lib/data';
import { protectedPreviewDemoEnabled, protectedPreviewEdition } from '@/lib/preview/edition';

afterEach(() => vi.unstubAllEnvs());

describe('protected Vercel preview demo (zero DB, zero AI)', () => {
  it('fails closed when not explicitly on Vercel Preview', () => {
    vi.stubEnv('NEWS_PROVIDER', 'mock');
    vi.stubEnv('AI_PROVIDER', 'mock');
    vi.stubEnv('NOAH_PREVIEW_STATIC_DEMO', 'true');
    vi.stubEnv('VERCEL_ENV', 'production');
    expect(protectedPreviewDemoEnabled()).toBe(false);
    vi.stubEnv('VERCEL_ENV', '');
    expect(protectedPreviewDemoEnabled()).toBe(false);
    vi.stubEnv('VERCEL_ENV', 'preview');
    vi.stubEnv('NOAH_PREVIEW_STATIC_DEMO', 'false');
    expect(protectedPreviewDemoEnabled()).toBe(false);
    vi.stubEnv('NOAH_PREVIEW_STATIC_DEMO', 'true');
    vi.stubEnv('NEWS_PROVIDER', 'government');
    vi.stubEnv('AI_PROVIDER', 'off');
    expect(protectedPreviewDemoEnabled()).toBe(false);
  });

  it('uses synthetic attributed fixtures and never leaks real publisher URLs', () => {
    const now = new Date('2026-10-12T00:00:00.000Z');
    const data = protectedPreviewEdition(now);
    expect(data.mode).toBe('mock');
    expect(data.items).toHaveLength(8);
    expect(data.items.every(e => e.isMock && e.representativeTitle.startsWith('DEMO · '))).toBe(true);
    for (const item of data.items) {
      expect(PublicEventSchema.parse(item)).toBeDefined();
      expect(item.sources).toHaveLength(3);
      expect(item.sources.every(s => new URL(s.url).hostname.endsWith('.example.com'))).toBe(true);
      expect(item.analysis.headlineSummary.startsWith('가상 사례:')).toBe(true);
    }
  });

  it('serves home and detail snapshots without querying persistent DB', async () => {
    vi.stubEnv('NEWS_PROVIDER', 'mock');
    vi.stubEnv('AI_PROVIDER', 'mock');
    vi.stubEnv('NOAH_PREVIEW_STATIC_DEMO', 'true');
    vi.stubEnv('VERCEL_ENV', 'preview');
    const edition = await getEdition();
    expect(edition.items).toHaveLength(8);
    expect(await getPublicEvent('demo-preview-1')).toMatchObject({ id: 'demo-preview-1', isMock: true });
    expect(await getPublicEvent('missing')).toBeNull();
    expect((await getEdition('1900-01-01')).items).toEqual([]);
  });
});
