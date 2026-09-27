"use client";
import { useMemo, useState } from "react";
import type { NoahEvent } from "@/types/news";
import "./morning-review.css";

const categories: Record<string,string> = {POLICY:"정책",REAL_ESTATE:"부동산",FINANCE:"금융",AI_TECH:"AI·산업",NEURO_EDU:"교육",REGIONAL:"지역",OTHER:"기타"};
const filters = ["전체", "정책", "부동산", "금융", "AI·산업", "교육", "지역", "기타"];
export function MorningReview({ events }: { events: NoahEvent[] }) {
  const [excluded,setExcluded] = useState<string[]>([]);
  const [filter,setFilter] = useState("전체");
  const [selected,setSelected] = useState<NoahEvent|null>(null);
  const [reviewed,setReviewed] = useState(false);
  const [copied,setCopied] = useState(false);
  const included = useMemo(()=>events.filter(e=>!excluded.includes(e.id)),[events,excluded]);
  const visible = events.filter(e=>filter==="전체"||categories[e.primaryCategory]===filter);
  const toggle = (id:string) => {setExcluded(old=>old.includes(id)?old.filter(x=>x!==id):[...old,id]);setReviewed(false);setCopied(false);};
  const shareText = ["NOAH | 아침 브리핑 [데모 — 공유 금지]",...included.slice(0,3).map((e,i)=>`${i+1}. ${e.representativeTitle}\n${e.headlineSummary}\n${e.sources[0]?.url??"출처 확인 필요"}`),"※ 실제 뉴스가 아닌 테스트 데이터입니다."].join("\n\n");
  return <main className="noahReview">
    <header className="nrTop"><div className="nrBrand">NOAH<span> MORNING BRIEF</span></div><span className="nrMode">REVIEW DEMO</span></header>
    <div className="nrNotice" role="alert">테스트 데이터입니다. 검토 완료와 복사는 실제 발행이나 카카오톡 전송을 실행하지 않습니다.</div>
    {selected ? <section className="nrDetail">
      <button type="button" className="nrBack" onClick={()=>setSelected(null)}>← 목록으로</button>
      <div className="nrMeta"><span className="nrTag">{categories[selected.primaryCategory]}</span><span>중요도 {selected.importanceScore} / 100</span></div>
      <h1>{selected.representativeTitle}</h1><p className="nrLead">{selected.headlineSummary}</p>
      <section className="nrPanel"><h2>핵심 요약</h2><ul>{selected.keyPoints.map((point,i)=><li key={i}>{point}</li>)}</ul></section>
      <section className="nrPanel"><h2>우리 업무에 미치는 영향</h2><p>{selected.userImplication}</p><h3>왜 중요한가</h3><p>{selected.whyItMatters}</p></section>
      <section className="nrPanel"><h2>다음 확인 사항</h2><ul>{selected.followUp.map((item,i)=><li key={i}>{item}</li>)}</ul></section>
      <section className="nrSources"><h2>근거 기사</h2>{selected.sources.map((s,i)=><a key={i} href={s.url} target="_blank" rel="noopener noreferrer">{s.sourceName} · {s.title} ↗</a>)}</section>
      <div className="nrDetailActions"><button type="button" onClick={()=>{toggle(selected.id);setSelected(null);}} className="nrOutline">{excluded.includes(selected.id)?"다시 포함":"제외하기"}</button><button type="button" onClick={()=>setSelected(null)}>목록으로</button></div>
    </section> : <>
      <div className="nrHero"><div className="nrDate">{new Intl.DateTimeFormat("ko-KR",{dateStyle:"full",timeZone:"Asia/Seoul"}).format(new Date())}</div><h1>오늘의 인텔리전스</h1><p>세상의 변화를, 우리의 기회로.</p></div>
      <div className="nrStats"><div><small>분석 사건</small><strong>{events.length}<em> 건</em></strong></div><div><small>검토 대상</small><strong>{included.length}<em> 건</em></strong></div><div><small>제외</small><strong>{excluded.length}<em> 건</em></strong></div></div>
      <nav className="nrFilters" aria-label="뉴스 카테고리">{filters.map(f=><button key={f} type="button" aria-pressed={filter===f} className={filter===f?"active":""} onClick={()=>setFilter(f)}>{f}</button>)}</nav>
      <div className="nrEvents">{visible.length===0?<p>해당 카테고리의 사건이 없습니다.</p>:visible.map(e=><article key={e.id} className={`nrEvent ${excluded.includes(e.id)?"isExcluded":""}`}>
        <button type="button" className="nrEventMain" onClick={()=>setSelected(e)} aria-label={e.representativeTitle+" 상세 보기"}>
          <div className="nrEventMeta"><span className="nrTag">{categories[e.primaryCategory]}</span><span className="nrScore">{Math.round(e.finalScore)}</span></div>
          <h2>{e.representativeTitle}</h2><p>{e.headlineSummary}</p><small>{e.sources[0]?.sourceName??"출처 확인 필요"} · 근거 {e.sourceCount}개</small>
        </button>
        <button type="button" className="nrSelect" aria-pressed={!excluded.includes(e.id)} aria-label={e.representativeTitle+(excluded.includes(e.id)?" 포함":" 제외")} onClick={()=>toggle(e.id)}>{excluded.includes(e.id)?"＋":"✓"}</button>
      </article>)}</div>
      <div className="nrBottom"><div><strong>선택 {included.length} / {events.length}</strong><span>{reviewed?"검토 완료 (데모)":"보고서 검토 중"}</span></div><button type="button" disabled={included.length===0} onClick={()=>setReviewed(true)}>{reviewed?"검토 완료 ✓":"검토 완료 →"}</button></div>
      {reviewed&&<div className="nrCopy"><button type="button" onClick={async()=>{try{await navigator.clipboard.writeText(shareText);setCopied(true);}catch{setCopied(false);}}}>{copied?"데모 문구 복사됨":"카카오톡용 문구 복사 (데모)"}</button></div>}
    </>}
  </main>;
}
