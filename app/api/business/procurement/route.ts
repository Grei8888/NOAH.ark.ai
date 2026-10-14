import { NextResponse } from "next/server";
import { getProcurementSnapshot } from "@/lib/business/g2b-provider";
export const runtime="nodejs";
export const dynamic="force-dynamic";
export async function GET(){
  const response=await getProcurementSnapshot();
  if(!response.ok){
    const messages={
      not_configured:"나라장터 API 인증키가 아직 연결되지 않았습니다. 공공데이터포털에서 별도 키 발급이 필요합니다.",
      provider_error:"나라장터 공식 공고 정보를 확인할 수 없습니다. 공공데이터포털 인증 및 호출 상태를 점검해 주세요.",
      invalid_response:"나라장터 공식 응답 형식을 확인할 수 없습니다.",
    } as const;
    return NextResponse.json({error:messages[response.reason],code:response.reason},{
      status:503,headers:{"Cache-Control":"no-store","X-Content-Type-Options":"nosniff"},
    });
  }
  return NextResponse.json(response.snapshot,{
    headers:{"Cache-Control":"no-store","X-Content-Type-Options":"nosniff"},
  });
}
