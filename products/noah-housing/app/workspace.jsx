"use client";

import { useMemo, useState } from "react";
import { EMPTY, analyze, fmt } from "../lib/scenario.mjs";

const LINKS = {
  market: [
    ["국토교통부 실거래가 공개시스템", "https://rt.molit.go.kr/", "거래가격·임대차 자료"],
    ["한국부동산원 R-ONE", "https://www.reb.or.kr/r-one/", "부동산 통계·지역 흐름"],
    ["청약홈", "https://www.applyhome.co.kr/", "주택공급·청약 관련 정보"],
  ],
  programs: [
    ["주택도시보증공사 HUG", "https://www.khug.or.kr/", "PF보증과 임대보증금보증을 구분하여 검토"],
    ["한국주택금융공사 HF", "https://www.hf.go.kr/", "사업자 관련 보증상품 원문 확인"],
    ["주택도시기금", "https://nhuf.molit.go.kr/", "임대주택 건설 관련 자금상품 확인"],
  ],
};
const initial = { ...EMPTY, name:"", city:"", type:"민간건설임대" };
function NumberInput({label,field,unit,form,setField,hint}) {
  return <label className="field">
    <span>{label}<small>{unit}</small></span>
    <input min="0" max={field==="absorptionPercent" ? "100" : undefined} step={field==="units"?"1":"any"}
      name={field} inputMode="decimal" type="number" value={form[field]}
      placeholder="직접 입력" onChange={e=>setField(field,e.target.value)} />
    {hint && <em>{hint}</em>}
  </label>;
}
function SourceList({items}) {
  return <div className="sources">
    {items.map(([name,url,description])=>
      <a key={url} href={url} target="_blank" rel="noopener noreferrer" className="source">
        <span>{name}<b aria-hidden="true">↗</b></span>
        <small>{description}</small>
      </a>
    )}
  </div>;
}
function Result({label,value,detail}) {
  return <div className="result"><span>{label}</span><strong>{fmt(value)}</strong><small>{detail}</small></div>;
}
export default function HousingWorkspace({arkUrl}) {
  const [form,setForm]=useState(initial);
  const [notice,setNotice]=useState("");
  const results=useMemo(()=>analyze(form),[form]);
  function change(field,value) { setForm(old=>({...old,[field]:value})); setNotice(""); }
  function memo() {
    const lines=[
      "NOAH Housing Intelligence | 예비검토 메모",
      "사업명: "+(form.name||"미입력"),"지역: "+(form.city||"미입력"),"유형: "+form.type,
      "총세대수: "+(form.units||"미입력")+"세대",
      "가정 계약·입주율: "+(form.absorptionPercent||"미입력")+"%",
      "계약·입주 환산세대: "+(results.effectiveUnits===null?"계산 불가":results.effectiveUnits.toFixed(1)+"세대"),
      "일반분양 계약총액(비용 전): "+fmt(results.grossSaleEok),
      "임대보증금 반환의무액(매출 아님): "+fmt(results.refundableDepositEok),
      "월 총임대료(비용 전): "+fmt(results.grossMonthlyRentEok),
      "연 총임대료(비용 전): "+fmt(results.grossAnnualRentEok),
      "초기 자금조달 차액: "+fmt(results.fundingGapEok),
      "원금 전액 가정 단순 이자: "+fmt(results.simpleInterestEok),
      "HOME:LINK 수요정보: 연동되지 않음",
      "자료 검토: 국토부 실거래가·R-ONE·청약홈·HUG·HF·주택도시기금의 원문과 현재 적용 요건을 별도 검증",
      "본 수치는 사용자 입력에 의한 시나리오 산술이며, 사업타당성·인허가·보증·대출 가능성 판단이 아닙니다.",
    ];
    return lines.join("\n");
  }
  async function copyMemo() {
    try { await navigator.clipboard.writeText(memo()); setNotice("예비검토 메모를 복사했습니다."); }
    catch { setNotice("클립보드를 사용할 수 없습니다. 브라우저 권한을 확인하세요."); }
  }
  return <div className="site">
    <header className="topbar">
      <a className="brand" href="/" aria-label="NOAH Housing Intelligence 홈"><span className="brandmark">N</span><span>NOAH<span className="dot">.</span><small>HOUSING INTELLIGENCE</small></span></a>
      <nav aria-label="제품 메뉴"><a href="#workspace">사업 분석</a><a href="#sources">정보 출처</a><a href="#network">연계 서비스</a></nav>
      <span className="version">WORKSPACE v0.1</span>
    </header>

    <main>
      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow"><span className="pin"/> RESIDENTIAL BUSINESS INTELLIGENCE</div>
          <h1>주거사업의 판단을<br/><span>더 명료하게.</span></h1>
          <p>시장 정보, 공공보증, 금융구조를 연결하여<br/>일반분양과 민간임대의 사업 검토를 돕습니다.</p>
          <a className="primary-button" href="#workspace">사업 분석 시작 <span>↘</span></a>
        </div>
        <div className="hero-aside">
          <div className="caption">SINGLE PROJECT · THREE PERSPECTIVES</div>
          <div><span>01</span><strong>시장성</strong><small>거래 · 공급 · 임대수요</small></div>
          <div><span>02</span><strong>공공보증·정책</strong><small>HUG · HF · 주택도시기금</small></div>
          <div><span>03</span><strong>자금조달</strong><small>자기자본 · 차입 · 금융비용</small></div>
          <p>외부기관 데이터 자동조회와 실제 대출조건 반영은 아직 제공하지 않습니다.</p>
        </div>
      </section>

      <section id="workspace" className="workbench">
        <div className="section-heading">
          <div><div className="eyebrow">01 / ADVISORY WORKSPACE</div><h2>사업 예비검토</h2>
          <p>사업 조건을 직접 입력해 서로 다른 현금흐름을 비교합니다. 입력값은 서버에 저장되지 않습니다.</p></div>
          <span className="status">직접 입력 · 자동 검증 아님</span>
        </div>
        <section className="panel">
          <header><b>01</b><div><h3>사업 개요</h3><p>공급형태와 계산 기준을 설정합니다.</p></div></header>
          <div className="inputs">
            <label className="field"><span>사업명 <small>선택</small></span>
              <input maxLength={80} value={form.name} placeholder="예: ○○역세권 공동주택" onChange={e=>change("name",e.target.value)} /></label>
            <label className="field"><span>사업 지역</span>
              <input maxLength={80} value={form.city} placeholder="예: 인천 미추홀구" onChange={e=>change("city",e.target.value)} /></label>
            <label className="field"><span>사업 유형</span>
              <select value={form.type} onChange={e=>change("type",e.target.value)}>
                <option>일반분양</option><option>민간건설임대</option><option>민간매입임대</option><option>공공지원민간임대</option><option>기타</option>
              </select></label>
            <NumberInput label="공급세대수" field="units" unit="세대" form={form} setField={change}/>
            <NumberInput label="가정 계약·입주율" field="absorptionPercent" unit="%" form={form} setField={change} hint="0~100%, 사용자 가정"/>
          </div>
        </section>

        <section className="panel">
          <header><b>02</b><div><h3>분양·임대 비교</h3><p>분양계약액, 반환할 임대보증금, 임대료를 구분합니다.</p></div></header>
          <div className="inputs">
            <NumberInput label="세대당 일반분양가" field="salePriceEok" unit="억원" form={form} setField={change}/>
            <NumberInput label="세대당 임대보증금" field="depositEok" unit="억원" form={form} setField={change}/>
            <NumberInput label="세대당 월 임대료" field="monthlyRentMan" unit="만원" form={form} setField={change}/>
          </div>
          <div className="results">
            <Result label="일반분양 계약총액" value={results.grossSaleEok} detail="매출액 추정 · 비용 차감 전"/>
            <Result label="임대보증금 총액" value={results.refundableDepositEok} detail="반환 채무 · 매출 아님"/>
            <Result label="월 임대료 합계" value={results.grossMonthlyRentEok} detail="공실·운영비 차감 전"/>
            <Result label="연 임대료 합계" value={results.grossAnnualRentEok} detail="월 총임대료 × 12"/>
          </div>
          <p className="method">같은 계약·입주율 가정을 적용한 단순 비교입니다. 보증금은 분양 매출이나 순이익에 포함하지 않으며, 이를 근거로 두 사업방식의 우열을 판단할 수 없습니다.</p>
        </section>

        <section className="panel">
          <header><b>03</b><div><h3>사업금융 가정</h3><p>자금조달 차액과 단순 이자부담을 계산합니다.</p></div></header>
          <div className="inputs">
            <NumberInput label="총사업비" field="totalCostEok" unit="억원" form={form} setField={change}/>
            <NumberInput label="자기자본" field="equityEok" unit="억원" form={form} setField={change}/>
            <NumberInput label="차입원금" field="borrowingEok" unit="억원" form={form} setField={change}/>
            <NumberInput label="가정 연금리" field="annualRatePercent" unit="%" form={form} setField={change}/>
            <NumberInput label="차입 유지기간" field="borrowingMonths" unit="개월" form={form} setField={change}/>
          </div>
          <div className="results two">
            <Result label="초기 자금조달 차액" value={results.fundingGapEok} detail="사업비 − 자기자본 − 차입금 (양수: 부족)"/>
            <Result label="기간 단순이자" value={results.simpleInterestEok} detail="차입원금 × 연금리 × 기간/12"/>
          </div>
          <p className="method">차입 시점·분할 실행·상환·보증료·수수료·세금은 반영되지 않았습니다. 금융기관의 상품 금리나 보증 승인 가능성을 예측하지 않습니다.</p>
        </section>
        <div className="actions">
          <div><strong>컨설턴트 검토 메모</strong><p>결과와 확인 필요사항을 예비검토 문장으로 정리합니다.</p></div>
          <button onClick={copyMemo} type="button">메모 복사 ↗</button>
          <button className="outline" onClick={()=>window.print()} type="button">인쇄</button>
        </div>
        <div role="status" aria-live="polite" className="status-line">{notice}</div>
      </section>

      <section id="sources" className="section sources-section">
        <div className="section-heading"><div><div className="eyebrow">02 / EVIDENCE FIRST</div><h2>검토해야 할 원문</h2>
          <p>원문을 우선하며 지원·보증·대출 적격성은 별도로 확인합니다.</p></div></div>
        <div className="source-columns">
          <div className="source-panel"><h3>시장·공급</h3><SourceList items={LINKS.market}/></div>
          <div className="source-panel"><h3>보증·금융</h3><SourceList items={LINKS.programs}/></div>
        </div>
        <p className="method">기관별 제도는 서로 독립적인 상품입니다. HUG PF보증과 임대보증금보증을 동일한 지원금으로 처리하지 않습니다. 상세 요건은 해당 기관의 최신 원문을 확인해야 합니다.</p>
      </section>

      <section id="network" className="section network">
        <div className="eyebrow">03 / CONNECTED INTELLIGENCE</div><h2>연결될수록 깊어지는 판단</h2>
        <p className="network-intro">시장에 나타난 변화부터 공급자의 판단과 실제 입주 수요까지. 서비스별 역할을 유지하며 연결합니다.</p>
        <div className="network-grid">
          <div className="network-card"><span className="network-index">01 · SIGNALS</span><strong>NOAH ARK</strong>
            <p>기사와 정책의 중요한 변화를 발견합니다.</p>
            {arkUrl ? <a href={arkUrl} target="_blank" rel="noopener noreferrer">NOAH ARK 열기 ↗</a> : <span className="muted">서비스 연결 URL 미설정</span>}
          </div>
          <div className="network-card current"><span className="network-index">02 · ADVISORY</span><strong>NOAH Housing</strong>
            <p>공급자의 사업성·보증·금융구조를 검토합니다.</p><span>현재 화면</span></div>
          <div className="network-card"><span className="network-index">03 · DEMAND</span><strong>HOME:LINK</strong>
            <p>입주 수요와 주택을 연결하는 별도 서비스입니다. 향후 검증된 집계 신호를 주거사업 분석에 연동합니다.</p>
            <span className="muted">수요 데이터 연동 준비 중 · 실제 데이터 없음</span></div>
        </div>
      </section>
    </main>
    <footer><span>NOAH HOUSING INTELLIGENCE</span><span>ONLY WHAT MATTERS. · EVIDENCE BEFORE CONCLUSION.</span><span>예비검토 v0.1</span></footer>
  </div>;
}
