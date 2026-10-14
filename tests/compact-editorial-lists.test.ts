import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const articles = readFileSync("components/home/NewsDiscoveryPanel.tsx", "utf8");
const sources = readFileSync("components/home/PublicSourceDesk.tsx", "utf8");
const css = readFileSync("app/globals.css", "utf8");

describe("compact editorial lists", () => {
  it("numbers press results by visible filtered order, never as an importance ranking", () => {
    expect(articles).toContain("filtered.map((item, index) =>");
    expect(articles).toContain('className="newsDiscoveryRank"');
    expect(articles).toContain('String(index + 1).padStart(2, "0")');
    expect(articles).toContain("중요도 순위가 아닙니다");
    expect(articles).toContain('className="newsDiscoveryBody"');
  });
  it("makes government notices unmistakably different from publisher articles", () => {
    expect(articles).toContain("언론 기사");
    expect(sources).toContain('"정부 공고" : "정부 보도"');
    expect(sources).toContain("sourceNewsItem--");
    expect(sources).toContain("sourceDateMobile");
    expect(css).toContain(".sourceNewsItem--press .sourceKindBadge");
    expect(css).toContain(".newsSourceKind");
  });
  it("keeps 44px tap targets and an opaque mobile sticky tab bar", () => {
    expect(css).toContain("/* Editorial list rhythm v1:");
    expect(css).toContain(".appShell--compactRail .newsAiMobileTabs button");
    expect(css).toContain("background: #fff;");
    expect(css).toContain(".appShell--compactRail .newsAiStories .newsDiscoveryItem");
    expect(css).toContain("min-height: 44px;");
    expect(css).toContain(".appShell--compactRail .sourceNewsItem");
  });
});
