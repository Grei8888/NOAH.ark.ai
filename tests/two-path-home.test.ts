import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const desk = readFileSync("components/home/PublicSourceDesk.tsx", "utf8");
const gateway = readFileSync("components/home/HomeGateway.tsx", "utf8");
const gatewayPage = readFileSync("components/home/HomeGatewayPage.tsx", "utf8");
const route = readFileSync("app/page.tsx", "utf8");
const discovery = readFileSync("components/home/NewsDiscoveryPanel.tsx", "utf8");
const css = readFileSync("app/globals.css", "utf8");

describe("two-area NOAH beta information architecture", () => {
  it("home only offers two working entries; no RSS request is made in that route", () => {
    expect(route).toContain('if (validView === "home") return <HomeGatewayPage');
    expect(route.indexOf('if (validView === "home")')).toBeLessThan(route.indexOf("await getOfficialSourceSnapshot()"));
    expect(gateway).toContain('href="/?view=discover"');
    expect(gateway).toContain('href="/?view=startup"');
    expect(gatewayPage).not.toContain("getOfficialSourceSnapshot");
    expect(gatewayPage).toContain("<HomeGateway />");
  });
  it("keeps personalized briefing and reader AI in news, not in business", () => {
    expect(desk).toContain('{view === "discover" && (');
    expect(desk).toContain("<NewsDiscoveryPanel");
    expect(desk).toContain("showBriefing focusTopics={focusTopics}");
    expect(discovery).toContain("<MyBriefingPanel");
    expect(discovery).toContain("<NewsInlineCompanion");
    expect(discovery).not.toContain("<BusinessOpportunityPanel");
  });
  it("pairs business opportunities with official policy RSS and preserves saved material", () => {
    expect(desk).toContain('{view === "startup" && (');
    expect(desk).toContain("<BusinessOpportunityPanel enabled={businessSupportEnabled} />");
    expect(desk).toContain('"officialPolicyGroup"');
    expect(desk).toContain("정부 정책 · 공식자료");
    expect(desk).toContain('view === "startup" || view === "saved" || view === "my"');
    expect(desk).toContain("changeSaved(s.url)");
    expect(desk).toContain("currentSnapshot.items");
    expect(css).toContain(".officialPolicyGroup");
  });
  it("has distinct responsive gateway choices on mobile and desktop", () => {
    expect(css).toContain(".homeGatewayGrid");
    expect(css).toContain("grid-template-columns: repeat(2, minmax(0,1fr))");
    expect(css).toContain("grid-template-columns: minmax(0,1fr)");
    expect(css).toContain(".appShell--compactRail:has(.homeGateway)");
  });
});
