"use client";
import Link from "next/link";
import type { PublicEvent } from "@/types/domain";
import { AppShell } from "./AppShell";
import { usePreferences } from "./preferences";
import { CATEGORY_LABELS, recommendationReason } from "@/lib/home/model";
import { useState } from "react";
export function EventDetail({ event }: { event: PublicEvent }) {
  const { preferences: prefs, update } = usePreferences(
    event.isMock ? "mock" : "live",
  );
  const [message, setMessage] = useState("");
  const saved = prefs.saved.includes(event.id);
  return (
    <AppShell>
      <div className="detailArticle">
        <Link className="backLink" href="/">
          ← Home
        </Link>
        {event.isMock && (
          <div className="trustNotice">
            <strong>DEMO</strong>
            <span>가상 Event · 실제 발표나 신청 정보가 아닙니다.</span>
          </div>
        )}
        <header className="detailIntro">
          <div className="eventMeta">
            {CATEGORY_LABELS[event.primaryCategory]} ·{" "}
            {new Intl.DateTimeFormat("ko-KR", {
              month: "long",
              day: "numeric",
              timeZone: "Asia/Seoul",
            }).format(new Date(event.lastSeenAt))}{" "}
            · 출처 {event.sourceCount}개
          </div>
          <h1>{event.representativeTitle}</h1>
          <p>{event.analysis.headlineSummary}</p>
          <button
            className="secondaryButton"
            aria-pressed={saved}
            onClick={() => {
              const durable = update({
                ...prefs,
                saved: saved
                  ? prefs.saved.filter((id) => id !== event.id)
                  : [...prefs.saved, event.id],
              });
              setMessage(
                durable
                  ? "저장 상태를 반영했습니다."
                  : "브라우저 저장이 제한되어 새로고침하면 초기화됩니다.",
              );
            }}
          >
            {saved ? "저장 취소" : "Event 저장"}
          </button>
          {message && <p role="status">{message}</p>}
        </header>
        <section className="detailSection">
          <div className="railEyebrow">01 · FACTS</div>
          <h2>
            {event.isMock ? "가상 시나리오의 핵심" : "출처에서 보고된 핵심"}
          </h2>
          <ul>
            {event.analysis.keyPoints.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
          {!event.isMock && (
            <p className="localStateNotice">
              AI가 정리한 내용입니다. 정책의 확정 여부와 적용 범위는 아래
              원문으로 확인하세요.
            </p>
          )}
        </section>
        <section className="detailSection">
          <div className="railEyebrow">02 · SIGNIFICANCE</div>
          <h2>왜 중요한가 · 해석</h2>
          <p>{event.analysis.whyItMatters}</p>
        </section>
        <section className="detailSection" id="perspectives">
          <div className="railEyebrow">03 · MULTIPLE PERSPECTIVES</div>
          <h2>다른 시선</h2>
          <p className="perspectiveGap">
            서로 다른 해석은 아직 검증되지 않았습니다. 확인된 출처를
            비교해보세요. 출처 수는 관점 수를 의미하지 않습니다.
          </p>
          {event.sources.map((source) => (
            <article className="sourcePerspective" key={source.id}>
              <div className="eventMeta">
                {source.sourceName} ·{" "}
                {source.sourceType === "GOVERNMENT"
                  ? "공식자료 출처"
                  : "보도 출처"}
                {event.isMock ? " (가상)" : ""}
              </div>
              <h3>{source.title}</h3>
              <p>
                {source.description ||
                  "요약 근거가 없어 원문 확인이 필요합니다."}
              </p>
              {!event.isMock && (
                <a href={source.url} target="_blank" rel="noopener noreferrer">
                  원문에서 관점 확인 ↗
                </a>
              )}
            </article>
          ))}
        </section>
        <section className="detailSection">
          <div className="railEyebrow">04 · OPEN QUESTIONS</div>
          <h2>아직 확인할 사항</h2>
          <p>{event.analysis.risk}</p>
          {event.analysis.opportunity && (
            <p>
              <strong>기회 · 추론</strong>
              <br />
              {event.analysis.opportunity}
            </p>
          )}
        </section>
        <section className="detailSection" id="sources">
          <div className="railEyebrow">05 · SOURCES</div>
          <h2>원문 출처</h2>
          {event.sources.map((source) => (
            <div className="originalSource" key={source.id}>
              <strong>{source.sourceName}</strong>
              <span>{source.title}</span>
              <time dateTime={source.publishedAt}>
                {new Intl.DateTimeFormat("ko-KR", {
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                  timeZone: "Asia/Seoul",
                }).format(new Date(source.publishedAt))}{" "}
                KST
              </time>
              {event.isMock ? (
                <small>가상 출처 · 원문 연결 없음</small>
              ) : (
                <a href={source.url} target="_blank" rel="noopener noreferrer">
                  원문 보기 ↗
                </a>
              )}
            </div>
          ))}
        </section>
        <section className="detailSection">
          <div className="railEyebrow">06 · FOR ME</div>
          <h2>나에게 중요한 이유</h2>
          <p>{recommendationReason(event, prefs)}.</p>
          <Link className="textLink" href="/?view=my">
            내 관심사 편집 →
          </Link>
        </section>
        <section className="detailSection" id="next">
          <div className="railEyebrow">07 · NEXT</div>
          <h2>다음에 확인할 것</h2>
          <ul>
            {event.analysis.followUp.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </section>
        <footer className="homeFooter">
          <span>하나의 사건, 여러 개의 시선.</span>
          <Link href="/">Home으로</Link>
        </footer>
      </div>
    </AppShell>
  );
}
