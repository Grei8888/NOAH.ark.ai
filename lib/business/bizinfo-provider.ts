import { unstable_cache } from "next/cache";
import { publicSourceMode } from "@/lib/news/public-official-sources";
import {
  normalizeBizinfoPayload, bizinfoRawItems, type BusinessSupportSnapshot,
} from "@/lib/business/support-contract";

export type BusinessSupportError =
  | "not_configured" | "authorization" | "provider_error" | "invalid_response" | "unusable_items" | "no_results";
export type BusinessSupportResult =
  | { ok:true; snapshot:BusinessSupportSnapshot }
  | { ok:false; reason:BusinessSupportError };

export function businessSupportEnabled():boolean {
  return publicSourceMode() &&
    process.env.NOAH_BUSINESS_SUPPORT_ENABLED==="true" &&
    !!process.env.BIZINFO_API_KEY?.trim();
}
async function loadBizinfoSnapshot():Promise<BusinessSupportSnapshot>{
  if(!businessSupportEnabled())throw new Error("not_configured");
  const query=new URLSearchParams({
    crtfcKey:process.env.BIZINFO_API_KEY!,
    dataType:"json",searchCnt:"80",pageUnit:"80",pageIndex:"1",
  });
  // Official provider. The credential is never exposed in HTTP response or logs.
  const resp=await fetch("https://www.bizinfo.go.kr/uss/rss/bizinfoApi.do?"+query,{
    signal:AbortSignal.timeout(12000),
    cache:"no-store",
    headers:{Accept:"application/json"},
  });
  if(resp.status===401||resp.status===403)throw new Error("authorization");
  if(!resp.ok)throw new Error("provider_error");
  let payload:unknown;
  try {payload=await resp.json();}catch{throw new Error("invalid_response");}
  if(!payload||typeof payload!=="object"||Array.isArray(payload))throw new Error("invalid_response");
  const root=payload as Record<string,unknown>;
  if(typeof root.error==="string"||typeof root.message==="string"&&/인증|오류|error|실패/.test(root.message)){
    throw new Error(/인증|인증키|서비스키|key/i.test(String(root.error??root.message))?"authorization":"provider_error");
  }
  const rawItems=bizinfoRawItems(payload);
  if(rawItems===null)throw new Error("invalid_response");
  const notices=normalizeBizinfoPayload(payload);
  if(!notices.length)throw new Error(rawItems.length?"unusable_items":"no_results");
  return {provider:"기업마당 공식 지원사업 API",checkedAt:new Date().toISOString(),notices};
}
const cached=unstable_cache(loadBizinfoSnapshot,["noah-bizinfo-support-v1"],{revalidate:21600});
export async function getBusinessSupportData():Promise<BusinessSupportResult>{
  if(!businessSupportEnabled())return {ok:false,reason:"not_configured"};
  try{return {ok:true,snapshot:await cached()};}
  catch(e){
    const reason=e instanceof Error&&["authorization","provider_error","invalid_response","unusable_items","no_results"].includes(e.message)
      ? e.message as BusinessSupportError:"provider_error";
    // Deliberately do not include raw server URLs containing keys in logs.
    console.warn("[NOAH Bizinfo] request unavailable:",reason);
    return {ok:false,reason};
  }
}
