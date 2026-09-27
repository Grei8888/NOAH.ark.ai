"use client";

import { useMemo, useState } from "react";
import type { NoahEvent } from "@/types/news";

const categories: Record<string, string> = {
  POLICY: "정책", REAL_ESTATE: "부동산", FINANCE: "금융",
  AI_TECH: "AI·기술", NEURO_EDU: "교육", REGIONAL: "지역", OTHER: "기타"
};

export function MorningReview({ events }: { events: NoahEvent[] }) {
  const [excluded, setExcluded] = useState<string[]>([]);
  const [reviewed, setReviewed] = useState(false);
  const [copied, setCopied] = useState(false);
  const included = useMemo(() => events.filter(event => !excluded.includes(event.id)), [events, excluded]);
  const toggle = (id: string) => {
    setReviewed(false);
    setCopied(false);
    setExcluded(current => current.includes(id) ? current.filter(value => value !== id) : [...current, id]);
  };
  const shareText = [
    "NOAH | 아침 핵심 브리핑 [데모 데이터 — 공유 금지]",
    ...included.slice(0, 3).map((event, i) =>
      `${i + 1}. ${event.representativeTitle}\n${event.headlineSummary}\n${event.sources[0]?.url ?? "출처 확인 필요"}`
    ),
    "※ 이 화면은 실제 뉴스가 아닌 테스트 데이터입니다."
  ].join("\n\n");

  return (
    <main className="reviewShell">
      <p className="reviewEyebrow">NOAH MORNING BRIEF · REVIEW DEMO</p>
      <h1>오늘의 보고서 검토</h1>
      <div className="reviewWarning" role="alert">
        현재는 모의 뉴스 기반 화면입니다. 승인 버튼은 검토 UI만 시험하며 실제 발행·메일·카카오톡 전송을 하지 않습니다.
      </div>
      <p className="reviewIntro">지하철에서 제목과 요약을 확인하고 제외할 사건을 선택하세요. 최종 자동 발행은 실뉴스 연동 후 활성화합니다.</p>
      <div className="reviewSummary" aria-live="polite">
        <strong>{included.length}건 포함</strong><span>{excluded.length}건 제외</span>
      </div>
      <div className="reviewItems">
        {events.map(event => {
          const removed = excluded.includes(event.id);
          return (
            <article className={`reviewItem ${removed ? "reviewItemExcluded" : ""}`} key={event.id}>
              <div className="reviewMeta">{categories[event.primaryCategory] ?? event.primaryCategory} · {event.grade}</div>
              <h2>{event.representativeTitle}</h2>
              <p>{event.headlineSummary}</p>
              <details><summary>근거 및 검토 정보</summary>
                <p><strong>중요성:</strong> {event.whyItMatters}</p>
                <p><strong>관련성:</strong> {event.userImplication}</p>
                <ul>{event.sources.map((source, i) => <li key={i}><a href={source.url} target="_blank" rel="noopener noreferrer">{source.sourceName}: {source.title}</a></li>)}</ul>
              </details>
              <button type="button" className={removed ? "reviewRestore" : "reviewExclude"} onClick={() => toggle(event.id)}>
                {removed ? "다시 포함" : "이번 보고서에서 제외"}
              </button>
            </article>
          );
        })}
      </div>
      <div className="reviewActions">
        <button type="button" onClick={() => setReviewed(true)} disabled={included.length === 0}>
          {reviewed ? "검토 완료 ✓ (데모)" : "선택한 항목 검토 완료"}
        </button>
        <button type="button" className="reviewSecondary" disabled={!reviewed || included.length === 0}
          onClick={async () => {
            try { await navigator.clipboard.writeText(shareText); setCopied(true); }
            catch { setCopied(false); }
          }}>
          {copied ? "데모 문구 복사됨" : "카카오톡용 문구 복사 (데모)"}
        </button>
        <p>실제 공유용 문구와 PDF는 실뉴스 검증 및 Drive 연동 후 제공됩니다.</p>
      </div>
    </main>
  );
}
