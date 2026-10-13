"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BUSINESS_REGIONS, BUSINESS_FIELDS, BUSINESS_STAGES, BUSINESS_FORMS,
  DEFAULT_BUSINESS_PROFILE, rankBusinessSupport, validateBusinessProfile,
  type BusinessSupportSnapshot, type BusinessSupportNotice, type BusinessProfile,
} from "@/lib/business/support-contract";

const PROFILE_KEY = "noah:business-profile:v1";
const sourceLink = "https://www.bizinfo.go.kr/apiDetail.do?id=bizinfoApi";
type NoticePayload = Partial<BusinessSupportSnapshot> & { error?: string };

function validNotice(n:unknown):n is BusinessSupportNotice {
  if(!n || typeof n!=="object")return false;
  const v=n as BusinessSupportNotice;
  if(typeof v.title!=="string" || typeof v.url!=="string" || typeof v.agency!=="string" ||
    typeof v.id!=="string" || typeof v.field!=="string")return false;
  try{
    const u=new URL(v.url);
    return u.protocol==="https:" && ["www.bizinfo.go.kr","bizinfo.go.kr"].includes(u.hostname);
  }catch{return false;}
}
export function BusinessSupportPanel({enabled}:{enabled:boolean}){
  const [profile,setProfile]=useState<BusinessProfile>(DEFAULT_BUSINESS_PROFILE);
  const [profileReady,setProfileReady]=useState(false);
  const [snapshot,setSnapshot]=useState<BusinessSupportSnapshot|null>(null);
  const [error,setError]=useState("");
  const [loading,setLoading]=useState(false);
  const [showAll,setShowAll]=useState(false);

  useEffect(()=>{
    queueMicrotask(()=>{
      try{
        const stored=localStorage.getItem(PROFILE_KEY);
        if(stored)setProfile(validateBusinessProfile(JSON.parse(stored)));
      }catch{/* no browser storage */}
      setProfileReady(true);
    });
  },[]);
  useEffect(()=>{
    if(!enabled)return;
    const controller=new AbortController();
    queueMicrotask(()=>setLoading(true));
    void (async()=>{
      try{
        const r=await fetch("/api/business/support",{
          cache:"no-store",signal:AbortSignal.any([controller.signal,AbortSignal.timeout(17000)]),
        });
        const json:unknown=await r.json();
        if(controller.signal.aborted)return;
        const data=json as NoticePayload;
        if(!r.ok)throw new Error(typeof data.error==="string"?data.error:"공고 데이터를 불러오지 못했습니다.");
        if(data.provider!=="기업마당 공식 지원사업 API" ||
          !Array.isArray(data.notices)||data.notices.length>80||!data.notices.every(validNotice)||
          typeof data.checkedAt!=="string")throw new Error("지원사업 데이터 검증에 실패했습니다.");
        setSnapshot(data as BusinessSupportSnapshot);
        setError("");
      }catch(e){
        if(!controller.signal.aborted)setError(e instanceof Error&&e.name!=="TimeoutError"?e.message:"공고 API 연결이 지연되고 있습니다.");
      }finally{if(!controller.signal.aborted)setLoading(false);}
    })();
    return()=>controller.abort();
  },[enabled]);
  const matches=useMemo(()=>snapshot?rankBusinessSupport(snapshot.notices,profile):[],[profile,snapshot]);
  const shown=showAll?matches:matches.slice(0,5);
  function update<K extends keyof BusinessProfile>(field:K,value:BusinessProfile[K]){
    const next=validateBusinessProfile({...profile,[field]:value});
    setProfile(next);
    try{localStorage.setItem(PROFILE_KEY,JSON.stringify(next));}catch{/* private mode */}
  }
  const fields=[
    {id:"region",label:"사업 지역",values:BUSINESS_REGIONS},
    {id:"field",label:"지원 관심 분야",values:BUSINESS_FIELDS},
    {id:"stage",label:"창업 단계",values:BUSINESS_STAGES},
    {id:"form",label:"기업 유형",values:BUSINESS_FORMS},
  ] as const;
  return (
    <section className="businessSupportSection" aria-labelledby="business-support-title">
      <div className="businessSupportHeader">
        <div>
          <span className="businessSupportEyebrow">MY BUSINESS · PUBLIC DATA</span>
          <h2 id="business-support-title">내 사업에 맞는 지원사업 찾기</h2>
          <p>공식 공고 조건을 먼저 확인하고, 내 사업과 관련 있어 보이는 공고를 선별합니다.</p>
        </div>
        <a href="https://www.bizinfo.go.kr/" target="_blank" rel="noopener noreferrer">기업마당 ↗</a>
      </div>
      <div className="businessSupportProfile">
        <div className="businessSupportProfileTitle">
          <strong>사업자 프로필</strong>
          <span>이 브라우저에만 저장 · 사업자등록번호 불필요</span>
        </div>
        <div className="businessSupportInputs">
          {fields.map(field=>(
            <label key={field.id}>
              <span>{field.label}</span>
              <select disabled={!profileReady} value={profile[field.id]}
                onChange={e=>update(field.id,e.target.value)}>
                {field.values.map(value=><option key={value} value={value}>{value}</option>)}
              </select>
            </label>
          ))}
        </div>
      </div>
      {!enabled ? (
        <div className="businessSupportStatus" role="status">
          <strong>기업마당 공공데이터 연결 대기</strong>
          <p>공식 API 인증키를 연결하면 실제 지원사업 공고가 표시됩니다. 예시 공고를 실제 결과인 것처럼 보여주지 않습니다.</p>
          <a href={sourceLink} target="_blank" rel="noopener noreferrer">기업마당 API 키 신청 안내 ↗</a>
        </div>
      ) : loading ? (
        <p className="businessSupportStatus" role="status">기업마당 실제 지원사업 공고를 확인하는 중입니다…</p>
      ) : error ? (
        <div className="businessSupportStatus" role="status">
          <strong>실제 공고를 표시할 수 없습니다.</strong>
          <p>{error}</p>
          <a href="https://www.bizinfo.go.kr/" target="_blank" rel="noopener noreferrer">기업마당에서 직접 확인하기 ↗</a>
        </div>
      ) : matches.length===0 ? (
        <div className="businessSupportStatus" role="status">
          <strong>확인 가능한 공고가 없습니다.</strong>
          <p>표시할 공고가 없거나 접수 종료로 확인됐습니다. 신청기간과 조건은 기업마당 원문에서 다시 확인하세요.</p>
        </div>
      ) : (
        <div className="businessSupportResults">
          <p className="businessSupportCount">
            공식 데이터 {snapshot?.notices.length ?? 0}건 확인 · 현재 표시 {shown.length}건
            <span>자동 선별은 적격 심사가 아닙니다.</span>
          </p>
          {shown.map(({notice,status,reasons,cautions})=>(
            <article className="businessSupportNotice" key={notice.id}>
              <div className="businessSupportNoticeMeta">
                <span>{notice.field}</span>
                <span aria-hidden="true">·</span>
                <span>{notice.agency}</span>
                <span className="businessSupportNoticeStatus">{status}</span>
              </div>
              <h3><a href={notice.url} target="_blank" rel="noopener noreferrer">{notice.title}</a></h3>
              {notice.target&&<p className="businessSupportTarget">지원대상(공고 표시): {notice.target}</p>}
              <p className="businessSupportPeriod">신청기간: {notice.applicationPeriod||"원문 확인 필요"}</p>
              <div className="businessSupportReasons">
                {reasons.length>0&&<p>관련성 근거: {reasons.slice(0,2).join(" · ")}</p>}
                <p>확인할 사항: {cautions[0]||"실제 자격·제외 조건·증빙서류"}</p>
              </div>
              <a className="businessSupportOriginal" href={notice.url} target="_blank" rel="noopener noreferrer">
                공고 원문 및 신청 조건 확인 ↗
              </a>
            </article>
          ))}
          {matches.length>5&&(
            <button className="businessSupportMore" type="button" onClick={()=>setShowAll(v=>!v)}>
              {showAll?"상위 5개만 보기":"추가 공고 보기"} ↗
            </button>
          )}
        </div>
      )}
      <p className="businessSupportDisclaimer">
        자료 출처: 중소벤처기업부 기업마당 지원사업정보 공식 API.
        목록은 공고 제목·분야·기관·신청기간·지원대상 메타정보를 기반으로 선별한 참고자료입니다.
        지역·업력·기업 형태의 최종 신청자격이나 마감 연장 여부는 공고문과 시행기관에서 확인하세요.
        원문 링크를 제외한 본문·첨부파일은 NOAH에 복제하지 않습니다.
      </p>
    </section>
  );
}
