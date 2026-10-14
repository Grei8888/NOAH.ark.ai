import { NextResponse } from "next/server";
import { getBusinessSupportData } from "@/lib/business/bizinfo-provider";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const messages = {
  not_configured: "기업마당 API 연동 전입니다. 운영자가 API 인증키를 연결해야 합니다.",
  authorization: "기업마당 API 인증이 거부됐습니다. 발급된 서비스키를 확인해 주세요.",
  provider_error: "기업마당 공고 데이터 연결이 일시적으로 원활하지 않습니다.",
  invalid_response: "기업마당 API 응답의 공고 목록 형식을 인식하지 못했습니다. 데이터 구조 확인이 필요합니다.",
  unusable_items: "기업마당에서 공고 항목을 받았지만 공식 원문 링크 검증을 통과하지 못했습니다. 연결 형식을 점검하고 있습니다.",
  no_results: "기업마당 공식 API에서 빈 공고 목록을 반환했습니다. 공고 전체가 없다는 의미는 아닙니다.",
} as const;
export async function GET() {
  const result = await getBusinessSupportData();
  if(!result.ok){
    return NextResponse.json({error:messages[result.reason],code:result.reason},{
      status:result.reason==="not_configured"?503:result.reason==="authorization"?502:503,
      headers:{"Cache-Control":"no-store","X-Content-Type-Options":"nosniff"},
    });
  }
  return NextResponse.json(result.snapshot,{
    headers:{"Cache-Control":"no-store","X-Content-Type-Options":"nosniff"},
  });
}
