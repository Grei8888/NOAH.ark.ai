"use client";

import { useState } from "react";
import Link from "next/link";
import { READER_MODES, type ReaderMode } from "@/lib/news/reader-companion";
import type { NewsSearchItem, NewsSearchTopic } from "@/lib/news/news-search-contract";

type ResponseBody = { answer?: unknown; error?: unknown; note?: unknown };
export type SelectedNews = { item: NewsSearchItem; topic: NewsSearchTopic };

export function NewsInlineCompanion({
  selected, modelReady, labAvailable,
}: {
  selected: SelectedNews | null;
  modelReady: boolean;
  labAvailable: boolean;
}) {
  const [mode, setMode] = useState<ReaderMode>("terms");
  const [question, setQuestion] = useState<string>(READER_MODES[0].hint);
  const [inviteCode, setInviteCode] = useState("");
  const [pending, setPending] = useState(false);
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState("");

  const modes = READER_MODES;

  function changeMode(next: ReaderMode) {
    setMode(next);
    setQuestion(modes.find(row => row.id === next)!.hint);
    setAnswer("");
    setError("");
  }

  async function submitQuestion() {
    if (!selected || !modelReady || pending) return;
    if (inviteCode.length < 32 || question.trim().length < 4 || question.trim().length > 380) {
      setError("테스터 초대 코드와 4~380자의 질문을 확인해 주세요.");
      return;
    }
    setPending(true);
    setAnswer("");
    setError("");
    try {
      // Reuse the exact real AI endpoint from the 10-reader lab, not a mock.
      // The server receives only the selected headline and user's question,
      // never the publisher's URL, body or imagery.
      const response = await fetch("/api/lab/reader", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-noah-lab-token": inviteCode,
        },
        body: JSON.stringify({ headline: selected.item.title, mode, question: question.trim() }),
        cache: "no-store",
        signal: AbortSignal.timeout(18000),
      });
      const data: ResponseBody = await response.json();
      if (!response.ok || typeof data.answer !== "string" || !data.answer.trim()) {
        throw new Error(typeof data.error === "string" ? data.error : "AI의 답변을 확인하지 못했습니다.");
      }
      setAnswer(data.answer.slice(0, 4500));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "AI에 연결할 수 없습니다.");
    } finally {
      setPending(false);
    }
  }

  return (
    <aside className="newsAiCompanion" aria-label="기사별 NOAH AI 뉴스 파트너">
      <div className="newsAiCompanionHeader">
        <div>
          <span className="newsAiEyebrow">NOAH · READING PARTNER</span>
          <h3>읽고, 이해하고, 질문하기</h3>
        </div>
        <span className="newsAiAvailability">{modelReady ? "AI 테스트 연결" : "AI 연결 대기"}</span>
      </div>

      {!selected ? (
        <div className="newsAiEmpty" role="status">
          <span className="newsAiEmptyNumber" aria-hidden="true">01 / 02</span>
          <strong>어떤 기사가 궁금하세요?</strong>
          <p>왼쪽 뉴스에서 <b>AI에게 질문</b>을 누르세요. 해당 기사를 요약하는 대신 경제용어와 배경, 검토할 질문을 함께 살펴봅니다.</p>
        </div>
      ) : (
        <>
          <div className="newsAiSelected" aria-live="polite">
            <span>선택한 기사 · {selected.item.sourceName}</span>
            <strong>{selected.item.title}</strong>
            <a href={selected.item.url} target="_blank" rel="noopener noreferrer">기사 원문 직접 읽기 ↗</a>
          </div>
          <p className="newsAiDescription">원문을 먼저 읽어도 좋고, 이해가 어려운 용어부터 질문해도 됩니다. 다른 관점의 기사 읽기는 선택입니다.</p>
        </>
      )}

      <fieldset className="newsAiModes" disabled={!selected || pending}>
        <legend>어떤 도움이 필요한가요?</legend>
        <div className="newsAiModeButtons">
          {modes.map(item => (
            <button key={item.id} type="button" aria-pressed={mode === item.id}
              onClick={() => changeMode(item.id)}>{item.label}</button>
          ))}
        </div>
      </fieldset>

      <label className="newsAiLabel" htmlFor="newsAiQuestion">NOAH AI에게 질문</label>
      <textarea id="newsAiQuestion" rows={4} maxLength={380}
        disabled={!selected || pending} value={question}
        onChange={event => setQuestion(event.target.value)}
        placeholder="모르는 용어나 궁금한 경제·정책 배경을 질문해 보세요." />

      {labAvailable && (
        <>
          <label className="newsAiLabel" htmlFor="newsAiInvite">테스터 초대 코드 <small>브라우저에 저장되지 않습니다</small></label>
          <input id="newsAiInvite" type="password" autoComplete="off" maxLength={256}
            value={inviteCode} disabled={pending}
            onChange={event => setInviteCode(event.target.value)}
            placeholder="개별 발급 코드" />
        </>
      )}

      {!modelReady && (
        <p className="newsAiDisabled" role="status">
          현재 OpenAI API가 연결되지 않아 실제 AI 답변은 제공되지 않습니다.
          기사 선택과 질문 화면은 미리 확인할 수 있습니다.
        </p>
      )}
      <button className="newsAiSubmit" type="button" onClick={() => void submitQuestion()}
        disabled={!selected || !modelReady || pending || question.trim().length < 4 || inviteCode.length < 32}>
        {pending ? "NOAH가 살펴보는 중…" : modelReady ? "AI에게 물어보기 ↗" : "AI 연결 대기"}
      </button>

      {(answer || error) && (
        <section className="newsAiAnswer" aria-live="polite" aria-label="NOAH AI 응답">
          <strong>{error ? "연결 확인" : "NOAH AI · 독해 도움말"}</strong>
          <p role={error ? "alert" : undefined}>{error || answer}</p>
        </section>
      )}
      {selected && labAvailable && (
        <Link className="newsAiFullReader"
          href={`/lab/reader?topic=${selected.topic}&news=${encodeURIComponent(selected.item.url)}`}>
          원문과 AI를 나란히 보는 독해 모드 ↗
        </Link>
      )}
      <p className="newsAiFootnote">
        NOAH는 기사 본문을 읽거나 재게시하지 않습니다. 실제 AI 답변은 선택된 제목과 질문을 바탕으로 제공되며 원문 근거는 사용자가 확인해야 합니다.
      </p>
    </aside>
  );
}
