"use client";

import { useEffect, useState } from "react";
import { readBetaInvitation, forgetBetaInvitation } from "@/lib/news/beta-invitation";
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
  const [inviteLinked, setInviteLinked] = useState(false);
  useEffect(() => {
    const code = readBetaInvitation();
    if (!code) return;
    queueMicrotask(() => { setInviteCode(code); setInviteLinked(true); });
  }, []);
  const [pending, setPending] = useState(false);
  const [answerState, setAnswerState] = useState<{ url: string; value: string } | null>(null);
  const [errorState, setErrorState] = useState<{ url: string; value: string } | null>(null);
  const currentUrl = selected?.item.url ?? "";
  const answer = answerState?.url === currentUrl ? answerState.value : "";
  const error = errorState?.url === currentUrl ? errorState.value : "";

  const modes = READER_MODES;

  function changeMode(next: ReaderMode) {
    setMode(next);
    setQuestion(modes.find(row => row.id === next)!.hint);
    setAnswerState(null);
    setErrorState(null);
  }

  async function submitQuestion() {
    if (!selected || !modelReady || pending) return;
    if (inviteCode.length < 32 || question.trim().length < 4 || question.trim().length > 380) {
      setErrorState({ url: selected.item.url, value: "테스터 초대 코드와 4~380자의 질문을 확인해 주세요." });
      return;
    }
    setPending(true);
    setAnswerState(null);
    setErrorState(null);
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
      setAnswerState({ url: selected.item.url, value: data.answer.slice(0, 4500) });
    } catch (cause) {
      setErrorState({ url: selected.item.url, value: cause instanceof Error ? cause.message : "AI에 연결할 수 없습니다." });
    } finally {
      setPending(false);
    }
  }

  return (
    <aside className="newsAiCompanion" aria-label="기사별 NOAH AI 뉴스 파트너">
      {selected ? (
        <div className="newsAiSelected" aria-live="polite">
          <span>선택한 기사 · {selected.item.sourceName}</span>
          <strong>{selected.item.title}</strong>
          <a href={selected.item.url} target="_blank" rel="noopener noreferrer">
            기사 원문 직접 읽기 ↗
          </a>
        </div>
      ) : (
        <div className="newsAiEmpty" role="status">
          <strong>어떤 기사가 궁금하세요?</strong>
          <p>뉴스 목록에서 기사를 선택하면 그 제목을 참고하며 질문할 수 있습니다.</p>
        </div>
      )}

      <div className="newsAiCompanionHeader">
        <span className="newsAiEyebrow">NOAH · 기사 이해 도우미</span>
        <span className="newsAiAvailability">{modelReady ? "AI 테스트 연결" : "AI 연결 대기"}</span>
      </div>

      <fieldset className="newsAiModes" disabled={!selected || pending}>
        <legend className="newsAiModeLegend">도움받을 방식 선택</legend>
        <div className="newsAiModeButtons">
          {modes.map(item => (
            <button key={item.id} type="button" aria-pressed={mode === item.id}
              onClick={() => changeMode(item.id)}>{item.label}</button>
          ))}
        </div>
      </fieldset>

      <label className="newsAiLabel" htmlFor="newsAiQuestion">이 기사에 대해 질문하기</label>
      <textarea id="newsAiQuestion" rows={3} maxLength={380}
        disabled={!selected || pending} value={question}
        onChange={event => setQuestion(event.target.value)}
        placeholder="모르는 용어나 궁금한 경제·정책 배경을 질문해 보세요." />

      {labAvailable && (
        inviteLinked ? (
          <div className="newsAiInviteConnected" role="status">
            <strong>✓ 초대 링크 인식 완료</strong>
            <span>코드를 따로 입력하지 않아도 됩니다. 질문할 때 인증됩니다.</span>
            <button type="button" disabled={pending} onClick={() => {
              forgetBetaInvitation(); setInviteLinked(false); setInviteCode("");
            }}>다른 초대코드 사용</button>
          </div>
        ) : (
          <>
            <label className="newsAiLabel" htmlFor="newsAiInvite">테스터 초대 코드 <small>초대 링크로 접속하면 입력할 필요가 없습니다</small></label>
            <input id="newsAiInvite" type="password" autoComplete="off" maxLength={256}
              value={inviteCode} disabled={pending}
              onChange={event => setInviteCode(event.target.value)}
              placeholder="개별 발급 코드" />
          </>
        )
      )}

      <button className="newsAiSubmit" type="button" onClick={() => void submitQuestion()}
        disabled={!selected || !modelReady || pending || question.trim().length < 4 || inviteCode.length < 32}>
        {pending ? "NOAH가 살펴보는 중…" : modelReady ? "AI에게 물어보기 ↗" : "AI 연결 대기"}
      </button>
      {!modelReady && (
        <p className="newsAiDisabled" role="status">
          AI 답변 연결 전입니다. 기사와 질문 작성 화면을 미리 이용할 수 있습니다.
        </p>
      )}

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
