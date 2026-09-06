import { describe, it, expect } from 'vitest';
import { normalizeUrl, normalizeTitle, normalizeArticle } from '@/lib/news/normalize';
import { deduplicateArticles } from '@/lib/news/deduplicate';
import { mockArticles } from '@/lib/news/mock';
import { clusterArticles } from '@/lib/news/cluster';
import { arkPeriod, latestArkDate, isDailySlot } from '@/lib/time/korea';
import { analyzeEvent, evidenceHash, analysisHash } from '@/lib/ai/analyzeEvent';
import { AnalysisSchema } from '@/lib/ai/schemas';
import { OWNER_PROFILE } from '@/lib/profile';
import { calculateImportanceScore, calculateUserRelevance, calculateFinalScore, toGrade, calculateSpreadScore, eventMetrics, isBreakingCandidate } from '@/lib/scoring/scores';
import { selectArkEvents } from '@/lib/scoring/ranking';
import { publicEvent } from '@/lib/public';
import type { ScoredEvent } from '@/types/domain';
const period = arkPeriod('2026-09-04');
const raw = mockArticles(period.from, period.to);
const normalized = raw.map(normalizeArticle);
const unique = deduplicateArticles(normalized).unique;
const events = clusterArticles(unique);
async function scored(): Promise<ScoredEvent[]> {
    return Promise.all(events.map(async (event) => {
        const analysis = await analyzeEvent(event, OWNER_PROFILE);
        const importanceScore = calculateImportanceScore(event, analysis);
        const relevanceScore = calculateUserRelevance({ ...event, analysis }, OWNER_PROFILE);
        const finalScore = calculateFinalScore(importanceScore, relevanceScore);
        return { ...event, ...eventMetrics(event), analysis, primaryCategory: analysis.primaryCategory, importanceScore, relevanceScore, finalScore, grade: toGrade(finalScore), breakingScore: 0, analysisHash: 'test', isMock: true };
    }));
}
describe('normalization and event identity', () => {
    it('strips tracking, preserves semantic query params and sorts', () => expect(normalizeUrl('https://a.com/a?utm_source=x&b=2&a=1&fbclid=3#foo')).toBe('https://a.com/a?a=1&b=2'));
    it('rejects unsafe schemes', () => expect(() => normalizeUrl('javascript:alert(1)')).toThrow());
    it('preserves meaningful labels and removes publisher suffix', () => expect(normalizeTitle('[속보]  정부   발표!!! - 연합뉴스')).toBe('속보 정부 발표!'));
    it('retains duplicate relationships for URL and title duplicates', () => {
        const result = deduplicateArticles(normalized);
        expect(raw).toHaveLength(32);
        expect(result.unique).toHaveLength(30);
        expect(result.duplicates).toHaveLength(2);
        expect(result.duplicates.every(a => a.duplicateOfId)).toBe(true);
    });
    it('groups 30 articles into ten changes with three sources each', () => { expect(events).toHaveLength(10); expect(events.every(e => e.articles.length === 3)).toBe(true); });
    it('does not merge an announcement with a later recruitment', () => {
        const a = normalizeArticle({ ...raw[0], title: '정부 Physical AI 육성계획 발표' });
        const b = normalizeArticle({ ...raw[1], title: '정부 Physical AI 실증기업 모집 공고' });
        expect(clusterArticles([a, b])).toHaveLength(2);
    });
    it('does not merge similar events more than 48 hours apart', () => {
        const b = normalizeArticle({ ...raw[0], url: 'https://other.example.com/new', publishedAt: new Date(raw[0].publishedAt.getTime() + 72 * 3600000) });
        expect(clusterArticles([normalized[0], b])).toHaveLength(2);
    });
});
describe('scoring and ranking', () => {
    it('calculates weighted score and grade boundaries', () => {
        expect(calculateFinalScore(80, 60)).toBe(73);
        expect([85, 75, 60, 45, 44.99].map(toGrade)).toEqual(['A+', 'A', 'B', 'C', 'D']);
    });
    it('uses observed spread, capped at 15', () => { expect(calculateSpreadScore(events[0])).toBe(12.5); expect(calculateSpreadScore({ ...events[0], articles: [] })).toBe(0); });
    it('uses caller profile for mock relevance', () => {
        expect(calculateUserRelevance(events[0], OWNER_PROFILE)).toBeGreaterThan(calculateUserRelevance(events[0], { id: 'other', interests: [], regions: [], entities: [], businessInterests: [], researchInterests: [], careerInterests: [] }));
    });
    it('validates AI score bounds', async () => {
        const analysis = await analyzeEvent(events[0], OWNER_PROFILE);
        expect(() => AnalysisSchema.parse({ ...analysis, importance: { ...analysis.importance, policyImpact: 21 } })).toThrow();
        expect(calculateImportanceScore(events[0], analysis)).toBe(88.5);
    });
    it('selects fewer than ten qualifying events, not filler', async () => {
        const selected = selectArkEvents(await scored(), 10, period.to);
        expect(selected).toHaveLength(8);
        expect(selected.every(e => e.finalScore >= 60)).toBe(true);
        const titles = selected.map(e => e.representativeTitle).join(' ');
        for (const topic of ['매입약정', '주거복지', '외국인근로자', '외국인투자유치', '의료관광', '스타트업', 'AI', '정책자금']) expect(titles).toContain(topic);
    });
    it('enforces category cap and duplicate removal', async () => {
        const base = (await scored())[0];
        const many = Array.from({ length: 12 }, (_, i) => ({ ...base, id: String(i), representativeTitle: `Unique event ${i}`, primaryCategory: 'AI_TECH' as const }));
        expect(selectArkEvents([...many, many[0]], 10, period.to)).toHaveLength(4);
    });
    it('requires meaningful new information for breaking', () => { expect(isBreakingCandidate(95, 80, false, false)).toBe(false); expect(isBreakingCandidate(95, 80, true, true)).toBe(false); expect(isBreakingCandidate(95, 80, true, false)).toBe(true); });
    it('does not expose personal analysis in public snapshots', async () => {
        const dto = publicEvent((await scored())[0]);
        expect(dto.analysis).not.toHaveProperty('userImplication');
        expect(dto.analysis).not.toHaveProperty('userRelevance');
    });
    it('does not treat a repeated source or changed profile as new evidence', () => {
        const original = events[0];
        const repeated = { ...original, articles: [...original.articles, { ...original.articles[0], id: 'repeat', title: '같은 사실의 재보도' }] };
        expect(evidenceHash(repeated)).toBe(evidenceHash(original));
        expect(analysisHash(original, { ...OWNER_PROFILE, id: 'another-owner' })).not.toBe(analysisHash(original, OWNER_PROFILE));
    });
});
describe('KST time windows', () => {
    it('uses half-open preceding 24 hours', () => { expect(period.from.toISOString()).toBe('2026-09-02T22:00:00.000Z'); expect(period.to.toISOString()).toBe('2026-09-03T22:00:00.000Z'); expect(period.to.getTime() - period.from.getTime()).toBe(86400000); });
    it('handles weekends, before release, invalid dates and month boundaries', () => {
        expect(latestArkDate(new Date('2026-09-05T12:00:00Z'))).toBe('2026-09-04');
        expect(latestArkDate(new Date('2026-09-06T21:59:00Z'))).toBe('2026-09-04');
        expect(isDailySlot(new Date('2026-09-06T22:00:00Z'))).toBe(true);
        expect(() => arkPeriod('2026-02-30')).toThrow();
        expect(arkPeriod('2026-03-01').from.toISOString()).toBe('2026-02-27T22:00:00.000Z');
    });
});
