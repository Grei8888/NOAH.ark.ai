/**
 * Trusted, strictly bounded metadata extracted from Bizinfo's official JSON API.
 * No PDF, full announcement body, thumbnails, private business IDs or personal data.
 * Source: https://www.bizinfo.go.kr/apiDetail.do?id=bizinfoApi
 */
export const BUSINESS_REGIONS = [
  "전국","서울","경기","인천","부산","대구","광주","대전","울산",
  "세종","강원","충북","충남","전북","전남","경북","경남","제주",
] as const;
export const BUSINESS_FIELDS = ["전체","창업","기술","금융","수출","내수","경영","인력"] as const;
export const BUSINESS_STAGES = ["미설정","예비창업","3년 이내","3~7년","7년 초과"] as const;
export const BUSINESS_FORMS = ["미설정","개인사업자","법인사업자"] as const;

export type BusinessRegion = typeof BUSINESS_REGIONS[number];
export type BusinessField = typeof BUSINESS_FIELDS[number];
export type BusinessStage = typeof BUSINESS_STAGES[number];
export type BusinessForm = typeof BUSINESS_FORMS[number];
export type BusinessProfile = {
  region: BusinessRegion;
  field: BusinessField;
  stage: BusinessStage;
  form: BusinessForm;
};
export const DEFAULT_BUSINESS_PROFILE: BusinessProfile = {
  region:"전국",field:"전체",stage:"미설정",form:"미설정",
};
export function validateBusinessProfile(x: unknown): BusinessProfile {
  if (!x || typeof x!=="object") return { ...DEFAULT_BUSINESS_PROFILE };
  const v=x as Record<string,unknown>;
  const choose=<T extends string>(value:unknown, options:readonly T[], fallback:T) =>
    typeof value==="string" && options.includes(value as T) ? value as T : fallback;
  return {
    region:choose(v.region,BUSINESS_REGIONS,"전국"),
    field:choose(v.field,BUSINESS_FIELDS,"전체"),
    stage:choose(v.stage,BUSINESS_STAGES,"미설정"),
    form:choose(v.form,BUSINESS_FORMS,"미설정"),
  };
}
export type BusinessSupportNotice = {
  id:string; title:string; url:string; agency:string; operator:string;
  field:string; target:string | null; applicationPeriod:string | null;
  startDate:string | null; endDate:string | null; publishedAt:string | null;
};
export type BusinessSupportSnapshot = {
  provider:"기업마당 공식 지원사업 API";
  checkedAt:string; notices:BusinessSupportNotice[];
};
export type BusinessMatch = {
  notice: BusinessSupportNotice;
  status:"관련 가능성 있음"|"추가 확인 필요";
  reasons:string[];
  cautions:string[];
  score:number;
};
function obj(input:unknown):Record<string,unknown>|null {
  return !!input && typeof input==="object" && !Array.isArray(input)
    ? input as Record<string,unknown> : null;
}
function clean(value:unknown,max:number):string {
  return typeof value==="string" ? value.replace(/\s+/g," ").trim().slice(0,max) : "";
}
export function officialAnnouncementUrl(raw:unknown):string|null {
  if(typeof raw!=="string"||raw.length>1700)return null;
  try{
    const u=new URL(raw);
    if(u.protocol!=="https:"||u.username||u.password||u.port) return null;
    if(!["www.bizinfo.go.kr","bizinfo.go.kr"].includes(u.hostname.toLowerCase()))return null;
    if(!u.pathname.includes("/view.do")&&!u.pathname.includes("selectSIIA200Detail.do"))return null;
    return u.toString();
  }catch{return null;}
}
function dateFromEight(raw:string):string|null {
  const match=raw.match(/^(20\d{2})(\d{2})(\d{2})$/);
  if(!match) return null;
  const date=new Date(match[1]+"-"+match[2]+"-"+match[3]+"T00:00:00+09:00");
  if(!Number.isFinite(date.getTime()) || new Intl.DateTimeFormat("en-CA",{timeZone:"Asia/Seoul",year:"numeric",month:"2-digit",day:"2-digit"}).format(date).replace(/-/g,"")!==match[0])return null;
  return match[1]+"-"+match[2]+"-"+match[3];
}
export function parseApplicationPeriod(input:unknown):{startDate:string|null;endDate:string|null}{
  const v=clean(input,110);
  const matches=[...v.matchAll(/20\d{2}[\s./-]?\d{2}[\s./-]?\d{2}/g)].map(m=>m[0].replace(/[^\d]/g,""));
  if(matches.length<2) return {startDate:null,endDate:null};
  const start=dateFromEight(matches[0]),end=dateFromEight(matches[1]);
  if(!start||!end||start>end)return {startDate:null,endDate:null};
  return {startDate:start,endDate:end};
}
export function normalizeBizinfoPayload(input:unknown):BusinessSupportNotice[] {
  const root=obj(input);
  // Official Bizinfo API JSON envelope is { jsonArray: { item: [...] } }.
  // Also accept backwards-compatible channel and response variants.
  // Never recurse arbitrary article/body fields or expose descriptions or attachments.
  const documented=obj(root?.jsonArray);
  const response=obj(root?.response);
  const body=obj(response?.body);
  const channel=obj(root?.channel)||(obj(root?.rss)?obj(obj(root?.rss)?.channel):null);
  const bodyItems=obj(body?.items);
  const raw=documented?.item??root?.item??channel?.item??bodyItems?.item??body?.items??root?.items;
  const list=Array.isArray(raw)?raw:raw&&typeof raw==="object"?[raw]:[];
  const results:BusinessSupportNotice[]=[];
  const seen=new Set<string>();
  for(const value of list.slice(0,150)){
    const row=obj(value);
    if(!row)continue;
    const title=clean(row.pblancNm??row.title,230);
    const url=officialAnnouncementUrl(row.pblancUrl??row.link);
    const id=clean(row.pblancId??row.seq,75);
    if(!title||!url||title.length<5||seen.has(url))continue;
    seen.add(url);
    const applicationPeriod=clean(row.reqstBeginEndDe??row.reqstDt,120)||null;
    const {startDate,endDate}=parseApplicationPeriod(applicationPeriod);
    const rawDate=clean(row.creatPnttm??row.pubDate,30);
    const publishedAt=/^20\d{2}[-./]\d{2}[-./]\d{2}/.test(rawDate)?
      rawDate.slice(0,10).replace(/[./]/g,"-"):null;
    results.push({
      id:id||url,title,url,
      agency:clean(row.jrsdInsttNm??row.author,70)||"소관기관 확인 필요",
      operator:clean(row.excInsttNm,70)||"수행기관 확인 필요",
      field:clean(row.pldirSportRealmLclasCodeNm??row.lcategory,35)||"분야 미확인",
      target:clean(row.trgetNm,300)||null,
      applicationPeriod,startDate,endDate,publishedAt,
    });
    if(results.length>=80)break;
  }
  return results;
}
function sameRegion(text:string,region:BusinessRegion):boolean {
  const names=region==="광주"?["광주광역시"]:region==="전북"?["전북특별자치도","전라북도"]:region==="강원"?["강원특별자치도","강원도"]:region==="제주"?["제주특별자치도","제주도"]:region==="서울"?["서울특별시","서울시"]:region==="경기"?["경기도"]:region==="인천"?["인천광역시"]:region==="전남"?["전라남도"]:region==="경북"?["경상북도"]:region==="경남"?["경상남도"]:region==="충남"?["충청남도"]:region==="충북"?["충청북도"]:region==="대전"?["대전광역시"]:region==="대구"?["대구광역시"]:region==="부산"?["부산광역시"]:region==="울산"?["울산광역시"]:region==="세종"?["세종특별자치시"]:["전국"];
  return names.some(n=>text.includes(n))||text.includes("["+region+"]");
}
export function rankBusinessSupport(
  notices:readonly BusinessSupportNotice[],
  profile:BusinessProfile,
  now=new Date(),
):BusinessMatch[]{
  const selected=validateBusinessProfile(profile);
  const today=new Intl.DateTimeFormat("en-CA",{timeZone:"Asia/Seoul",year:"numeric",month:"2-digit",day:"2-digit"}).format(now);
  return notices.filter(n=>!n.endDate||n.endDate>=today).map(notice=>{
    let score=0;
    const reasons:string[]=[];
    const cautions:string[]=[];
    const combined=notice.title+" "+notice.agency+" "+notice.target;
    if(selected.field!=="전체" && (notice.field.includes(selected.field)||notice.title.includes(selected.field))) {
      score+=30;reasons.push("선택한 지원분야와 공고명/분야 일치");
    } else if(selected.field!=="전체"){cautions.push("업종·세부 지원분야 적합성 미확인");}
    if(selected.region!=="전국"){
      if(sameRegion(combined,selected.region)){score+=22;reasons.push("선택한 지역이 공고명·소관기관 등에 명시됨");}
      else cautions.push("선택한 지역에 적용되는지 확인 필요");
    }
    if(selected.stage!=="미설정"){
      const token=selected.stage==="예비창업"?"예비창업":selected.stage==="3년 이내"?"3년":selected.stage==="3~7년"?"7년":"7년";
      if(combined.includes(token)){score+=10;reasons.push("업력 관련 표현이 공고에 등장함 · 세부 조건 확인 필요");}
      else cautions.push("업력 조건은 첨부 공고문에서 확인 필요");
    }
    if(selected.form!=="미설정"){
      if(combined.includes(selected.form)){score+=5;reasons.push("기업 형태가 공고에 언급됨 · 적격 확정 아님");}
      else cautions.push("사업자 유형의 적격 여부 미확인");
    }
    if(notice.endDate){
      const days=(Date.parse(notice.endDate+"T00:00:00+09:00")-now.getTime())/86400000;
      if(days>=0&&days<=7){score+=12;reasons.push("접수 마감 7일 이내 · 긴급 확인 권장");}
      else if(days>7){score+=3;reasons.push("표시된 접수기간상 마감 전");}
    } else cautions.push("신청기간을 자동 확인할 수 없음");
    if(!notice.target)cautions.push("지원대상 원문 확인 필요");
    // Metadata matches are relevance hints, NOT legally reliable eligibility decisions.
    const status:BusinessMatch["status"] = reasons.some(x=>x.includes("일치")) ?
      "관련 가능성 있음":"추가 확인 필요";
    return {notice,status,reasons,cautions,score};
  }).sort((a,b)=>b.score-a.score||a.notice.title.localeCompare(b.notice.title,"ko")).slice(0,12);
}
