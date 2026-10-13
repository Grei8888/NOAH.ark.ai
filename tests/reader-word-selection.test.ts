import { describe, expect, it } from "vitest";
import { readerWordTokens, termExplanationQuestion } from "@/lib/news/reader-word-selection";
describe("reader word bubble selection", () => {
  it("segments existing headlines without changing text or fetching article HTML", () => {
    const title = "정책자금 지원, 기준금리는 어떻게 되나?";
    const pieces = readerWordTokens(title);
    expect(pieces.map(x=>x.text).join("")).toBe(title);
    expect(pieces.filter(x=>x.word).map(x=>x.text)).toContain("정책자금");
  });
  it("preserves user pasted excerpt only as a bounded local preview", () => {
    expect(readerWordTokens("a".repeat(800)).map(x => x.text).join("").length).toBe(500);
    expect(readerWordTokens("")).toEqual([]);
  });
  it("asks for an explanation rather than inventing a newspaper quote", () => {
    const p = termExplanationQuestion("금리");
    expect(p).toContain("금리");
    expect(p).toContain("기사 내용을 읽은 것처럼 단정하지");
    expect(p.length).toBeLessThan(380);
  });
});
