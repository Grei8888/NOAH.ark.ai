import { describe, expect, it } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { BusinessSupportPanel } from "@/components/home/BusinessSupportPanel";

describe("My Business submit UX",()=>{
  it("shows a real submit control only after which personalized business results are requested",()=>{
    const html=renderToStaticMarkup(createElement(BusinessSupportPanel,{enabled:true}));
    expect(html).toContain('type="submit"');
    expect(html).toContain("맞춤 지원사업 조회");
    expect(html).toContain("조건을 선택한 뒤 조회 버튼");
    expect(html).not.toContain("현재 OpenAI");
    expect(html).toContain("사업 지역");
    expect(html).toContain("창업 단계");
  });
  it("does not suggest live results are available when provider is disabled",()=>{
    const html=renderToStaticMarkup(createElement(BusinessSupportPanel,{enabled:false}));
    expect(html).toContain("공공데이터 API 연결 대기");
    expect(html).toContain("disabled");
    expect(html).not.toContain("실제 공고 5건");
  });
});
