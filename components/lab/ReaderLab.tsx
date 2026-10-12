"use client";

import { useState } from "react";
import Link from "next/link";
import { READER_MODES, type ReaderMode } from "@/lib/news/reader-companion";
import type { OfficialSourceLink } from "@/lib/news/public-official-sources";

type LabResponse = { answer?: string; error?: string; note?: string };

function originalLink(value: string): string | null {
  try {
    const url = new URL(value.trim());
    if (url.protocol !== "https:" || url.username || url.password) return null;
    return url.toString();
  } catch { return null; }
}

export function ReaderLab({
  sources, initialSource, availableFeeds, totalFeeds,
}: {
  sources: OfficialSourceLink[];
  initialSource?: OfficialSourceLink;
  availableFeeds: number;
  totalFeeds: number;
}) {
  const [accessCode, setAccessCode] = useState("");
  const [headline, setHeadline] = useState(initialSource?.title ?? "");
  const [url, setUrl] = useState(initialSource?.url ?? "");
  const [sourceQuery, setSourceQuery] = useState("");
  const [mode, setMode] = useState<ReaderMode>("terms");
  const [question, setQuestion] = useState<string>(READER_MODES[0].hint);
  const [busy, setBusy] = useState(false);
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState("");
  const [note, setNote] = useState("");
  const link = originalLink(url);
  const visibleSources = sources
    .filter(item => !sourceQuery.trim() || (item.title + item.sourceName).toLocaleLowerCase("ko-KR").includes(sourceQuery.trim().toLocaleLowerCase("ko-KR")))
    .slice(0, 14);
  const googleNewsSearch = "https://news.google.com/search?q=" +
    encodeURIComponent((headline.trim() || question.trim()).slice(0, 100)) +
    "&hl=ko&gl=KR&ceid=KR:ko";
  function pickSource(item: OfficialSourceLink) {
    setHeadline(item.title);
    setUrl(item.url);
    setAnswer("");
    setError("");
    setNote("");
  }

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
        <span>10명 실사용 베타 · 실제 정부 RSS + 실제 AI 모델</span>
        <h1>경제를 이해하고, 세상을 읽는 AI 뉴스 파트너.</h1>
        <p>신문 기사를 대신 요약하지 않습니다. 원문을 자유롭게 읽고, 이해가 어려울 때 AI에게 질문해 보세요.</p>
      </header>

      <section className="readerLabBox" aria-labelledby="lab-real-source-title">
        <h2 id="lab-real-source-title">01 · 실제 원문 고르기</h2>
        <p>실제 중소벤처기업부 RSS를 서비스와 동일한 수집 코드로 불러옵니다. 출처와 제목을 선택한 뒤 원문을 직접 읽어보세요.</p>
        <p className="readerLabNotice" role="status">연결된 정부 RSS {availableFeeds}/{totalFeeds} · 현재 확인된 원문 {sources.length}건 · 모두 원문 사이트로 이동합니다.</p>
        {availableFeeds === 0 && <p role="status" className="readerLabNotice">현재 정부 RSS를 불러오지 못했습니다. 가상 기사로 대체하지 않습니다. 아래에서 일반 경제 질문은 계속할 수 있습니다.</p>}
        {sources.length > 0 && (
          <>
            <label htmlFor="lab-source-search">원문 제목 검색 <span>(선택)</span></label>
            <input id="lab-source-search" value={sourceQuery} maxLength={80}
              onChange={event => setSourceQuery(event.target.value)}
              placeholder="창업, 정책자금, AI 등" />
            <div className="readerLabSourceList">
              {visibleSources.map((item) => (
                <div className="readerLabSourceItem" key={item.url}>
                  <div>
                    <span>{item.sourceName}</span>
                    <strong>{item.title}</strong>
                  </div>
                  <div className="readerLabSourceActions">
                    <a href={item.url} target="_blank" rel="noopener noreferrer">원문 ↗</a>
                    <button type="button" onClick={() => pickSource(item)}
                      aria-pressed={url === item.url}>질문하기</button>
                  </div>
                </div>
              ))}
            </div>
            {visibleSources.length === 0 && <p className="readerLabNotice">해당 단어가 포함된 공식 원문이 없습니다.</p>}
            {sources.length > 14 && <p className="readerLabNotice">처음 14건을 표시합니다. 다른 제목은 검색으로 찾을 수 있습니다.</p>}
          </>
        )}
      </section>

      <section className="readerLabBox" aria-labelledby="lab-source-title">
        <h2 id="lab-source-title">02 · 뉴스 맥락과 원문 링크</h2>
        <label htmlFor="lab-title">기사 제목 또는 관심 주제 <span>(선택)</span></label>
        <input id="lab-title" value={headline} maxLength={240}
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
        <h2 id="lab-ai-title">03 · NOAH AI에게 질문하기</h2>
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
        <label htmlFor="lab-access">나에게 발급된 테스터 초대 코드 <span>(이 화면에서만 사용, 저장 안 함)</span></label>
        <input id="lab-access" type="password" autoComplete="off"
          value={accessCode} onChange={event => setAccessCode(event.target.value)}
          placeholder="테스트용 접근 코드" />
        <button type="button" className="readerLabAsk"
          disabled={busy || question.trim().length < 4 || accessCode.length < 32}
          onClick={ask}>{busy ? "실제 AI 답변을 기다리는 중…" : "AI에게 질문하기 →"}</button>
        <p className="readerLabNotice">실제 AI API 호출이 발생합니다. 초대 코드마다 1시간 6회, 24시간 20회 요청을 목표로 제한합니다. 서버가 여러 대일 경우 합산 한도는 아니며, API 프로젝트의 별도 지출 관리가 필요합니다.</p>
      </section>

      {(answer || error) && (
        <section className="readerLabAnswer" aria-live="polite" aria-label="AI 답변">
          <h2>{error ? "연결 확인" : "NOAH AI · 이해 도우미"}</h2>
          {error ? <p role="alert">{error}</p> : <p className="readerLabAnswerText">{answer}</p>}
          {note && <p className="readerLabNotice">{note}</p>}
          {answer && <div className="readerLabAfter">원문으로 돌아가 근거를 확인해 보세요. 다른 관점을 읽는 것은 언제나 선택입니다.</div>}
        </section>
      )}
      <section className="readerLabBox" aria-label="선택적 추가 탐색">
        <h2>04 · 시야를 넓혀보세요 <span className="readerLabOptional">(선택)</span></h2>
        <p>다른 매체의 독립된 기사를 찾아보는 경로입니다. 아직 NOAH가 특정 언론의 관점을 평가하거나 원문 두 건을 자동 비교하지는 않습니다.</p>
        <a className="readerLabOriginal" href={googleNewsSearch} target="_blank" rel="noopener noreferrer">
          이 사건과 관련된 언론 보도 직접 찾아보기 ↗
        </a>
        <p className="readerLabNotice">외부 뉴스 검색 페이지로 이동합니다. 검색 결과에 서로 다른 관점이 반드시 포함된다고 보장하지 않습니다.</p>
      </section>
      <section className="readerLabBox" aria-label="실사용 의견 공유">
        <h2>05 · 테스트 의견 남기기</h2>
        <p>실제 AI 답변이 이해에 도움이 되었는지, 잘못되거나 불편한 점은 무엇인지 알려주세요. 초대 코드는 의견에 입력하지 마세요.</p>
        <a className="readerLabOriginal" href="https://noah-ark-ai.vercel.app/beta"
          target="_blank" rel="noopener noreferrer">기존 NOAH ARK 의견 수집 창에서 피드백 제출 ↗</a>
      </section>
      <footer className="readerLabFooter">NOAH ARK — ONLY WHAT MATTERS. · 동일한 실제 RSS 및 AI API · 정식 출시 전 검증</footer>
    </main>
  );
}
