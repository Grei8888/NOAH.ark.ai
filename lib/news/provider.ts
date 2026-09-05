import type { RawArticle } from "@/types/news";

export interface NewsProvider {
  name: string;
  fetchArticles(params: {
    query: string;
    from: Date;
    to: Date;
    language?: string;
    region?: string;
  }): Promise<RawArticle[]>;
}
