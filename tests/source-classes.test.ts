import { describe, expect, it } from "vitest";
import { matchesSourceFilter, NOAH_SOURCE_FILTERS, sourceClassFromOrigin } from "@/lib/news/source-classes";

describe("future NOAH source-class taxonomy is independent of topics", () => {
  it("defines four display labels without blending media and expert claims", () => {
    expect(NOAH_SOURCE_FILTERS.map((f) => f.label)).toEqual(["전체", "기사", "정책소식", "정보원 소식"]);
  });
  it("classifies actual source origins, not the tone or subject of the headline", () => {
    expect(sourceClassFromOrigin("NEWS_MEDIA")).toBe("article");
    expect(sourceClassFromOrigin("GOVERNMENT")).toBe("policy");
    expect(sourceClassFromOrigin("EXPERT_COMMENTARY")).toBe("informant");
  });
  it("shows every class in all and only matching class in a targeted filter", () => {
    for (const klass of ["article", "policy", "informant"] as const) {
      expect(matchesSourceFilter(klass, "all")).toBe(true);
      expect(matchesSourceFilter(klass, klass)).toBe(true);
      for (const other of ["article", "policy", "informant"] as const) {
        if (other !== klass) expect(matchesSourceFilter(klass, other)).toBe(false);
      }
    }
  });
});
