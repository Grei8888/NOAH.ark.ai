export type NewsCategory =
  | "POLICY"
  | "REAL_ESTATE"
  | "FINANCE"
  | "AI_TECH"
  | "NEURO_EDU"
  | "REGIONAL"
  | "OTHER";

export type Grade = "A+" | "A" | "B" | "C" | "D";

export type SourceType =
  | "NEWS_MEDIA"
  | "GOVERNMENT"
  | "PUBLIC_AGENCY"
  | "CORPORATE"
  | "RESEARCH"
  | "OTHER";

export interface RawArticle {
  id: string;
  provider: string;
  sourceName: string;
  sourceDomain: string;
  sourceType: SourceType;
  title: string;
  description: string;
  contentSnippet: string;
  url: string;
  publishedAt: string;
  queryGroup: string;
}

export interface EventSource {
  sourceName: string;
  sourceType: SourceType;
  title: string;
  url: string;
  publishedAt: string;
}

export interface NoahEvent {
  id: string;
  representativeTitle: string;
  primaryCategory: NewsCategory;
  secondaryCategories: NewsCategory[];
  tags: string[];
  headlineSummary: string;
  keyPoints: string[];
  whyItMatters: string;
  userImplication: string;
  opportunity?: string;
  risk?: string;
  followUp: string[];
  importanceScore: number;
  relevanceScore: number;
  finalScore: number;
  grade: Grade;
  isOpportunity: boolean;
  officialSourceAvailable: boolean;
  sourceCount: number;
  articleCount: number;
  sources: EventSource[];
  firstSeenAt: string;
  lastSeenAt: string;
}
