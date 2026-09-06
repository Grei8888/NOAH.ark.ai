import { randomUUID } from 'node:crypto';
import { prisma } from '@/lib/db/prisma';
import type { Prisma, Article, Event as DBEvent } from '../.generated/postgres';
import type { NormalizedArticle, ScoredEvent, UserProfile, Category, SourceType } from '@/types/domain';
import { getProvider } from '@/lib/news/providers';
import { hash, normalizeArticle } from '@/lib/news/normalize';
import { deduplicateArticles } from '@/lib/news/deduplicate';
import { clusterArticles } from '@/lib/news/cluster';
import { analyzeEvent, analysisHash, evidenceHash } from '@/lib/ai/analyzeEvent';
import { AnalysisSchema } from '@/lib/ai/schemas';
import { calculateImportanceScore, calculateUserRelevance, calculateFinalScore, toGrade, eventMetrics, calculateBreakingScore, isBreakingCandidate } from '@/lib/scoring/scores';
import { selectArkEvents } from '@/lib/scoring/ranking';
import { arkPeriod, latestArkDate } from '@/lib/time/korea';
import { publicEvent } from '@/lib/public';
export type PipelineType = 'full' | 'collect' | 'process' | 'generate-ark' | 'breaking';
const json = (value: unknown) => JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
function fromRow(a: Article): NormalizedArticle { return { ...a, sourceType: a.sourceType as SourceType, author: a.author ?? undefined, imageUrl: a.imageUrl ?? undefined, newsLabel: a.newsLabel ?? undefined, rawPayload: a.rawPayload as NormalizedArticle['rawPayload'] }; }
export class PipelineBusyError extends Error {
}
export async function runPipeline(type: PipelineType = 'full', date = latestArkDate(), now = new Date()) {
    const period = type === 'breaking' ? { from: new Date(now.getTime() - 24 * 3600000), to: now } : arkPeriod(date);
    if (period.to > now)
        throw new Error('Cannot publish an unfinished collection period');
    const owner = randomUUID();
    const startedAt = new Date();
    const counters = { articlesFetched: 0, articlesInserted: 0, duplicatesRemoved: 0, eventsCreated: 0, eventsUpdated: 0, aiRequests: 0, aiSuccess: 0, aiFailed: 0, arkGenerated: false };
    const errors: string[] = [];
    // One DB-enforced lease serializes daily, breaking, and manual operations.
    await prisma.pipelineLock.deleteMany({ where: { id: 'pipeline', expiresAt: { lt: new Date() } } });
    try {
        await prisma.pipelineLock.create({ data: { id: 'pipeline', owner, expiresAt: new Date(Date.now() + 120000) } });
    }
    catch (error) {
        if ((error as {
            code?: string;
        }).code === 'P2002')
            throw new PipelineBusyError('Pipeline already running');
        throw error;
    }
    const renew = async () => {
        const result = await prisma.pipelineLock.updateMany({ where: { id: 'pipeline', owner, expiresAt: { gt: new Date() } }, data: { expiresAt: new Date(Date.now() + 120000) } });
        if (result.count !== 1)
            throw new PipelineBusyError('Pipeline lease lost');
    };
    let leaseLost = false;
    const heartbeat = setInterval(() => { renew().catch(() => { leaseLost = true; }); }, 20000);
    const assertLease = async () => { if (leaseLost)
        throw new PipelineBusyError('Pipeline lease lost'); await renew(); };
    try {
        await prisma.pipelineLog.create({ data: { id: owner, type, startedAt } });
        if (['full', 'collect', 'breaking'].includes(type)) {
            const provider = getProvider();
            const queries = provider.name === 'newsapi' ? await prisma.searchQuery.findMany({ where: { enabled: true } }) : [{ query: '', group: 'ALL' }];
            const known = await prisma.article.findMany({ where: { publishedAt: { gte: new Date(period.from.getTime() - 48 * 3600000) } } });
            const existing = known.map(fromRow);
            const seen = new Set(known.map(a => a.ingestionKey));
            for (const query of queries) {
                await assertLease();
                try {
                    const fetched = await provider.fetchArticles({ ...period, query: query.query, language: 'ko', region: 'KR' });
                    counters.articlesFetched += fetched.length;
                    const normalized: NormalizedArticle[] = [];
                    for (const raw of fetched) {
                        try {
                            if (raw.publishedAt < period.from || raw.publishedAt >= period.to)
                                continue;
                            const article = normalizeArticle({ ...raw, queryGroup: query.group === 'ALL' ? raw.queryGroup : query.group });
                            if (seen.has(article.ingestionKey))
                                continue;
                            seen.add(article.ingestionKey);
                            normalized.push(article);
                        }
                        catch {
                            errors.push('Invalid article skipped');
                        }
                    }
                    const { unique, duplicates } = deduplicateArticles(normalized, existing);
                    for (const a of [...unique, ...duplicates]) {
                        await prisma.article.upsert({ where: { ingestionKey: a.ingestionKey }, create: { ...a, rawPayload: json(a.rawPayload) }, update: {} });
                        counters.articlesInserted++;
                        existing.push(a);
                    }
                    counters.duplicatesRemoved += duplicates.length;
                }
                catch {
                    errors.push(`Collection failed: ${provider.name} / ${query.group}`);
                }
            }
        }
        if (['full', 'process', 'breaking'].includes(type)) {
            const profileRow = await prisma.userProfile.findUniqueOrThrow({ where: { userId: 'grei' } });
            const profile: UserProfile = { id: profileRow.id, interests: profileRow.interests as string[], regions: profileRow.regions as string[], entities: profileRow.entities as string[], businessInterests: profileRow.businessInterests as string[], researchInterests: profileRow.researchInterests as string[], careerInterests: profileRow.careerInterests as string[] };
            const rows = await prisma.article.findMany({ where: { duplicateOfId: null, publishedAt: { gte: period.from, lt: period.to } }, orderBy: { publishedAt: 'asc' } });
            const old = await prisma.event.findMany({ where: { lastSeenAt: { gte: new Date(period.from.getTime() - 48 * 3600000) } }, include: { articles: { include: { article: true } } } });
            const oldMap = new Map(old.map(e => [e.id, e]));
            const clusters = clusterArticles(rows.map(fromRow), old.map(e => ({ id: e.id, representativeTitle: e.representativeTitle, firstSeenAt: e.firstSeenAt, lastSeenAt: e.lastSeenAt, articles: e.articles.map(a => fromRow(a.article)) })));
            const activeIds = new Set(rows.map(a => a.id));
            for (const event of clusters.filter(e => e.articles.some(a => activeIds.has(a.id)))) {
                await assertLease();
                const previous = oldMap.get(event.id);
                const metrics = eventMetrics(event);
                const digest = analysisHash(event, profile);
                const needsAnalysis = previous?.analysisHash !== digest || previous?.analysisStatus !== 'COMPLETED';
                const informationHash = evidenceHash(event);
                const hasNewInformation = !previous?.analysisHash || informationHash !== evidenceHash({ ...event, articles: previous.articles.map(a => fromRow(a.article)) });
                const base = { representativeTitle: event.representativeTitle, firstSeenAt: event.firstSeenAt, lastSeenAt: event.lastSeenAt, articleCount: metrics.articleCount, sourceCount: metrics.sourceCount, officialSourceAvailable: metrics.officialSourceAvailable, isMock: event.articles.every(a => a.provider === 'mock') };
                await prisma.$transaction(async (tx) => {
                    await tx.event.upsert({ where: { id: event.id }, create: { id: event.id, fingerprint: event.id, ...base, secondaryCategories: [], tags: [] }, update: base });
                    for (const a of event.articles)
                        await tx.eventArticle.upsert({ where: { articleId: a.id }, create: { eventId: event.id, articleId: a.id }, update: {} });
                });
                if (!previous)
                    counters.eventsCreated++;
                else if (needsAnalysis || previous.articleCount !== metrics.articleCount)
                    counters.eventsUpdated++;
                try {
                    let analysis;
                    if (needsAnalysis) {
                        await prisma.event.update({ where: { id: event.id }, data: { analysisStatus: 'PROCESSING' } });
                        counters.aiRequests++;
                        analysis = await analyzeEvent(event, profile);
                        counters.aiSuccess++;
                    }
                    else
                        analysis = AnalysisSchema.parse(previous.analysis);
                    const importanceScore = calculateImportanceScore(event, analysis);
                    const relevanceScore = calculateUserRelevance({ ...event, analysis }, profile);
                    const finalScore = calculateFinalScore(importanceScore, relevanceScore);
                    const breakingScore = calculateBreakingScore(event, analysis, relevanceScore, now);
                    await assertLease();
                    await prisma.event.update({ where: { id: event.id }, data: { primaryCategory: analysis.primaryCategory, secondaryCategories: analysis.secondaryCategories, tags: analysis.tags, eventSummary: analysis.headlineSummary, importanceScore, relevanceScore, finalScore, breakingScore, grade: toGrade(finalScore), isOpportunity: analysis.isOpportunity, opportunityReason: analysis.opportunity, analysis: json(analysis), analysisHash: digest, analysisStatus: 'COMPLETED', analysisError: null } });
                    if (type === 'breaking' && isBreakingCandidate(breakingScore, relevanceScore, hasNewInformation, false))
                        await prisma.breakingCandidate.upsert({ where: { eventId_analysisHash: { eventId: event.id, analysisHash: informationHash } }, create: { id: hash(`${event.id}:${informationHash}`), eventId: event.id, analysisHash: informationHash, score: breakingScore }, update: {} });
                }
                catch (error) {
                    if (error instanceof PipelineBusyError)
                        throw error;
                    counters.aiFailed++;
                    errors.push(`Analysis failed: ${event.id.slice(0, 10)}`);
                    await prisma.event.update({ where: { id: event.id }, data: { analysisStatus: 'FAILED', analysisError: 'Analysis failed; retry Process after checking provider configuration.' } });
                }
            }
        }
        if (['full', 'generate-ark'].includes(type)) {
            if (errors.length)
                throw new Error('Pipeline incomplete; existing published Ark preserved');
            const unfinished = await prisma.event.count({ where: { lastSeenAt: { gte: period.from, lt: period.to }, analysisStatus: { not: 'COMPLETED' } } });
            if (unfinished)
                throw new Error('Unfinished event analysis; retry Process before publishing');
            await assertLease();
            const candidates = await prisma.event.findMany({ where: { analysisStatus: 'COMPLETED', lastSeenAt: { gte: period.from, lt: period.to } }, include: { articles: { include: { article: true } } } });
            const selected = selectArkEvents(candidates.map(scoredRow), 10, period.to);
            // Immutable daily snapshot: reruns cannot replace an already published report.
            await prisma.$transaction(async (tx) => {
                const exists = await tx.dailyArk.findUnique({ where: { arkDate: date } });
                if (exists)
                    return;
                const id = hash(`ark:${date}`);
                await tx.dailyArk.create({ data: { id, arkDate: date, periodStart: period.from, periodEnd: period.to, generatedAt: now, publishedAt: now, status: 'PUBLISHED', eventCount: selected.length, overview: `지난 24시간, 선별 기준을 통과한 ${selected.length}개의 변화`, isMock: (process.env.NEWS_PROVIDER ?? 'mock') === 'mock', items: { create: selected.map((event, i) => ({ id: hash(`${id}:${event.id}`), eventId: event.id, rank: i + 1, finalScore: event.finalScore, snapshot: json(publicEvent(event)) })) } } });
                counters.arkGenerated = true;
            });
        }
        await prisma.pipelineLog.update({ where: { id: owner }, data: { ...counters, status: errors.length ? 'PARTIAL' : 'COMPLETED', finishedAt: new Date(), errorMessage: errors.length ? errors.join('; ') : null } });
        return { id: owner, date, ...counters, status: errors.length ? 'PARTIAL' : 'COMPLETED' };
    }
    catch (error) {
        await prisma.pipelineLog.updateMany({ where: { id: owner }, data: { ...counters, status: 'FAILED', finishedAt: new Date(), errorMessage: [...errors, error instanceof PipelineBusyError ? error.message : 'Pipeline failed. Check database and provider configuration.'].join('; ') } }).catch(() => { });
        throw error;
    }
    finally {
        clearInterval(heartbeat);
        await prisma.pipelineLock.deleteMany({ where: { id: 'pipeline', owner } });
    }
}
export function scoredRow(row: DBEvent & {
    articles: {
        article: Article;
    }[];
}): ScoredEvent {
    return { ...row, primaryCategory: row.primaryCategory as Category, analysis: AnalysisSchema.parse(row.analysis), analysisHash: row.analysisHash!, articles: row.articles.map(a => fromRow(a.article)) };
}
export const generateDailyArk = (date?: string) => runPipeline('full', date);
