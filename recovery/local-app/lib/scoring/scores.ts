import type { Analysis } from '@/lib/ai/schemas';
import type { EventCandidate, UserProfile } from '@/types/domain';
import { SCORE_CONFIG as C } from './config';
const sum = (values: Record<string, number>) => Object.values(values).reduce((a, b) => a + b, 0);
export const round = (value: number) => Math.round(value * 100) / 100;
export function eventMetrics(event: EventCandidate, now = event.lastSeenAt) {
    const sourceCount = new Set(event.articles.map(a => a.sourceDomain)).size;
    const publicationVelocity = event.articles.filter(a => a.publishedAt.getTime() > now.getTime() - 3600000 && a.publishedAt <= now).length;
    return { articleCount: event.articles.length, sourceCount, publicationVelocity,
        officialSourceAvailable: event.articles.some(a => ['GOVERNMENT', 'PUBLIC_AGENCY'].includes(a.sourceType)) };
}
export function calculateSpreadScore(event: EventCandidate) {
    const m = eventMetrics(event);
    const c = C.spread;
    return round(Math.min(c.max, m.sourceCount * c.sourceWeight + m.articleCount * c.articleWeight + Math.min(c.velocityCap, m.publicationVelocity) * c.velocityWeight + (m.officialSourceAvailable ? c.officialBonus : 0)));
}
export function calculateImportanceScore(event: EventCandidate, analysis: Analysis) {
    const reliability = Math.max(0, ...event.articles.map(a => C.reliability[a.sourceType]));
    return round(Math.min(100, sum(analysis.importance) + reliability + calculateSpreadScore(event)));
}
export function calculateUserRelevance(event: EventCandidate & {
    analysis?: Analysis;
}, profile: UserProfile): number {
    if (event.analysis)
        return round(sum(event.analysis.userRelevance));
    return sum(mockRelevance(event, profile));
}
export function mockRelevance(event: EventCandidate, profile: UserProfile): Analysis['userRelevance'] {
    const text = event.articles.map(a => `${a.title} ${a.description}`).join(' ').toLowerCase();
    const match = (terms: string[], max: number) => terms.some(t => text.includes(t.toLowerCase())) ? max : 0;
    return { interestMatch: match(profile.interests, 25), businessMatch: match(profile.businessInterests, 20), careerMatch: match(profile.careerInterests, 15), researchMatch: match(profile.researchInterests, 15), regionMatch: match(profile.regions, 10), entityMatch: match(profile.entities, 10), actionability: /모집|공고|신청|개편|개정/.test(text) ? 5 : 0 };
}
export const calculateFinalScore = (importance: number, relevance: number) => round(importance * C.final.importanceWeight + relevance * C.final.relevanceWeight);
export function toGrade(score: number) { return score >= C.grade.aPlus ? 'A+' : score >= C.grade.a ? 'A' : score >= C.grade.b ? 'B' : score >= C.grade.c ? 'C' : 'D'; }
export function calculateBreakingScore(event: EventCandidate, analysis: Analysis, relevance: number, now: Date) {
    const m = eventMetrics(event, now);
    const c = C.breaking;
    return round(Math.min(1, m.publicationVelocity / c.velocitySaturation) * c.velocity + Math.min(1, m.sourceCount / c.sourcesSaturation) * c.sources + (m.officialSourceAvailable ? c.official : 0) + analysis.importance.policyImpact / 20 * c.impact + analysis.importance.novelty / 15 * c.novelty + relevance / 100 * c.relevance);
}
export function isBreakingCandidate(score: number, relevance: number, hasNewInformation: boolean, alreadyAlerted: boolean) {
    return score >= C.breaking.threshold && relevance >= C.breaking.minimumRelevance && hasNewInformation && !alreadyAlerted;
}
