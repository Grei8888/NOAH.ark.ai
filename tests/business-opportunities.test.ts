import { describe, expect, it } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  OPPORTUNITY_TABS, visibleVerifiedRnd, isRndAnnouncement,
  normalizeG2BRows, matchesOpportunityKeyword,
} from "@/lib/business/opportunities";
import { BusinessOpportunityPanel } from "@/components/home/BusinessOpportunityPanel";

describe("MY BUSINESS public opportunities",()=>{
  it("has three distinct support, R&D and procurement tabs",()=>{
    expect(OPPORTUNITY_TABS.map(x=>x.id)).toEqual(["support","rnd","b2g"]);
    const html=renderToStaticMarkup(createElement(BusinessOpportunityPanel,{enabled:false}));
    expect(html).toContain("내 사업에 맞는 공공사업 기회");
    expect(html).toContain("지원사업");
    expect(html).toContain("국가 R&amp;D");
    expect(html).toContain("공공입찰 B2G");
    expect(html).toContain('role="tablist"');
  });
  it("shows a verified disaster R&D notice only while open",()=>{
    const inOctober=visibleVerifiedRnd(new Date("2026-10-14T02:00:00Z"));
    expect(inOctober.map(x=>x.id)).toContain("iris-2026-024357");
    const n=inOctober.find(x=>x.id==="iris-2026-024357")!;
    expect(n.url).toBe("https://www.iris.go.kr/contents/retrieveBsnsAncmView.do?ancmId=024357");
    expect(n.deadline).toBe("2026-10-20");
    expect(n.eligibilityCaveat).toContain("경북");
    expect(visibleVerifiedRnd(new Date("2026-10-21T02:00:00Z"))).toEqual([]);
  });
  it("does not mistake every grant for an R&D project",()=>{
    expect(isRndAnnouncement({title:"재난안전 기술개발 신규과제",field:"기술"})).toBe(true);
    expect(isRndAnnouncement({title:"소상공인 임대료 지원사업",field:"창업"})).toBe(false);
  });
  it("normalizes official G2B envelope and rejects unsafe original links",()=>{
    const rows=normalizeG2BRows({response:{header:{resultCode:"00"},body:{items:[{
      bidNtceNo:"R26BK01812345",bidNtceNm:"재난안전 센서 도입 용역",
      ntceInsttNm:"수요기관",bidNtceDtlUrl:"https://www.g2b.go.kr/some/path",
    },{
      bidNtceNo:"R26BK01812346",bidNtceNm:"전기안전 감지장비 구매",
      ntceInsttNm:"발주기관",bidNtceDtlUrl:"https://evil.example/steal",
    }]}}},"용역");
    expect(rows).toHaveLength(2);
    expect(rows[0].kind).toBe("용역");
    expect(rows[0].originalUrl).toContain("g2b.go.kr");
    expect(rows[1].originalUrl).toBeNull();
    expect(rows[1].id).toBe("R26BK01812346");
    expect(rows[0]).not.toHaveProperty("description");
    expect(matchesOpportunityKeyword([rows[0].title],"재난 센서")).toBe(true);
    expect(matchesOpportunityKeyword([rows[0].title],"전기")).toBe(false);
    expect(()=>normalizeG2BRows({response:{header:{resultCode:"30"}}},"용역")).toThrow();
  });
});
