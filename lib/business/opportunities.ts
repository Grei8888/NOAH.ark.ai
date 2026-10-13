/**
 * NOAH public-business opportunities.
 * "Opportunity" is not "eligible": user must verify the full original notice.
 * IRIS manually verified references are date bounded and are NOT an IRIS live feed.
 */
import type { BusinessSupportNotice } from "@/lib/business/support-contract";
export type OpportunityTab = "support" | "rnd" | "b2g";
export const OPPORTUNITY_TABS: ReadonlyArray<{id:OpportunityTab; label:string; hint:string}> = [
  {id:"support",label:"지원사업",hint:"기업마당 · 지원·사업화"},
  {id:"rnd",label:"국가 R&D",hint:"IRIS · 연구개발과제"},
  {id:"b2g",label:"공공입찰 B2G",hint:"나라장터 · 물품·용역·공사"},
];
export type OfficialRndReference = {
  id:string; title:string; ministry:string; host:string; url:string;
  field:string; opened:string; deadline:string; verificationDate:string;
  scope:string; eligibilityCaveat:string;
};
export const VERIFIED_RND_REFERENCES:readonly OfficialRndReference[] = [
  {
    id:"iris-2026-024357",
    title:"2026년도 지역맞춤형 재난안전 문제해결 기술개발 지원(2단계) 신규과제 재공모",
    ministry:"행정안전부",host:"한국산업기술기획평가원",
    url:"https://www.iris.go.kr/contents/retrieveBsnsAncmView.do?ancmId=024357",
    field:"재난·안전 / AI / 산불",
    opened:"2026-10-06",deadline:"2026-10-20",verificationDate:"2026-10-14",
    scope:"경북 산불화재 시 문화유산 보호 연소저지선 구축을 위한 AI 감지·예측 및 이동형 자동 살수시스템 기술개발",
    eligibilityCaveat:"경북 소재 주관기업·법인사업자·연구개발조직 등 필수 조건이 있습니다. 재난 관련 기술이라는 이유만으로 신청 가능한 것은 아닙니다.",
  },
];
export function visibleVerifiedRnd(now=new Date()):OfficialRndReference[]{
  const day=new Intl.DateTimeFormat("en-CA",{
    timeZone:"Asia/Seoul",year:"numeric",month:"2-digit",day:"2-digit",
  }).format(now);
  return VERIFIED_RND_REFERENCES.filter(n=>n.opened<=day&&n.deadline>=day);
}
export function isRndAnnouncement(n:Pick<BusinessSupportNotice,"title"|"field">):boolean{
  const combined=n.title+" "+n.field;
  return /R\s*&\s*D|연구개발|기술개발|실증(사업|지원|연구|기술)|연구과제|국가연구|R&BD|중소기업기술혁신/.test(combined);
}
export function matchesOpportunityKeyword(fields:readonly (string|null|undefined)[],query:string):boolean{
  const words=query.trim().toLocaleLowerCase("ko-KR").split(/\s+/).filter(Boolean).slice(0,5);
  return words.length===0||words.every(w=>fields.join(" ").toLocaleLowerCase("ko-KR").includes(w));
}
export type ProcurementKind="용역"|"물품"|"공사";
export type ProcurementNotice={
  id:string; title:string; agency:string; kind:ProcurementKind;
  announcedAt:string|null; deadline:string|null; amount:string|null;
  originalUrl:string|null;
};
export type ProcurementSnapshot={
  provider:"조달청 나라장터 입찰공고정보서비스";
  checkedAt:string;
  coveredFrom:string; coveredTo:string;
  notices:ProcurementNotice[];
  partial:boolean;
};
/** Strictly normalize only the official G2B bid metadata. */
export function normalizeG2BRows(input:unknown,kind:ProcurementKind):ProcurementNotice[]{
  if(!input||typeof input!=="object")throw new Error("invalid_response");
  const data=input as {response?:{header?:{resultCode?:string};body?:{items?:unknown}}};
  if(data.response?.header?.resultCode!=="00")throw new Error("provider_error");
  const raw=data.response?.body?.items;
  const rows=Array.isArray(raw)?raw:raw&&typeof raw==="object"&&
    Array.isArray((raw as {item?:unknown}).item)?(raw as {item:unknown[]}).item:[];
  const output:ProcurementNotice[]=[];
  const ids=new Set<string>();
  function txt(x:unknown,length=220):string{
    return typeof x==="string"?x.replace(/\s+/g," ").trim().slice(0,length):"";
  }
  for(const candidate of rows.slice(0,100)){
    if(!candidate||typeof candidate!=="object")continue;
    const r=candidate as Record<string,unknown>;
    const id=txt(r.bidNtceNo,60);
    const title=txt(r.bidNtceNm,235);
    if(!id||!title||ids.has(id))continue;
    ids.add(id);
    const link=txt(r.bidNtceDtlUrl??r.bidNtceUrl,1400);
    let originalUrl:string|null=null;
    if(link){
      try{
        const parsed=new URL(link);
        if(parsed.protocol==="https:" && !parsed.username&&!parsed.password&&
          (parsed.hostname==="g2b.go.kr"||parsed.hostname.endsWith(".g2b.go.kr")))
          originalUrl=parsed.toString();
      }catch{/* no trusted original link */}
    }
    output.push({
      id,title,kind,
      agency:txt(r.ntceInsttNm??r.dminsttNm,100)||"발주기관 원문 확인",
      announcedAt:txt(r.bidNtceDt,35)||null,
      deadline:txt(r.bidClseDt??r.bidClseDate,35)||null,
      amount:txt(r.presmptPrce??r.asignBdgtAmt,40)||null,
      originalUrl,
    });
  }
  return output;
}
