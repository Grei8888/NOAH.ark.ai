import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextResponse } from "next/server";
import {
  DEFAULT_BUSINESS_PROFILE, normalizeBizinfoPayload, officialAnnouncementUrl,
  parseApplicationPeriod, rankBusinessSupport, validateBusinessProfile,
} from "@/lib/business/support-contract";
import { businessSupportEnabled } from "@/lib/business/bizinfo-provider";
import { GET } from "@/app/api/business/support/route";

const fixtures = [
  {
    title:"2026년 서울특별시 소상공인 창업 금융 지원 공고",
    link:"https://www.bizinfo.go.kr/web/lay1/bbs/S1T122C128/AS/74/view.do?pblancId=PBLN_1",
    seq:"PBLN_1", author:"서울특별시", excInsttNm:"서울창업센터",
    lcategory:"창업", pubDate:"2026-10-10 12:00:00", reqstDt:"20261001 ~ 20261020",
    trgetNm:"서울 소재 소상공인",
    description:"원문 사업개요를 재게시하지 않습니다.",
  },
  {
    pblancNm:"2026년 중소기업 기술개발 사업",
    pblancUrl:"https://www.bizinfo.go.kr/sii/siia/selectSIIA200Detail.do?pblancId=PBLN_2",
    pblancId:"PBLN_2", jrsdInsttNm:"중소벤처기업부", pldirSportRealmLclasCodeNm:"기술",
    reqstBeginEndDe:"20260901 ~ 20260910", trgetNm:"중소기업",
  },
];
beforeEach(()=>{
  vi.stubEnv("VERCEL_ENV","preview");
  vi.stubEnv("NOAH_REAL_SOURCE_PREVIEW","true");
  vi.stubEnv("NEWS_PROVIDER","government");
  vi.stubEnv("AI_PROVIDER","off");
  vi.stubEnv("NOAH_BUSINESS_SUPPORT_ENABLED","true");
  vi.stubEnv("BIZINFO_API_KEY","test-do-not-send");
});
afterEach(()=>{vi.restoreAllMocks();vi.unstubAllEnvs();});
describe("live Bizinfo metadata without invented grants",()=>{
  it("parses only official source title URL date target, never articles or attachments",()=>{
    const notices=normalizeBizinfoPayload({channel:{item:fixtures}});
    expect(notices).toHaveLength(2);
    expect(notices[0].title).toContain("서울특별시");
    expect(notices[0].endDate).toBe("2026-10-20");
    expect(notices[0].target).toBe("서울 소재 소상공인");
    expect(notices[0]).not.toHaveProperty("description");
    expect(notices[0]).not.toHaveProperty("fileNm");
    expect(notices[1].field).toBe("기술");
  });
  it("understands documented envelope and avoids arbitrary external or script links",()=>{
    // The official API example wraps the data as `jsonArray.item`, NOT `channel.item`.
    const documented=normalizeBizinfoPayload({
      jsonArray:{
        title:"기업마당 지원사업정보",
        link:"https://www.bizinfo.go.kr/web/lay1/bbs/S1T122C128/AS/74/list.do",
        item:[fixtures[0]],
      },
    });
    expect(documented).toHaveLength(1);
    expect(documented[0].title).toBe(fixtures[0].title);
    expect(documented[0].url).toBe(fixtures[0].link);
    expect(documented[0]).not.toHaveProperty("description");
    expect(normalizeBizinfoPayload({rss:{channel:{item:[fixtures[0]]}}})).toHaveLength(1);
    expect(normalizeBizinfoPayload({item:[fixtures[0],fixtures[0]]})).toHaveLength(1);
    expect(normalizeBizinfoPayload({item:[{...fixtures[0],link:"https://evil.example/view.do"}]})).toEqual([]);
    expect(officialAnnouncementUrl("javascript:alert(1)")).toBeNull();
    expect(officialAnnouncementUrl("https://bizinfo.go.kr.evil.site/x/view.do")).toBeNull();
    expect(officialAnnouncementUrl("https://www.bizinfo.go.kr/uss/rss/bizinfoApi.do?crtfcKey=test")).toBeNull();
  });
  it("interprets dates conservatively and ignores invalid ranges",()=>{
    expect(parseApplicationPeriod("20261001 ~ 20261020")).toEqual({startDate:"2026-10-01",endDate:"2026-10-20"});
    expect(parseApplicationPeriod("상시")).toEqual({startDate:null,endDate:null});
    expect(parseApplicationPeriod("20261345~20260110")).toEqual({startDate:null,endDate:null});
  });
  it("treats regional + industry matches as candidates and excludes closed applications",()=>{
    const notices=normalizeBizinfoPayload({channel:{item:fixtures}});
    const now=new Date("2026-10-13T02:00:00Z");
    const profile=validateBusinessProfile({region:"서울",field:"창업",stage:"3년 이내",form:"개인사업자"});
    const ranked=rankBusinessSupport(notices,profile,now);
    expect(ranked).toHaveLength(1);
    expect(ranked[0].status).toBe("관련 가능성 있음");
    expect(ranked[0].reasons.some(v=>v.includes("지역"))).toBe(true);
    expect(ranked[0]).not.toHaveProperty("eligible");
    expect(ranked[0].cautions.length).toBeGreaterThan(0);
  });
  it("does not accept profile injection or turn missing fields into confirmed eligibility",()=>{
    expect(validateBusinessProfile({region:"http://x",field:"개발자",stage:999,form:"법인사업자"})).toEqual({
      ...DEFAULT_BUSINESS_PROFILE,form:"법인사업자",
    });
    const rows=rankBusinessSupport(normalizeBizinfoPayload({item:[fixtures[0]]}),DEFAULT_BUSINESS_PROFILE,new Date("2026-10-13T02:00:00Z"));
    expect(rows[0].status).toBe("추가 확인 필요");
  });
  it("does not make upstream calls or fake fixtures when key/config not set",async()=>{
    expect(businessSupportEnabled()).toBe(true);
    const spy=vi.spyOn(globalThis,"fetch");
    vi.stubEnv("BIZINFO_API_KEY","");
    expect(businessSupportEnabled()).toBe(false);
    const res:NextResponse=await GET();
    expect(res.status).toBe(503);
    expect((await res.json()).code).toBe("not_configured");
    expect(spy).not.toHaveBeenCalled();
  });
});
