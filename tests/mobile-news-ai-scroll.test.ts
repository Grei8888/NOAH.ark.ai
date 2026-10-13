import { describe, expect, it } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  NewsDiscoveryPanel, mobileNewsScrollDestination,
} from "@/components/home/NewsDiscoveryPanel";

describe("iPhone news list to AI question navigation", () => {
  it("scrolls a selected article to the actual question field (not merely the AI tab heading)", () => {
    expect(mobileNewsScrollDestination("ai", true)).toBe("question");
    expect(mobileNewsScrollDestination("ai", false)).toBe("reader");
  });
  it("returns readers to the tab navigation when they switch back to the article list", () => {
    expect(mobileNewsScrollDestination("articles", true)).toBe("tabs");
    expect(mobileNewsScrollDestination("articles", false)).toBe("tabs");
  });
  it("has both real mobile tabs and a question textarea target even when AI is off", () => {
    const html=renderToStaticMarkup(createElement(NewsDiscoveryPanel,{
      readerLabAvailable:false,readerModelReady:false,enabled:false,
    }));
    expect(html).toContain("뉴스 목록");
    expect(html).toContain("AI 질문하기");
    expect(html).toContain('id="newsAiQuestion"');
    expect(html).toContain('data-mobile-active="false"');
    expect(html).toContain("AI 연결 대기");
  });
});
