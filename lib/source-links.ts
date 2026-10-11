import { prisma } from '@/lib/db/prisma';
import { runtimeMode } from '@/lib/runtime-mode';

// Source discovery is deliberately NOT an Event, NOAH Brief or AI recommendation.
// Return attribution + links only: no publisher body, image or rawPayload.
export interface SourceLink {
  id: string;
  title: string;
  url: string;
  sourceName: string;
  publishedAt: string;
}

export interface SourceCandidate {
  id: string;
  title: string;
  canonicalUrl: string;
  sourceName: string;
  publishedAt: Date;
}

export function safeOriginalUrl(input: string): string | null {
  try {
    const url = new URL(input);
    if (url.protocol !== 'https:' || !url.hostname || url.username || url.password) return null;
    return url.toString();
  } catch {
    return null;
  }
}

export function toSourceLinks(rows: SourceCandidate[]): SourceLink[] {
  const seen = new Set<string>();
  const links: SourceLink[] = [];
  for (const item of rows) {
    const url = safeOriginalUrl(item.canonicalUrl);
    if (!url || !item.title.trim() || !item.sourceName.trim() || !Number.isFinite(item.publishedAt.getTime())) continue;
    if (seen.has(url)) continue;
    seen.add(url);
    links.push({
      id: item.id,
      title: item.title,
      url,
      sourceName: item.sourceName,
      publishedAt: item.publishedAt.toISOString(),
    });
  }
  return links;
}

export function sourceDiscoveryEnabled() {
  return !runtimeMode().isMock && process.env.SOURCE_LINKS_ENABLED === 'true';
}

export async function getSourceLinks(limit = 40): Promise<SourceLink[]> {
  if (!sourceDiscoveryEnabled()) return [];
  const max = Math.min(100, Math.max(1, Math.floor(limit)));
  const since = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
  const rows = await prisma.article.findMany({
    where: {
      provider: { not: 'mock' },
      duplicateOfId: null,
      publishedAt: { gte: since, lte: new Date() },
    },
    orderBy: [{ publishedAt: 'desc' }, { id: 'asc' }],
    take: max,
    select: { id: true, title: true, canonicalUrl: true, sourceName: true, publishedAt: true },
  });
  return toSourceLinks(rows);
}
