import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const shell = readFileSync("components/home/AppShell.tsx", "utf8");
const desk = readFileSync("components/home/PublicSourceDesk.tsx", "utf8");
const css = readFileSync("app/globals.css", "utf8");

describe("shared beta navigation layout", () => {
  it("keeps Home, Discover, Startup, Saved and My NOAH on the same wide-shell rule", () => {
    expect(desk).toContain("compactRail={newsSearchEnabled}");
    expect(desk).not.toContain("compactRail={newsSearchEnabled &&");
    expect(shell).toContain('className={compactRail ? "appShell appShell--compactRail" : "appShell"}');
    for (const view of ["home", "discover", "startup", "saved", "my"]) {
      expect(shell).toContain('id: "' + view + '"');
    }
  });
  it("uses identical Korean labels on desktop and mobile with a touch-first layout", () => {
    for (const label of ["홈", "뉴스", "사업기회", "저장", "마이"]) {
      expect(shell).toContain('label: "' + label + '"');
    }
    expect(shell.split("<span>{item.label}</span>").length - 1).toBe(2);
    expect(shell).not.toContain("mobileLabel");
    expect(css).toMatch(/@media \(max-width: 767px\)[\s\S]*?\.appShell--compactRail \.mobileNav/);
    expect(css).toContain("grid-template-columns: repeat(5, minmax(0, 1fr))");
    expect(css).toContain(".appShell--compactRail .newsAiMobileTabs");
    expect(css).toContain(".appShell--compactRail .businessSupportInputs");
  });
});
