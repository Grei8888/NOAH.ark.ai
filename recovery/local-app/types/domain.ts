import type { Analysis } from '@/lib/ai/schemas';
export const CATEGORIES = ['POLICY', 'REAL_ESTATE', 'FINANCE', 'AI_TECH', 'NEURO_EDU', 'REGIONAL', 'OTHER'] as const;
export type Category = typeof CATEGORIES[number];
export type SourceType = 'NEWS_MEDIA' | 'GOVERNMENT' | 'PUBLIC_AGENCY' | 'CORPORATE' | 'RESEARCH' | 'OTHER';
export interface RawArticle {
    provider: string;
    sourceName: string;
    sourceDomain: string;
    sourceType: SourceType;
    author?: string;
    title: string;
    description: string;
    contentSnippet: string;
    url: string;
    imageUrl?: string;
    publishedAt: Date;
    language: string;
    country: string;
    queryGroup: string;
    rawPayload: Record<string, string | number | boolean>;
}
export interface NormalizedArticle extends RawArticle {
    id: string;
    ingestionKey: string;
    canonicalUrl: string;
    normalizedTitle: string;
    newsLabel?: string;
    duplicateOfId?: string | null;
}
export interface UserProfile {
    id: string;
    interests: string[];
    regions: string[];
    entities: string[];
    businessInterests: string[];
    researchInterests: string[];
    careerInterests: string[];
}
export interface EventCandidate {
    id: string;
    representativeTitle: string;
    articles: NormalizedArticle[];
    firstSeenAt: Date;
    lastSeenAt: Date;
}
export interface ScoredEvent extends EventCandidate {
    primaryCategory: Category;
    analysis: Analysis;
    importanceScore: number;
    relevanceScore: number;
    finalScore: number;
    breakingScore: number;
    grade: string;
    articleCount: number;
    sourceCount: number;
    officialSourceAvailable: boolean;
    analysisHash: string;
    isMock: boolean;
}
export interface PublicEvent {
    id: string;
    representativeTitle: string;
    primaryCategory: Category;
    grade: string;
    isMock: boolean;
    articleCount: number;
    sourceCount: number;
    officialSourceAvailable: boolean;
    firstSeenAt: string;
    lastSeenAt: string;
    analysis: Omit<Analysis, 'userRelevance' | 'userImplication'>;
    sources: {
        id: string;
        title: string;
        url: string;
        sourceName: string;
        sourceType: string;
        publishedAt: string;
    }[];
}
