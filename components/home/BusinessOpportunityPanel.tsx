"use client";

import { useEffect, useState } from "react";
import { BusinessSupportPanel } from "@/components/home/BusinessSupportPanel";
import {
  OPPORTUNITY_TABS, isRndAnnouncement, matchesOpportunityKeyword,
  visibleVerifiedRnd, type OpportunityTab, type ProcurementSnapshot,
} from "@/lib/business/opportunities";
import type { BusinessSupportNotice, BusinessSupportSnapshot } from "@/lib/business/support-contract";

const irisUrl="https://www.iris.go.kr/contents/retrieveBsnsAncmListView.do";
const portalUrl="https://www.data.go.kr/data/15129394/openapi.do";
const narajangteoUrl="https://www.g2b.go.kr/";

export function BusinessOpportunityPanel({enabled}:{enabled:boolean}){
  const [tab,setTab]=useState<OpportunityTab>("support");
  const [keyword,setKeyword]=useState("");
  const [rnd,setRnd]=useState<BusinessSupportNotice[]|null>(null);
  const [rndError,setRndError]=useState("");
  const [rndLoading,setRndLoading]=useState(false);
  const [b2g,setB2g]=useState<ProcurementSnapshot|null>(null);
  const [b2gError,setB2gError]=useState("");
  const [b2gLoading,setB2gLoading]=useState(false);
  useEffect(()=>{
    if(tab==="rnd"&&enabled){
      const controller=new AbortController();
      queueMicrotask(()=>setRndLoading(true));
      void fetch("/api/business/support",{cache:"no-store",signal:controller.signal})
        .then(async res=>{
          const body=await res.json() as Partial<BusinessSupportSnapshot> & {error?:string};
          if(!res.ok)throw new Error(typeof body.error==="string"?body.error:"기업마당 API 연결 실패");
          if(body.provider!=="기업마당 공식 지원사업 API"||!Array.isArray(body.notices))
            throw new Error("기업마당 R&D 공고 데이터 형식 확인 필요");
          setRnd(body.notices.filter(isRndAnnouncement).slice(0,80));
          setRndError("");
        })
        .catch(err=>{if(!controller.signal.aborted)setRndError(err instanceof Error?err.message:"기업마당 API 연결 실패");})
        .finally(()=>{if(!controller.signal.aborted)setRndLoading(false);});
      return ()=>controller.abort();
    }
  },[tab,enabled]);
  useEffect(()=>{
    if(tab==="b2g"){
      const controller=new AbortController();
      queueMicrotask(()=>setB2gLoading(true));
      void fetch("/api/business/procurement",{cache:"no-store",signal:controller.signal})
        .then(async res=>{
          const body=await res.json() as Partial<ProcurementSnapshot> & {error?:string};
          if(!res.ok)throw new Error(typeof body.error==="string"?body.error:"나라장터 API 연결 실패");
          if(body.provider!=="조달청 나라장터 입찰공고정보서비스"||
            !Array.isArray(body.notices)||body.notices.length>150)
            throw new Error("나라장터 응답 형식 확인 필요");
          setB2g(body as ProcurementSnapshot);
          setB2gError("");
        })
        .catch(err=>{if(!controller.signal.aborted)setB2gError(err instanceof Error?err.message:"나라장터 API 연결 실패");})
        .finally(()=>{if(!controller.signal.aborted)setB2gLoading(false);});
      return ()=>controller.abort();
    }
  },[tab]);
  const reference=visibleVerifiedRnd().filter(n=>
    matchesOpportunityKeyword([n.title,n.field,n.scope,n.ministry],keyword));
  const rndMatches=(rnd||[]).filter(n=>
    !n.endDate||n.endDate>=new Intl.DateTimeFormat("en-CA",{timeZone:"Asia/Seoul",year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date())
  ).filter(n=>matchesOpportunityKeyword([n.title,n.field,n.target,n.agency],keyword)).slice(0,12);
  const b2gMatches=(b2g?.notices||[]).filter(n=>
    matchesOpportunityKeyword([n.title,n.agency,n.kind],keyword)).slice(0,25);
  return (
    <section className="businessOpportunityPanel" aria-labelledby="business-opportunity-title">
      <div className="businessOpportunityHeading">
        <span className="businessSupportEyebrow">MY BUSINESS · PUBLIC OPPORTUNITIES</span>
        <h2 id="business-opportunity-title">내 사업에 맞는 공공사업 기회</h2>
        <p>정부지원뿐 아니라 국가 R&D 과제와 공공입찰까지, 서로 다른 공고를 구분해 살펴봅니다.</p>
      </div>
      <div className="opportunityTabs" role="tablist" aria-label="공공사업 공고 유형">
        {OPPORTUNITY_TABS.map(row=>(
          <button id={"opportunity-tab-"+row.id} key={row.id} type="button"
            role="tab" aria-controls="opportunity-panel-content"
            aria-selected={tab===row.id} onClick={()=>{setTab(row.id);setKeyword("");}}>
            {row.label}
          </button>
        ))}
      </div>
      <div id="opportunity-panel-content" role="tabpanel"
        aria-labelledby={"opportunity-tab-"+tab} className="opportunityTabPanel">
        {tab==="support" && <BusinessSupportPanel enabled={enabled}/>}
        {tab!=="support" && (
          <>
            <label className="opportunitySearchLabel" htmlFor="opportunity-keyword">
              기술·사업 키워드로 찾기 <span>(목록 내 필터 · 추가 API 호출 없음)</span>
            </label>
            <input id="opportunity-keyword" className="opportunityKeyword"
              value={keyword} onChange={e=>setKeyword(e.target.value.slice(0,55))}
              placeholder="예: 재난, 안전, 전기, 침수, AI, 실증" maxLength={55}/>
            <div className="opportunityQuickTopics">
              {["재난","전기","침수","AI","전체"].map(value=>(
                <button type="button" key={value} onClick={()=>setKeyword(value==="전체"?"":value)}
                  aria-pressed={(value==="전체"?"":value)===keyword}>{value}</button>
              ))}
            </div>
          </>
        )}
        {tab==="rnd" && (
          <div className="opportunityResults">
            <div className="opportunitySourceLine">
              <span>출처: IRIS 공식 공고 + 기업마당에 등록된 R&D 관련 공고</span>
              <a href={irisUrl} target="_blank" rel="noopener noreferrer">IRIS 전체 공고 ↗</a>
            </div>
            {reference.map(n=>(
              <article className="opportunityNotice" key={n.id}>
                <div className="opportunityNoticeMeta">국가 R&D · {n.ministry} · {n.host}</div>
                <h3><a href={n.url} target="_blank" rel="noopener noreferrer">{n.title} ↗</a></h3>
                <p className="opportunityDeadline">접수기간: {n.opened}~{n.deadline} · 원문 최종 확인</p>
                <p className="opportunityScope">{n.scope}</p>
                <p className="opportunityCaution">{n.eligibilityCaveat}</p>
                <p className="opportunityReference">IRIS 원문 확인: {n.verificationDate} · 공고 수동 확인 사례이며 실시간 IRIS 수집 결과는 아닙니다.</p>
              </article>
            ))}
            {rndLoading&&<p className="opportunityNoticeState" role="status">기업마당의 R&D 관련 공고를 확인하는 중입니다…</p>}
            {rndError&&<p className="opportunityNoticeState" role="status">기업마당 자동조회: {rndError} IRIS 직접 공고는 위 링크에서 확인할 수 있습니다.</p>}
            {rndMatches.map(n=>(
              <article className="opportunityNotice" key={n.id}>
                <div className="opportunityNoticeMeta">기업마당 등록 R&D 관련 공고 · {n.agency}</div>
                <h3><a href={n.url} target="_blank" rel="noopener noreferrer">{n.title} ↗</a></h3>
                <p className="opportunityDeadline">신청기간: {n.applicationPeriod||"원문 확인 필요"}</p>
                <p className="opportunityCaution">제목·분야에 R&D 관련 표현이 포함되어 선별됐습니다. IRIS 접수 및 실제 기업 신청자격은 별도로 검증하세요.</p>
              </article>
            ))}
            {!rndLoading&&reference.length+rndMatches.length===0&&(
              <p className="opportunityNoticeState" role="status">
                현재 확인된 목록에서 일치하는 공고가 없습니다. 전국 R&D 공고가 없다는 의미는 아닙니다.
                <a href={irisUrl} target="_blank" rel="noopener noreferrer"> IRIS 사업공고에서 직접 검색 ↗</a>
              </p>
            )}
          </div>
        )}
        {tab==="b2g" && (
          <div className="opportunityResults">
            <div className="opportunitySourceLine">
              <span>출처: 조달청 나라장터 입찰공고정보서비스 (용역·물품·공사)</span>
              <a href={narajangteoUrl} target="_blank" rel="noopener noreferrer">나라장터 ↗</a>
            </div>
            {b2gLoading&&<p className="opportunityNoticeState" role="status">나라장터 실제 입찰 공고를 확인하고 있습니다…</p>}
            {b2gError&&(
              <div className="opportunityNoticeState" role="status">
                <strong>나라장터 연동 상태</strong>
                <p>{b2gError}</p>
                <a href={portalUrl} target="_blank" rel="noopener noreferrer">조달청 입찰공고 API 활용신청 ↗</a>
              </div>
            )}
            {b2g&&(
              <>
                <p className="opportunityCoverage">
                  {b2g.coveredFrom.slice(0,8)}~{b2g.coveredTo.slice(0,8)} 공고 등록일 기준 일부 목록,
                  최대 50건×3업무 / 6시간 캐시. 전체 입찰 검색이 아닙니다.
                  {b2g.partial&&" 일부 업무 조회가 실패해 결과가 불완전합니다."}
                </p>
                {b2gMatches.map(n=>(
                  <article className="opportunityNotice" key={n.kind+n.id}>
                    <div className="opportunityNoticeMeta">공공입찰 · {n.kind} · {n.agency}</div>
                    <h3>{n.title}</h3>
                    <p className="opportunityDeadline">공고번호: {n.id} · 마감: {n.deadline||"공고 원문 확인"}</p>
                    <a className="opportunityOfficialLink" href={n.originalUrl||narajangteoUrl}
                      target="_blank" rel="noopener noreferrer">
                      {n.originalUrl?"입찰공고 원문 열기 ↗":"나라장터에서 공고번호 조회 ↗"}
                    </a>
                  </article>
                ))}
                {b2gMatches.length===0&&<p className="opportunityNoticeState" role="status">
                  수집된 일부 입찰공고에서 조건에 맞는 건을 찾지 못했습니다. 전체 나라장터 입찰 부재를 뜻하지 않습니다.
                </p>}
              </>
            )}
          </div>
        )}
      </div>
      <p className="opportunityFooter">
        공고 유형별 모집·입찰 조건은 서로 다릅니다. 관련성은 참가자격 확정이 아니며,
        실제 공모·사업·입찰 여부와 상세 요건은 해당 기관 원문에서 확인해야 합니다.
      </p>
    </section>
  );
}
