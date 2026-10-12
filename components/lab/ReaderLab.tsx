"use client";

import { useState } from "react";
import Link from "next/link";
import { READER_MODES, type ReaderMode } from "@/lib/news/reader-companion";

type LabResponse = { answer?: string; error?: string; note?: string };

function originalLink(value: string): string | null {
  try {
    const url = new URL(value.trim());
    if (url.protocol !== "https:" || url.username || url.password) return null;
    return url.toString();
  } catch { return null; }
}

export function ReaderLab() {
  const [accessCode, setAccessCode] = useState("");
  const [headline, setHeadline] = useState("");
  const [url, setUrl] = useState("");
  const [mode, setMode] = useState<ReaderMode>("terms");
  const [question, setQuestion] = useState<string>(READER_MODES[0].hint);
  const [busy, setBusy] = useState(false);
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState("");
  const [note, setNote] = useState("");
  const link = originalLink(url);

  function changeMode(next: ReaderMode) {
    setMode(next);
    setQuestion(READER_MODES.find(item => item.id === next)!.hint);
    setAnswer("");
    setError("");
  }

  async function ask() {
    if (busy) return;
    setBusy(true);
    setAnswer("");
    setError("");
    setNote("");
    try {
      const response = await fetch("/api/lab/reader", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-noah-lab-token": accessCode,
        },
        body: JSON.stringify({ headline, mode, question }),
        cache: "no-store",
        signal: AbortSignal.timeout(18000),
      });
      const data: LabResponse = await response.json();
      if (!response.ok || typeof data.answer !== "string") throw new Error(data.error || "AI 응답을 확인할 수 없습니다.");
      setAnswer(data.answer);
      setNote(data.note || "");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "요청에 실패했습니다.");
    } finally { setBusy(false); }
  }

  return (
    <main className="readerLabPage">
      <header className="readerLabHeader">
        <Link className="readerLabHome" href="/">NOAH ARK</Link>
        <span>PRIVATE AI LAB · 미배포 기능 실험</span>
        <h1>경제를 이해하고, 세상을 읽는 AI 뉴스 파트너.</h1>
        <p>신문 기사를 대신 요약하지 않습니다. 원문을 자유롭게 읽고, 이해가 어려울 때 AI에게 질문해 보세요.</p>
      </header>

      <section className="readerLabBox" aria-labelledby="lab-source-title">
        <h2 id="lab-source-title">01 · 읽을 뉴스 또는 궁금한 주제</h2>
        <label htmlFor="lab-title">기사 제목 또는 관심 주제 <span>(선택)</span></label>
        <input id="lab-title" value={headline} maxLength={180}
          onChange={event => setHeadline(event.target.value)}
          placeholder="예: 기준금리 인하와 소상공인 대출" />
        <label htmlFor="lab-url">원문 링크 <span>(선택 · AI에 전달하지 않음)</span></label>
        <input id="lab-url" inputMode="url" value={url} maxLength={1000}
          onChange={event => setUrl(event.target.value)}
          placeholder="https://언론사 또는 정부기관 원문 주소" />
        {link && <a className="readerLabOriginal" href={link} target="_blank" rel="noopener noreferrer">언론사·기관 원문 열기 ↗</a>}
        <p className="readerLabNotice">AI는 이 주소에 접속하거나 기사 본문을 읽지 않습니다. 제목만 참고해 일반 개념과 검토 질문을 설명합니다.</p>
      </section>

      <section className="readerLabBox" aria-labelledby="lab-ai-title">
        <h2 id="lab-ai-title">02 · NOAH AI에게 질문하기</h2>
        <p>기사를 하나도 열지 않아도 질문할 수 있습니다. 다른 관점의 원문 탐색도 강제조건이 아닙니다.</p>
        <div className="readerLabModes" role="group" aria-label="AI 이해 도우미 모드">
          {READER_MODES.map(item => (
            <button type="button" key={item.id} aria-pressed={mode === item.id}
              onClick={() => changeMode(item.id)}>{item.label}</button>
          ))}
        </div>
        <label htmlFor="lab-question">AI에게 궁금한 점</label>
        <textarea id="lab-question" rows={4} maxLength={380}
          value={question} onChange={event => setQuestion(event.target.value)}
          placeholder="이 소식을 이해하기 위해 무엇을 알아야 할까요?" />
        <label htmlFor="lab-access">테스트 접근 코드 <span>(이 화면에서만 사용, 저장 안 함)</span></label>
        <input id="lab-access" type="password" autoComplete="off"
          value={accessCode} onChange={event => setAccessCode(event.target.value)}
          placeholder="테스트용 접근 코드" />
        <button type="button" className="readerLabAsk"
          disabled={busy || question.trim().length < 4 || accessCode.length < 32}
          onClick={ask}>{busy ? "실제 AI 답변을 기다리는 중…" : "AI에게 질문하기 →"}</button>
        <p className="readerLabNotice">실제 AI API 호출이 발생하는 개발 테스트입니다. 비용을 제한하기 위해 관리자 접근 코드와 요청 횟수 제한을 적용합니다.</p>
      </section>

      {(answer || error) && (
        <section className="readerLabAnswer" aria-live="polite" aria-label="AI 답변">
          <h2>{error ? "연결 확인" : "NOAH AI · 이해 도우미"}</h2>
          {error ? <p role="alert">{error}</p> : <p className="readerLabAnswerText">{answer}</p>}
          {note && <p className="readerLabNotice">{note}</p>}
          {answer && <div className="readerLabAfter">원문으로 돌아가 근거를 확인해 보세요. 다른 관점을 읽는 것은 언제나 선택입니다.</div>}
        </section>
      )}
      <footer className="readerLabFooter">NOAH ARK — ONLY WHAT MATTERS. · 개발 전용 실험실 · 아직 배포 승인 전</footer>
    </main>
  );
}
