import { describe, expect, it } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { NewsInlineCompanion } from "@/components/home/NewsInlineCompanion";
import { mobileNewsScrollDestination } from "@/components/home/NewsDiscoveryPanel";
import { READER_MODES } from "@/lib/news/reader-companion";

const selected = {
  topic: "economy" as const,
  item: {
    title: "한국은행 총재 기준금리 인상 가능성",
    sourceName: "테스트 언론사",
    url: "https://publisher.example/news/first",
    publishedAt: "2026-10-12T07:00:00Z",
  },
};

describe("NOAH article-first mobile reading partner v1", () => {
  it("places the original publisher headline and link ABOVE the AI modes and textarea", () => {
    const html = renderToStaticMarkup(createElement(NewsInlineCompanion, {
      selected, modelReady: false, labAvailable: false,
    }));
    const title = html.indexOf("한국은행 총재 기준금리 인상 가능성");
    const original = html.indexOf("기사 원문 직접 읽기");
    const modes = html.indexOf("용어 설명");
    const input = html.indexOf('id="newsAiQuestion"');
    expect(title).toBeGreaterThan(-1);
    expect(original).toBeGreaterThan(title);
    expect(modes).toBeGreaterThan(original);
    expect(input).toBeGreaterThan(modes);
    expect(html).toContain("https://publisher.example/news/first");
    expect(html).toContain("이 기사에 대해 질문하기");
    expect(html).not.toContain("읽고, 이해하고, 질문하기");
    expect(html).not.toContain("원문을 먼저 읽어도 좋고");
  });

  it("still shows four meaningful modes on one short input panel", () => {
    const html = renderToStaticMarkup(createElement(NewsInlineCompanion, {
      selected, modelReady: false, labAvailable: false,
    }));
    expect(READER_MODES.map(m => m.label)).toEqual([
      "용어 설명", "배경 이해", "비판적 독해", "다른 관점",
    ]);
    for (const {label} of READER_MODES) expect(html).toContain(label);
    expect(html).toContain('rows="3"');
    expect(html).toContain("AI 답변 연결 전");
    expect(html).toContain('disabled=""');
  });

  it("scrolls to the publisher article first, not a textarea below the fold", () => {
    expect(mobileNewsScrollDestination("ai", true)).toBe("article");
    expect(mobileNewsScrollDestination("ai", false)).toBe("reader");
    expect(mobileNewsScrollDestination("articles", true)).toBe("tabs");
  });
});
