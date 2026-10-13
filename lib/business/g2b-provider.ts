import { unstable_cache } from "next/cache";
import { publicSourceMode } from "@/lib/news/public-official-sources";
import {
  normalizeG2BRows, type ProcurementKind, type ProcurementSnapshot,
} from "@/lib/business/opportunities";

export function procurementEnabled():boolean {
  return publicSourceMode()&&
    process.env.NOAH_B2G_ENABLED==="true"&&
    !!process.env.G2B_API_KEY?.trim();
}
type ProcurementResult=
  | {ok:true;snapshot:ProcurementSnapshot}
  | {ok:false;reason:"not_configured"|"provider_error"|"invalid_response"};
const types:readonly {kind:ProcurementKind;operation:string}[]=[
  {kind:"용역",operation:"getBidPblancListInfoServcPPSSrch"},
  {kind:"물품",operation:"getBidPblancListInfoThngPPSSrch"},
  {kind:"공사",operation:"getBidPblancListInfoCnstwkPPSSrch"},
];
function formatKoreanNow(when:Date){
  const fragments=new Intl.DateTimeFormat("en-US",{
    timeZone:"Asia/Seoul",year:"numeric",month:"2-digit",day:"2-digit",
    hour:"2-digit",minute:"2-digit",hourCycle:"h23",
  }).formatToParts(when);
  const value=(part:string)=>fragments.find(x=>x.type===part)?.value||"00";
  return ["year","month","day","hour","minute"].map(value).join("");
}
async function load():Promise<ProcurementSnapshot>{
  if(!procurementEnabled())throw new Error("not_configured");
  // Narrow, shared snapshot limits provider usage. NOT a complete bidding index.
  const now=new Date(), start=new Date(now.getTime()-2*86400000);
  const coveredFrom=formatKoreanNow(start),coveredTo=formatKoreanNow(now);
  let success=0;
  const arrays=await Promise.all(types.map(async ({kind,operation})=>{
    const params=new URLSearchParams({
      serviceKey:process.env.G2B_API_KEY!,
      type:"json",pageNo:"1",numOfRows:"50",inqryDiv:"1",
      inqryBgnDt:coveredFrom,inqryEndDt:coveredTo,
    });
    try{
      const response=await fetch("https://apis.data.go.kr/1230000/ad/BidPublicInfoService/"+operation+"?"+params,{
        cache:"no-store",
        headers:{Accept:"application/json"},
        signal:AbortSignal.timeout(10000),
      });
      if(!response.ok)throw new Error("provider_error");
      const data:unknown=await response.json();
      const parsed=normalizeG2BRows(data,kind);
      success+=1;
      return parsed;
    }catch{
      // Do not log upstream URLs: their querystrings contain the API key.
      return [];
    }
  }));
  if(!success)throw new Error("provider_error");
  const seen=new Set<string>();
  const notices=arrays.flat().filter(x=>{
    const unique=x.kind+":"+x.id;
    if(seen.has(unique))return false;
    seen.add(unique);return true;
  }).slice(0,150);
  return {
    provider:"조달청 나라장터 입찰공고정보서비스",
    checkedAt:now.toISOString(),coveredFrom,coveredTo,
    notices,partial:success!==types.length,
  };
}
const cached=unstable_cache(load,["noah-g2b-snapshot-v1"],{revalidate:21600});
export async function getProcurementSnapshot():Promise<ProcurementResult>{
  if(!procurementEnabled())return {ok:false,reason:"not_configured"};
  try{return {ok:true,snapshot:await cached()};}
  catch{return {ok:false,reason:"provider_error"};}
}
