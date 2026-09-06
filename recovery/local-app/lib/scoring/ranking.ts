import { SCORE_CONFIG as C } from './config';
import type { ScoredEvent } from '@/types/domain';
import { normalizeTitle } from '@/lib/news/normalize';
export function calculateRecencyAdjustment(lastSeenAt: Date, now: Date) {
    return Math.max(0, 1 - Math.max(0, now.getTime() - lastSeenAt.getTime()) / (C.ark.recencyHours * 3600000)) * C.ark.recencyMax;
}
export function selectArkEvents(events: ScoredEvent[], maxItems = C.ark.maxEvents as number, now = new Date()) {
    const counts = new Map<string, number>();
    const ids = new Set<string>();
    const titles = new Set<string>();
    return events.filter(e => e.finalScore >= C.ark.minimumFinalScore)
        .sort((a, b) => (b.finalScore + calculateRecencyAdjustment(b.lastSeenAt, now)) - (a.finalScore + calculateRecencyAdjustment(a.lastSeenAt, now)) || a.id.localeCompare(b.id))
        .filter(e => {
        const title = normalizeTitle(e.representativeTitle);
        if (ids.has(e.id) || titles.has(title) || (counts.get(e.primaryCategory) ?? 0) >= C.ark.maxPerCategory)
            return false;
        ids.add(e.id);
        titles.add(title);
        counts.set(e.primaryCategory, (counts.get(e.primaryCategory) ?? 0) + 1);
        return true;
    }).slice(0, Math.max(0, Math.min(C.ark.maxEvents, maxItems)));
}
