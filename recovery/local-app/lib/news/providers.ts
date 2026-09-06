import { XMLParser } from 'fast-xml-parser';
import { z } from 'zod';
import type { RawArticle, SourceType } from '@/types/domain';
import { mockArticles } from './mock';
import { normalizeUrl } from './normalize';
export interface FetchParams {
    query: string;
    from: Date;
    to: Date;
    language?: string;
    region?: string;
}
export interface NewsProvider {
    name: string;
    fetchArticles(params: FetchParams): Promise<RawArticle[]>;
}
export class MockNewsProvider implements NewsProvider {
    name = 'mock';
    async fetchArticles({ from, to }: FetchParams) { return mockArticles(from, to); }
}
const NewsResponse = z.object({ status: z.literal('ok'), totalResults: z.number(), articles: z.array(z.object({
        source: z.object({ name: z.string().nullable() }), author: z.string().nullable().optional(), title: z.string(), description: z.string().nullable(), url: z.string(), publishedAt: z.string(),
    })) });
export class NewsAPIProvider implements NewsProvider {
    name = 'newsapi';
    async fetchArticles(p: FetchParams): Promise<RawArticle[]> {
        if (!process.env.NEWS_API_KEY)
            throw new Error('NEWS_API_KEY is required');
        const url = new URL('https://newsapi.org/v2/everything');
        url.searchParams.set('q', p.query);
        url.searchParams.set('from', p.from.toISOString());
        url.searchParams.set('to', p.to.toISOString());
        url.searchParams.set('pageSize', '100');
        url.searchParams.set('sortBy', 'publishedAt');
        // NewsAPI does not support Korean in its language filter. Query Korean text without that filter.
        if (p.language && p.language !== 'ko')
            url.searchParams.set('language', p.language);
        const response = await fetch(url, { headers: { 'X-Api-Key': process.env.NEWS_API_KEY }, signal: AbortSignal.timeout(20000), cache: 'no-store' });
        if (!response.ok)
            throw new Error(`NewsAPI HTTP ${response.status}`);
        const data = NewsResponse.parse(await response.json());
        if (data.totalResults > 100)
            throw new Error('NewsAPI query exceeded 100 results; narrow the query/window to avoid incomplete publication');
        return data.articles.filter(a => a.title !== '[Removed]').map(a => ({ provider: this.name, sourceName: a.source.name ?? 'Unknown', sourceDomain: new URL(a.url).hostname, sourceType: 'NEWS_MEDIA', author: a.author ?? undefined, title: a.title, description: (a.description ?? '').slice(0, 500), contentSnippet: '', url: normalizeUrl(a.url), publishedAt: new Date(a.publishedAt), language: p.language ?? 'ko', country: p.region ?? 'KR', queryGroup: 'OTHER', rawPayload: { source: a.source.name ?? 'Unknown' } }));
    }
}
const FeedEntry = z.object({ title: z.union([z.string(), z.number()]).transform(String), link: z.string(), pubDate: z.string().optional(), published: z.string().optional(), description: z.string().optional() }).passthrough();
export class RSSProvider implements NewsProvider {
    name = 'rss';
    constructor(private feeds: {
        url: string;
        name: string;
        sourceType: SourceType;
    }[]) { }
    async fetchArticles(p: FetchParams): Promise<RawArticle[]> {
        const articles: RawArticle[] = [];
        for (const feed of this.feeds) {
            const url = new URL(feed.url);
            if (url.protocol !== 'https:')
                throw new Error('RSS feeds must use HTTPS');
            const response = await fetch(url, { signal: AbortSignal.timeout(20000), cache: 'no-store' });
            if (!response.ok)
                throw new Error(`RSS HTTP ${response.status}`);
            const xml = await response.text();
            if (xml.length > 2000000)
                throw new Error('RSS response too large');
            const parsed = new XMLParser({ processEntities: false }).parse(xml);
            const items = parsed?.rss?.channel?.item ?? [];
            for (const item of Array.isArray(items) ? items : [items]) {
                const result = FeedEntry.safeParse(item);
                if (!result.success)
                    continue;
                const a = result.data;
                const publishedAt = new Date(a.pubDate ?? a.published ?? '');
                if (!Number.isFinite(publishedAt.getTime()) || publishedAt < p.from || publishedAt >= p.to)
                    continue;
                const description = (a.description ?? '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').slice(0, 500);
                const canonical = normalizeUrl(a.link);
                // An official feed is trusted only for links on its own origin.
                const sourceType = new URL(canonical).hostname === url.hostname ? feed.sourceType : 'NEWS_MEDIA';
                articles.push({ provider: this.name, sourceName: feed.name, sourceDomain: new URL(canonical).hostname, sourceType, title: a.title, description, contentSnippet: '', url: canonical, publishedAt, language: 'ko', country: 'KR', queryGroup: 'OTHER', rawPayload: { feed: feed.url } });
            }
        }
        return articles;
    }
}
export class GovernmentProvider extends RSSProvider {
    override name = 'government';
}
export function getProvider(): NewsProvider {
    const name = process.env.NEWS_PROVIDER ?? 'mock';
    if (name === 'mock')
        return new MockNewsProvider();
    if (name === 'newsapi')
        return new NewsAPIProvider();
    if (name === 'rss' || name === 'government') {
        const feeds = (process.env.RSS_FEEDS ?? '').split(',').map(s => s.trim()).filter(Boolean).map(url => ({ url, name: new URL(url).hostname, sourceType: (name === 'government' ? 'GOVERNMENT' : 'NEWS_MEDIA') as SourceType }));
        if (!feeds.length)
            throw new Error('RSS_FEEDS is required');
        return name === 'government' ? new GovernmentProvider(feeds) : new RSSProvider(feeds);
    }
    throw new Error('Unknown NEWS_PROVIDER');
}
