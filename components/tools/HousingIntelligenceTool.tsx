"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { analyzeHousing, type HousingInputs } from "@/lib/housing/scenario";
import styles from "@/app/tools/housing/housing.module.css";

type Worksheet = HousingInputs & {
  projectName: string;
  region: string;
  businessType: string;
};
const EMPTY: Worksheet = {
  projectName: "", region: "", businessType: "민간건설임대",
  units: "", absorptionPercent: "", salePriceEok: "", depositEok: "",
  monthlyRentMan: "", totalCostEok: "", equityEok: "", borrowingEok: "",
  annualRatePercent: "", borrowingMonths: "",
};
type NumericKey = keyof HousingInputs;
const money = (value: number | null, unit = "억원") =>
  value === null ? "—" : new Intl.NumberFormat("ko-KR", { maximumFractionDigits: 2 }).format(value) + " " + unit;

const REFERENCES = {
  market: [
    { name: "국토부 실거래가", url: "https://rt.molit.go.kr/", hint: "실거래·임대차 거래" },
    { name: "청약홈", url: "https://www.applyhome.co.kr/", hint: "분양·민간임대 공급 및 경쟁" },
    { name: "한국부동산원 R-ONE", url: "https://www.reb.or.kr/r-one/portal/openapi/openApiDevPage.do", hint: "부동산 통계" },
  ],
  policy: [
    { name: "HUG 주택사업금융(PF)보증", url: "https://m.khug.or.kr/hug/web/cg/pf/cgpf000001.jsp", hint: "사업자 대출에 대한 보증" },
    { name: "HUG 임대보증금보증", url: "https://www.khug.or.kr/hug/web/cg/sd/cgsd000001.jsp", hint: "임차인 보증금 반환 보호" },
    { name: "HF PF보증", url: "https://www.hf.go.kr/ko/sub02/sub02_04_05.do", hint: "별도 기관·별도 요건" },
    { name: "주택도시기금", url: "https://nhuf.molit.go.kr/", hint: "민간임대 건설자금 등 자금상품" },
  ],
};

function LabelledNumber({
  id, label, value, onChange, unit, note, step = "any",
}: {
  id: NumericKey; label: string; value: string; onChange: (key: NumericKey, value: string) => void;
  unit: string; note?: string; step?: string;
}) {
  return (
    <label className={styles.field}>
      <span>{label} <em>{unit}</em></span>
      <input name={id} type="number" inputMode="decimal" min="0" step={step}
        placeholder="직접 입력" value={value} onChange={e => onChange(id, e.target.value)} />
      {note && <small>{note}</small>}
    </label>
  );
}

function SourceLinks({ items }: { items: typeof REFERENCES.market }) {
  return (
    <div className={styles.sourceLinks}>
      {items.map(item => (
        <a key={item.url} href={item.url} target="_blank" rel="noopener noreferrer">
          <strong>{item.name} ↗</strong><small>{item.hint}</small>
        </a>
      ))}
    </div>
  );
}

export function HousingIntelligenceTool() {
  const [form, setForm] = useState<Worksheet>(EMPTY);
  const [feedback, setFeedback] = useState("");
  const result = useMemo(() => analyzeHousing(form), [form]);
  function update<Key extends keyof Worksheet>(key: Key, val: Worksheet[Key]) {
    setForm(old => ({ ...old, [key]: val }));
    setFeedback("");
  }
  function updateNumber(key: NumericKey, val: string) { update(key, val); }

  const report = [
    "NOAH ARK | 주거사업 인텔리전스 — 예비검토",
    "분석 대상: " + (form.projectName.trim() || "미입력"),
    "위치: " + (form.region.trim() || "미입력"),
    "검토 사업유형: " + form.businessType,
    "총세대수: " + (form.units || "미입력") + "세대",
    "가정된 계약/입주율: " + (form.absorptionPercent || "미입력") + "%",
    "계약/입주 세대 환산: " + (result.estimatedUnits === null ? "계산 불가" : result.estimatedUnits.toFixed(1) + "세대"),
    "[시장 시나리오: 동일한 가정하의 별도 현금흐름]",
    "일반분양 계약총액(비용 차감 전): " + money(result.grossSalesEok),
    "민간임대 보증금 총액(반환 채무, 매출 아님): " + money(result.refundableDepositsEok),
    "민간임대 월 총임대료(운영비 차감 전): " + money(result.grossMonthlyRentEok),
    "민간임대 연 총임대료(운영비 차감 전): " + money(result.grossAnnualRentEok),
    "[사업금융: 단순 산술]",
    "초기 조달차액(사업비-자기자본-차입): " + money(result.financingGapEok),
    "기간 단순이자(원금 전액 유지 가정): " + money(result.simplePeriodInterestEok),
    "[검토해야 할 사항]",
    "시장: 국토부 실거래·청약홈·R-ONE에서 동일 입지/면적/기간의 원문자료 확인",
    "보증: HUG PF와 임대보증금보증을 구분하고 사업자·시공사·사업단계별 현행요건 확인",
    "금융: HF PF·주택도시기금·취급은행에서 대상 여부, 한도, 금리, 취급 가능 여부 확인",
    "주의: 본 결과는 사용자 가정에 의한 참고 산술이며 실제 시장조사, 법규 검토, 대출심사 또는 사업수익성 평가가 아닙니다.",
    "원문: https://rt.molit.go.kr/ | https://www.applyhome.co.kr/ | https://www.khug.or.kr/ | https://www.hf.go.kr/ | https://nhuf.molit.go.kr/",
  ].join("\n");

  async function copyReport() {
    try {
      await navigator.clipboard.writeText(report);
      setFeedback("예비검토 메모를 복사했습니다.");
    } catch {
      setFeedback("복사 권한을 확인할 수 없습니다. 브라우저 설정을 확인하세요.");
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.intro}>
        <Link href="/?view=startup" className={styles.back}>← MY BUSINESS</Link>
        <p className={styles.eyebrow}>HOUSING INTELLIGENCE</p>
        <h1>주거사업 분석</h1>
        <p>분양시장, 공공보증·정책, 금융조건을 하나의 사업에서 함께 검토합니다.</p>
      </div>
      <div className={styles.notice} role="note">
        <strong>예비검토 · 실시간 연동 아님</strong>
        <span>현재는 직접 입력한 가정만 계산합니다. 거래·청약·보증상품·대출금리 자동조회와 승인 가능성 판단은 제공하지 않습니다. 입력정보는 서버에 전송하거나 저장하지 않습니다.</span>
      </div>
      <section className={styles.section} aria-labelledby="project-title">
        <header className={styles.sectionHead}>
          <span className={styles.step}>01</span>
          <div><h2 id="project-title">분석 사업 설정</h2><p>회사별 고객사업을 구분해 검토합니다.</p></div>
        </header>
        <div className={styles.fields}>
          <label className={styles.field}><span>사업명 <em>선택</em></span>
            <input value={form.projectName} maxLength={80} placeholder="예: ○○지역 공동주택" onChange={e => update("projectName", e.target.value)} /></label>
          <label className={styles.field}><span>대상지역 <em>시·군·구</em></span>
            <input value={form.region} maxLength={60} placeholder="예: 인천광역시 미추홀구" onChange={e => update("region", e.target.value)} /></label>
          <label className={styles.field}><span>검토할 공급 형태</span>
            <select value={form.businessType} onChange={e => update("businessType", e.target.value)}>
              <option>일반분양</option><option>민간건설임대</option><option>민간매입임대</option>
              <option>공공지원민간임대</option><option>기타 · 원문 분류 필요</option>
            </select></label>
          <LabelledNumber id="units" label="총 공급세대" unit="세대" step="1" value={form.units} onChange={updateNumber} />
          <LabelledNumber id="absorptionPercent" label="예상 계약·입주율" unit="%" value={form.absorptionPercent} onChange={updateNumber} note="0~100, 직접 설정한 가정이며 시장 조사 결과가 아닙니다." />
        </div>
      </section>
      <section className={styles.section} aria-labelledby="market-title">
        <header className={styles.sectionHead}>
          <span className={styles.step}>02</span>
          <div><h2 id="market-title">시장분석과 사업구조 비교</h2><p>같은 사업지에서 분양과 임대의 수익 흐름을 따로 살펴봅니다.</p></div>
        </header>
        <SourceLinks items={REFERENCES.market} />
        <p className={styles.minor}>현재 원문 조회용 링크입니다. 지역별 통계·입주예정·미분양·경쟁단지 데이터가 자동 입력되는 것은 아닙니다.</p>
        <div className={styles.fields}>
          <LabelledNumber id="salePriceEok" label="세대당 일반분양가" unit="억원" value={form.salePriceEok} onChange={updateNumber} />
          <LabelledNumber id="depositEok" label="세대당 임대보증금" unit="억원" value={form.depositEok} onChange={updateNumber} />
          <LabelledNumber id="monthlyRentMan" label="세대당 월 임대료" unit="만원" value={form.monthlyRentMan} onChange={updateNumber} />
        </div>
        <div className={styles.results}>
          <div><small>일반분양 계약총액</small><strong>{money(result.grossSalesEok)}</strong><span>매출 추정 · 비용 차감 전</span></div>
          <div><small>임대보증금 총액</small><strong>{money(result.refundableDepositsEok)}</strong><span>반환 채무 · 매출 아님</span></div>
          <div><small>월 총임대료</small><strong>{money(result.grossMonthlyRentEok)}</strong><span>운영비·공실비 차감 전</span></div>
          <div><small>연 총임대료</small><strong>{money(result.grossAnnualRentEok)}</strong><span>월 총임대료 × 12</span></div>
        </div>
        <p className={styles.minor}>표시액은 사용자 입력 계약·입주율 가정에 따라 계산합니다. 분양계약액과 임대보증금을 직접 비교해 수익성을 결론내릴 수 없습니다.</p>
      </section>
      <section className={styles.section} aria-labelledby="policy-title">
        <header className={styles.sectionHead}>
          <span className={styles.step}>03</span>
          <div><h2 id="policy-title">공공정책 · 보증 검토</h2><p>보증 목적별로 원문요건과 사업단계를 확인합니다.</p></div>
        </header>
        <SourceLinks items={REFERENCES.policy} />
        <div className={styles.checks}>
          <strong>확인이 필요한 사항</strong>
          <p>① 사업계획승인·건축허가 및 임대사업 유형 ② 시행사·시공사의 자격 및 신용 ③ 자기자본 선투입·신탁 요건 ④ 보증상품의 목적과 금융기관 협약 여부 ⑤ 공고·약관·금리 적용일</p>
          <p>HUG의 PF보증, 임대보증금보증, HF의 PF보증 및 주택도시기금 대출은 서로 다른 제도입니다. 여기서는 적용 가능 여부를 판정하지 않습니다.</p>
        </div>
      </section>
      <section className={styles.section} aria-labelledby="finance-title">
        <header className={styles.sectionHead}>
          <span className={styles.step}>04</span>
          <div><h2 id="finance-title">자금조달 검토</h2><p>입력한 차입조건의 비용과 초기 재원 차액만 계산합니다.</p></div>
        </header>
        <div className={styles.fields}>
          <LabelledNumber id="totalCostEok" label="총사업비" unit="억원" value={form.totalCostEok} onChange={updateNumber} />
          <LabelledNumber id="equityEok" label="선투입 자기자본" unit="억원" value={form.equityEok} onChange={updateNumber} />
          <LabelledNumber id="borrowingEok" label="가정한 차입원금" unit="억원" value={form.borrowingEok} onChange={updateNumber} />
          <LabelledNumber id="annualRatePercent" label="가정한 차입 연금리" unit="%" value={form.annualRatePercent} onChange={updateNumber} />
          <LabelledNumber id="borrowingMonths" label="전액 차입 유지기간" unit="개월" value={form.borrowingMonths} onChange={updateNumber} />
        </div>
        <div className={styles.results}>
          <div><small>초기 자금조달 차액</small><strong>{money(result.financingGapEok)}</strong><span>사업비 − 자기자본 − 차입금 (양수: 부족)</span></div>
          <div><small>기간 단순 이자비용</small><strong>{money(result.simplePeriodInterestEok)}</strong><span>원금 전액 × 연금리 × 개월/12</span></div>
        </div>
        <p className={styles.minor}>보증금은 이 계산에 자동 충당하지 않습니다. PF 실행시점, 대출원금 상환, 보증료·수수료·세금·원가 변동은 반영되지 않았습니다.</p>
      </section>
      <section className={styles.summary} aria-labelledby="outcome-title">
        <div><p className={styles.eyebrow}>CONSULTANT REVIEW NOTE</p>
          <h2 id="outcome-title">사업 검토 메모</h2>
          <p>숫자가 없는 항목은 ‘—’로 유지합니다. 원문과 함께 전문가가 검증한 뒤 고객에게 전달하세요.</p></div>
        <div className={styles.actions}>
          <button type="button" onClick={copyReport}>검토메모 복사 ↗</button>
          <button type="button" onClick={() => window.print()}>화면 인쇄</button>
        </div>
        <p className={styles.feedback} role="status" aria-live="polite">{feedback}</p>
      </section>
    </div>
  );
}
