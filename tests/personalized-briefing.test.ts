import { describe, expect, it } from "vitest";
import {
  curateFromHeadlines, likelySameHeadlineEvent, requiredSearchTopics,
} from "@/lib/news/personalized-briefing";
import type { NewsSearchItem, NewsSearchSnapshot, NewsSearchTopic } from "@/lib/news/news-search-contract";
const now = new Date("2026-10-13T04:00:00Z");
function story(title: string, sourceName: string, id: string, iso = "2026-10-12T10:00:00Z"): NewsSearchItem {
  return { title, sourceName, url: `https://press.example.com/${id}`, publishedAt: iso };
}
function snap(topic: NewsSearchTopic, items: NewsSearchItem[]): NewsSearchSnapshot {
  return { topic, items, retrievedAt: now.toISOString(), provider: "SerpApi / Google News" };
}
describe("transparent real-headline personalized briefing", () => {
  it("does not fake a briefing when the user hasn't chosen interests", () => {
    expect(requiredSearchTopics([])).toEqual([]);
    expect(curateFromHeadlines([snap("startup", [story("창업 지원 확대", "신문A", "1")])], [], now)).toEqual([]);
  });
  it("maps stable personal interests onto ONLY existing fixed search queries", () => {
    expect(requiredSearchTopics(["startup", "funding"])).toEqual(["startup", "finance", "policy"]);
    expect(requiredSearchTopics(["technology", "global", "technology"])).toEqual(["startup", "economy"]);
  });
  it("ranks dated interest-matching titles and excludes stale/unrelated ones", () => {
    const rows = curateFromHeadlines([
      snap("startup", [
        story("창업 소상공인 지원금 신청 소식", "언론A", "1"),
        story("축구 경기와 시즌 순위 발표", "언론B", "2"),
        story("스타트업 사업화 지원사업 2023 모집", "언론C", "3", "2023-01-02T10:00:00Z"),
        story("소상공인 투자 지원 정책 변화", "언론D", "4", "2026-10-12T09:00:00Z"),
      ]),
    ], ["startup"], now);
    expect(rows.every(x => x.matchTopics.includes("startup"))).toBe(true);
    expect(rows).toHaveLength(2);
    expect(rows.some(x => x.title.includes("축구"))).toBe(false);
    expect(rows.some(x => x.title.includes("2023"))).toBe(false);
    expect(rows[0].rationale).toContain("창업·소상공인 관심사와 제목 일치");
    expect(rows[0].rationale.some(s => s.includes("최근"))).toBe(true);
  });
  it("deduplicates identical URLs across category searches without increasing publisher counts", () => {
    const a = story("정책자금 소상공인 금융 지원 공고", "언론A", "a");
    const rows = curateFromHeadlines([
      snap("finance", [a]), snap("policy", [a]),
    ], ["funding"], now);
    expect(rows).toHaveLength(1);
    expect(rows[0].sources).toHaveLength(1);
  });
  it("conservatively groups matching event headlines while keeping distinct originals", () => {
    const headline = "금융 정책자금 소상공인 신규 대출 지원 확대";
    expect(likelySameHeadlineEvent(headline, headline)).toBe(true);
    expect(likelySameHeadlineEvent(headline, "소상공인 소비 증가 지역 경기 반등")).toBe(false);
    const rows = curateFromHeadlines([
      snap("finance", [story(headline, "언론A", "a"),
        story("[속보] 금융 정책자금 소상공인 신규 대출 지원 확대", "언론B", "b")]),
    ], ["funding"], now);
    expect(rows).toHaveLength(1);
    expect(rows[0].sources).toHaveLength(2);
    expect(rows[0].rationale.some(x => x.includes("독립 취재 여부 미검증"))).toBe(true);
    expect(rows[0].sources.map(s => s.url)).toEqual([
      "https://press.example.com/a", "https://press.example.com/b",
    ]);
  });
  it("never labels all historical, undated or broad topic news as important fact", () => {
    const x = curateFromHeadlines([
      snap("economy", [story("수출 해외 무역 협력 성과 발표", "언론A", "a", ""),
        story("미래 수출 해외 스타트업 창업 지원", "언론B", "b", "2026-04-12T10:00:00Z")]),
    ], ["global"], now);
    expect(x).toHaveLength(1);
    expect(x[0].newestAt).toBeNull();
    expect(x[0].rationale).toContain("발행일 확인 필요");
    expect(x[0]).not.toHaveProperty("aiSummary");
  });
  it("marks older than 14 days as outdated rather than labeling it today", () => {
    const rows = curateFromHeadlines([snap("finance", [story("정책자금 금융 지원 제도 확대", "경제신문", "old", "2026-09-25T10:00:00Z")])], ["funding"], now);
    expect(rows).toHaveLength(1);
    expect(rows[0].rationale.some(line => line.includes("최신 정보 확인 필요"))).toBe(true);
  });
  it("caps list to five by default", () => {
    const rows = Array.from({ length: 12 }, (_, i) =>
      story(`창업 소상공인 지원 모집 ${i + 10}`, `매체${i}`, String(i)));
    expect(curateFromHeadlines([snap("startup", rows)], ["startup"], now)).toHaveLength(5);
  });
});
