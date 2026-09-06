import type { EventCandidate, NormalizedArticle } from '@/types/domain';
import { hash, normalizeTitle } from './normalize';
const ENTITIES = ['전북특별자치도', '전북', '전주시', 'LH', '국토교통부', '중소벤처기업부', '고용노동부', '과학기술정보통신부', '법무부', '출입국', '한국보건산업진흥원', '창업진흥원', 'KOTRA', '서울', '광주', '전남', 'Physical AI'];
function action(title: string) { return title.match(/모집|공고|개정|개편|발표|시행|선정|취소|출시|안내/)?.[0] ?? ''; }
function tokens(title: string) { return new Set(normalizeTitle(title).split(/[^\p{L}\p{N}]+/u).filter(t => t.length > 1)); }
export function titleSimilarity(a: string, b: string) {
    const left = tokens(a);
    const right = tokens(b);
    const intersection = [...left].filter(t => right.has(t)).length;
    return intersection / Math.max(1, new Set([...left, ...right]).size);
}
export function sameEvent(article: NormalizedArticle, event: EventCandidate) {
    if (Math.abs(article.publishedAt.getTime() - event.firstSeenAt.getTime()) > 48 * 3600000)
        return false;
    const a = action(article.title);
    const b = action(event.representativeTitle);
    if (a && b && a !== b && !(['공고', '모집'].includes(a) && ['공고', '모집'].includes(b)))
        return false;
    const similarity = titleSimilarity(article.title, event.representativeTitle);
    const articleContext = `${article.title} ${article.description}`;
    const eventContext = `${event.representativeTitle} ${event.articles[0]?.description ?? ''}`;
    const sharedEntity = ENTITIES.some(e => articleContext.includes(e) && eventContext.includes(e));
    return similarity >= 0.78 || (similarity >= 0.52 && sharedEntity);
}
export function clusterArticles(articles: NormalizedArticle[], existing: EventCandidate[] = []): EventCandidate[] {
    const events = existing.map(e => ({ ...e, articles: [...e.articles] }));
    for (const article of [...articles].sort((a, b) => a.publishedAt.getTime() - b.publishedAt.getTime() || a.id.localeCompare(b.id))) {
        if (article.duplicateOfId || events.some(e => e.articles.some(a => a.id === article.id)))
            continue;
        const event = events.find(e => sameEvent(article, e));
        if (event) {
            event.articles.push(article);
            if (article.publishedAt > event.lastSeenAt)
                event.lastSeenAt = article.publishedAt;
            if (article.publishedAt < event.firstSeenAt)
                event.firstSeenAt = article.publishedAt;
        }
        else
            events.push({ id: hash(`event:${article.id}`), representativeTitle: article.title, articles: [article], firstSeenAt: article.publishedAt, lastSeenAt: article.publishedAt });
    }
    return events;
}
