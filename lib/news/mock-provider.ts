import type { NewsProvider } from "./provider";
import type { RawArticle } from "@/types/news";

const MOCK_ARTICLES: RawArticle[] = [
  {
    id: "a1",
    provider: "mock",
    sourceName: "정책브리핑",
    sourceDomain: "example.go.kr",
    sourceType: "GOVERNMENT",
    title: "정부, 피지컬 AI 실증·산업화 지원계획 발표",
    description: "산업 현장의 AI·로봇 실증 확대를 위한 신규 지원계획이 발표됐다.",
    contentSnippet: "정부는 피지컬 AI 실증, 기업 참여, 지역 거점 확충을 포함한 지원 방향을 공개했다.",
    url: "https://example.go.kr/physical-ai?utm_source=mock",
    publishedAt: "2026-09-05T00:20:00+09:00",
    queryGroup: "AI_TECH"
  },
  {
    id: "a2",
    provider: "mock",
    sourceName: "테크데일리",
    sourceDomain: "tech.example.com",
    sourceType: "NEWS_MEDIA",
    title: "피지컬 AI 실증사업 본격화…지역 산업계 참여 주목",
    description: "정부 실증사업 발표 이후 지역 기업의 참여 가능성이 주목된다.",
    contentSnippet: "산업계는 실증 인프라와 기업 모집 조건에 관심을 보이고 있다.",
    url: "https://tech.example.com/physical-ai",
    publishedAt: "2026-09-05T00:38:00+09:00",
    queryGroup: "AI_TECH"
  },
  {
    id: "a3",
    provider: "mock",
    sourceName: "전북경제",
    sourceDomain: "jb.example.com",
    sourceType: "NEWS_MEDIA",
    title: "전북, 피지컬 AI 실증 거점 유치전 가세",
    description: "전북이 피지컬 AI 실증 거점 유치를 위한 대응에 나섰다.",
    contentSnippet: "지역 산업·R&D 기반과 연계한 실증 거점 논의가 시작됐다.",
    url: "https://jb.example.com/physical-ai",
    publishedAt: "2026-09-05T01:05:00+09:00",
    queryGroup: "REGIONAL"
  }
];

export class MockNewsProvider implements NewsProvider {
  name = "mock";

  async fetchArticles(): Promise<RawArticle[]> {
    return MOCK_ARTICLES;
  }
}
