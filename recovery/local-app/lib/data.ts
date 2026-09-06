import { prisma } from '@/lib/db/prisma';
import type { PublicEvent } from '@/types/domain';
import { scoredRow } from '@/lib/pipeline';
import { publicEvent } from '@/lib/public';
export async function getArk(date?: string) {
    return prisma.dailyArk.findFirst({ where: { status: 'PUBLISHED', ...(date ? { arkDate: date } : {}) }, orderBy: { arkDate: 'desc' }, include: { items: { orderBy: { rank: 'asc' } } } });
}
export async function getArchives() { return prisma.dailyArk.findMany({ where: { status: 'PUBLISHED' }, orderBy: { arkDate: 'desc' }, take: 30, select: { arkDate: true, eventCount: true } }); }
export function snapshot(value: unknown) { return value as PublicEvent; }
export async function getPublicEvent(id: string) {
    const event = await prisma.event.findUnique({ where: { id }, include: { articles: { include: { article: true } }, arkItems: { take: 1, where: { ark: { status: 'PUBLISHED' } } } } });
    if (!event || !event.arkItems.length || event.analysisStatus !== 'COMPLETED')
        return null;
    return publicEvent(scoredRow(event));
}
