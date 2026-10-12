import { z } from 'zod';
import { prisma } from '@/lib/db/prisma';
import { runtimeMode } from '@/lib/runtime-mode';
import { AnalysisSchema } from '@/lib/ai/schemas';
import type { PublicEvent } from '@/types/domain';
import { protectedPreviewDemoEnabled, protectedPreviewEdition } from '@/lib/preview/edition';
import { publicSourceMode } from '@/lib/news/public-official-sources';

const sourceURL = z.string().url().refine(url => /^https?:/.test(url));
export const PublicEventSchema = z.object({
  id: z.string(), representativeTitle: z.string(), primaryCategory: AnalysisSchema.shape.primaryCategory,
  grade: z.string(), isMock: z.boolean(), importanceScore: z.number().min(0).max(100),
  articleCount: z.number(), sourceCount: z.number(), officialSourceAvailable: z.boolean(),
  firstSeenAt: z.string().datetime(), lastSeenAt: z.string().datetime(),
  analysis: AnalysisSchema.omit({ userRelevance: true, userImplication: true }),
  sources: z.array(z.object({ id: z.string(), title: z.string(), url: sourceURL,
    sourceName: z.string(), sourceType: z.string(), description: z.string(), publishedAt: z.string().datetime() })),
});
export interface Edition { mode: 'mock' | 'live'; date: string | null; publishedAt: string | null; items: PublicEvent[] }
export async function getEdition(date?: string): Promise<Edition> {
  // Genuine-source beta publishes no invented or unanalyzed Event/Ark objects.
  if (publicSourceMode()) return { mode: 'live', date: null, publishedAt: null, items: [] };
  // Protected demo has no DB dependency and cannot activate on production deployment.
  if (protectedPreviewDemoEnabled()) {
    const preview = protectedPreviewEdition();
    return date && preview.date !== date ? { ...preview, items: [] } : preview;
  }
  const { isMock } = runtimeMode();
  const ark = await prisma.dailyArk.findFirst({
    where: { status: 'PUBLISHED', isMock, ...(date ? { arkDate: date } : {}) },
    orderBy: { arkDate: 'desc' }, include: { items: { orderBy: { rank: 'asc' } } },
  });
  const items = (ark?.items ?? []).map(item => PublicEventSchema.parse(item.snapshot));
  if (items.some(event => event.isMock !== isMock)) throw new Error('Edition mode boundary failed');
  return { mode: isMock ? 'mock' : 'live', date: ark?.arkDate ?? null, publishedAt: ark?.publishedAt?.toISOString() ?? null, items };
}
export async function getPublicEvent(id: string): Promise<PublicEvent | null> {
  if (publicSourceMode()) return null;
  if (protectedPreviewDemoEnabled()) return protectedPreviewEdition().items.find(e => e.id === id) ?? null;
  const { isMock } = runtimeMode();
  // Read the actual published snapshot; failed re-analysis cannot mutate the edition.
  const item = await prisma.arkItem.findFirst({ where: { eventId: id, ark: { status: 'PUBLISHED', isMock } }, orderBy: { ark: { arkDate: 'desc' } } });
  if (!item) return null;
  const event = PublicEventSchema.parse(item.snapshot);
  if (event.isMock !== isMock) throw new Error('Event mode boundary failed');
  return event;
}
