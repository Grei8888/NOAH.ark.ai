import { createHash } from 'node:crypto';
import type { RawArticle, NormalizedArticle } from '@/types/domain';
export const hash = (value: string) => createHash('sha256').update(value).digest('hex');
export function normalizeUrl(input: string): string {
    const url = new URL(input);
    if (!['https:', 'http:'].includes(url.protocol))
        throw new Error('Unsupported article URL');
    if (url.username || url.password)
        throw new Error('Credentials in article URL');
    url.hash = '';
    for (const key of [...url.searchParams.keys()])
        if (/^utm_/i.test(key) || /^(fbclid|gclid)$/i.test(key))
            url.searchParams.delete(key);
    url.searchParams.sort();
    return url.toString();
}
export function normalizeTitle(title: string): string {
    return title.normalize('NFKC').replace(/\s*[-|–]\s*(연합뉴스|전자신문|한국경제|매일경제|뉴스1|뉴시스)\s*$/, '')
        .replace(/[\[\]【】〈〉]/g, ' ').replace(/([!?.,])\1+/g, '$1').replace(/\s+/g, ' ').trim().toLowerCase();
}
export function normalizeArticle(raw: RawArticle): NormalizedArticle {
    const canonicalUrl = normalizeUrl(raw.url);
    const normalizedTitle = normalizeTitle(raw.title);
    if (!normalizedTitle || !Number.isFinite(raw.publishedAt.getTime()))
        throw new Error('Invalid article');
    const ingestionKey = hash(`${raw.provider}|${raw.url}|${raw.title}`);
    return { ...raw, description: raw.description.slice(0, 500), contentSnippet: raw.contentSnippet.slice(0, 700),
        id: ingestionKey, ingestionKey, canonicalUrl, normalizedTitle,
        newsLabel: raw.title.match(/속보|단독|1보|2보|종합/)?.[0] };
}
