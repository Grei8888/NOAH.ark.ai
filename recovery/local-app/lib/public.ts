import type { PublicEvent, ScoredEvent } from '@/types/domain';
export function publicEvent(event: ScoredEvent): PublicEvent {
    const { userRelevance: _relevance, userImplication: _implication, ...analysis } = event.analysis;
    void _relevance;
    void _implication;
    return { id: event.id, representativeTitle: event.representativeTitle, primaryCategory: event.primaryCategory, grade: event.grade,
        isMock: event.isMock, articleCount: event.articleCount, sourceCount: event.sourceCount, officialSourceAvailable: event.officialSourceAvailable,
        firstSeenAt: event.firstSeenAt.toISOString(), lastSeenAt: event.lastSeenAt.toISOString(), analysis,
        sources: event.articles.map(a => ({ id: a.id, title: a.title, url: a.canonicalUrl, sourceName: a.sourceName, sourceType: a.sourceType, publishedAt: a.publishedAt.toISOString() })) };
}
