"use client";

import { useState } from "react";
import Link from "next/link";
import { READER_MODES, type ReaderMode } from "@/lib/news/reader-companion";
import { readerWordTokens, termExplanationQuestion } from "@/lib/news/reader-word-selection";
import type { OfficialSourceLink } from "@/lib/news/public-official-sources";

type LabResponse = { answer?: string; error?: string; note?: string };
type SelectedWord = { key: string; word: string };

function originalLink(value: string): string | null {
  try {
    const url = new URL(value.trim());
    if (url.protocol !== "https:" || url.username || url.password) return null;
    return url.toString();
  } catch { return null; }
}

export function ReaderLab({
  sources, initialSource, availableFeeds, totalFeeds, modelReady,
}: {
  sources: OfficialSourceLink[];
  initialSource?: OfficialSourceLink;
  availableFeeds: number;
  totalFeeds: number;
  modelReady: boolean;
}) {
  const [accessCode, setAccessCode] = useState("");
  const [headline, setHeadline] = useState(initialSource?.title ?? "");
  const [url, setUrl] = useState(initialSource?.url ?? "");
  const [sourceQuery, setSourceQuery] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [selectedWord, setSelectedWord] = useState<SelectedWord | null>(null);
  const [bubbleAnswer, setBubbleAnswer] = useState("");
  const [bubbleError, setBubbleError] = useState("");
  const [pane, setPane] = useState<"original" | "ai">("original");
  const [mode, setMode] = useState<ReaderMode>("terms");
  const [question, setQuestion] = useState<string>(READER_MODES[0].hint);
  const [busy, setBusy] = useState(false);
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState("");
  const [note, setNote] = useState("");

  const link = originalLink(url);
  // Never put an arbitrary pasted URL into an iframe. Only validated actual
  // source links already collected by the official RSS provider are framed.
  const framed = link && sources.some(item => item.url === link) ? link : null;
  const visibleSources = sources
    .filter(item => !sourceQuery.trim() ||
      (item.title + item.sourceName).toLocaleLowerCase("ko-KR")
        .includes(sourceQuery.trim().toLocaleLowerCase("ko-KR")))
    .slice(0, 14);
  const googleNewsSearch = "https://news.google.com/search?q=" +
    encodeURIComponent((headline.trim() || question.trim()).slice(0, 100)) +
    "&hl=ko&gl=KR&ceid=KR:ko";

  function pickSource(item: OfficialSourceLink) {
    setHeadline(item.title);
    setUrl(item.url);
    setSelectedWord(null);
    setExcerpt("");
    setAnswer("");
    setError("");
    setNote("");
    setPane("original");
  }

  function changeMode(next: ReaderMode) {
    setMode(next);
    setQuestion(READER_MODES.find(item => item.id === next)!.hint);
    setAnswer("");
    setError("");
  }

  async function ask(override?: { mode: ReaderMode; question: string; inline: boolean }) {
    if (busy || !modelReady) return;
    const actualMode = override?.mode ?? mode;
    const actualQuestion = override?.question ?? question;
    if (actualQuestion.trim().length < 4 || accessCode.length < 32) {
      if (override?.inline) setBubbleError("먼저 오른쪽 AI 패널에 테스터 초대 코드를 입력해 주세요.");
      return;
    }
    setBusy(true);
    if (override?.inline) {
      setBubbleAnswer("");
      setBubbleError("");
    } else {
      setAnswer("");
      setError("");
      setNote("");
    }
    try {
      const response = await fetch("/api/lab/reader", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-noah-lab-token": accessCode,
        },
        body: JSON.stringify({ headline, mode: actualMode, question: actualQuestion }),
        cache: "no-store",
        signal: AbortSignal.timeout(18000),
      });
      const data: LabResponse = await response.json();
      if (!response.ok || typeof data.answer !== "string") {
        throw new Error(data.error || "AI 응답을 확인할 수 없습니다.");
      }
      if (override?.inline) {
        setBubbleAnswer(data.answer);
        // Keep the definition near the selected word. The original iframe
        // stays mounted, so reading position is not reset.
      } else {
        setAnswer(data.answer);
        setNote(data.note || "");
      }
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : "요청에 실패했습니다.";
      if (override?.inline) setBubbleError(message);
      else setError(message);
    } finally {
      setBusy(false);
    }
  }

  async function explainCopiedTerm() {
    // Clipboard is accessed only after a deliberate button click.
    // Do not monitor external frames or collect article text automatically.
    try {
      if (!navigator.clipboard?.readText) {
        setError("이 브라우저에서는 클립보드 접근이 제한됩니다. 짧은 단어를 질문창에 붙여 넣어 주세요.");
        return;
      }
      const term = (await navigator.clipboard.readText()).trim();
      if (term.length < 2 || term.length > 50 || /[\\r\\n]/.test(term)) {
        setError("원문에서 2~50자의 짧은 단어만 복사해 주세요. 문단 전체는 자동 전송하지 않습니다.");
        setPane("ai");
        return;
      }
      const prompted = termExplanationQuestion(term);
      setMode("terms");
      setQuestion(prompted);
      setPane("ai");
      setAnswer("");
      setError("");
      if (modelReady && accessCode.length >= 32) {
        await ask({ mode: "terms", question: prompted, inline: false });
      }
    } catch {
      setError("클립보드를 읽을 수 없습니다. 복사한 단어를 오른쪽 질문창에 직접 붙여 넣어 주세요.");
    }
  }

  function clickWord(key: string, word: string) {
    if (selectedWord?.key === key) {
      setSelectedWord(null);
      return;
    }
    setSelectedWord({ key, word });
    setBubbleAnswer("");
    setBubbleError("");
  }

  function words(value: string, prefix: string) {
    const pieces = readerWordTokens(value);
    return pieces.map((piece, index) => {
      const id = prefix + "-" + index;
      if (!piece.word) return <span key={id}>{piece.text}</span>;
      const isSelected = selectedWord?.key === id;
      return (
        <span className="readerWordAnchor" key={id}>
          <button type="button" className="readerWordButton"
            aria-expanded={isSelected} aria-label={piece.text + " 뜻 보기"}
            onClick={() => clickWord(id, piece.text)}>{piece.text}</button>
          {isSelected && (
            <span className={"readerWordBubble" + (index > pieces.length * 0.55 ? " alignRight" : "")}
              role="group" aria-label={piece.text + " 빠른 용어 설명"}>
              <span className="readerBubbleHead">
                <strong>{selectedWord.word}</strong>
                <button type="button" aria-label="설명 닫기" onClick={() => setSelectedWord(null)}>×</button>
              </span>
              <span className="readerBubbleIntro">읽던 자리에서 바로 용어를 확인하세요.</span>
              {modelReady ? (
                <button type="button" className="readerBubbleAsk"
                  disabled={busy}
                  onClick={() => void ask({
                    mode: "terms",
                    question: termExplanationQuestion(selectedWord.word),
                    inline: true,
                  })}>{busy ? "설명 중…" : "AI로 쉽게 설명하기 →"}</button>
              ) : <span className="readerBubbleInfo">AI 연결 후 즉시 설명이 제공됩니다.</span>}
              {bubbleAnswer && <span className="readerBubbleText" role="status">{bubbleAnswer}</span>}
              {bubbleError && <span className="readerBubbleError" role="alert">{bubbleError}</span>}
            </span>
          )}
        </span>
      );
    });
  }

  return (
    <main className="readerLabPage readerLabWorkspacePage">
      <header className="readerLabHeader readerWorkspaceHeader">
        <Link className="readerLabHome" href="/">NOAH ARK</Link>
        <span>READING COMPANION · 10명 비공개 베타 · {modelReady ? "AI 연결됨" : "AI API 연결 대기"}</span>
        <h1>읽는 흐름을 끊지 않는 AI 뉴스 파트너.</h1>
        <p>왼쪽에서 원문을 읽고 오른쪽 AI에게 질문해 보세요. 뉴스 제목이나 직접 옮긴 짧은 문장의 단어를 누르면 설명 말풍선이 열립니다.</p>
      </header>

      <nav className="readerWorkspaceTabs" aria-label="모바일 독해 화면 전환">
        <button type="button" aria-pressed={pane === "original"}
          onClick={() => setPane("original")}>원문 읽기</button>
        <button type="button" aria-pressed={pane === "ai"}
          onClick={() => setPane("ai")}>AI 이해 도우미</button>
      </nav>

      <div className="readerWorkspace">
        <section className="readerWorkspaceColumn readerOriginalColumn"
          data-mobile-active={pane === "original"} aria-label="원문 독해 공간">
          <div className="readerWorkspaceBar">
            <div>
              <span className="readerWorkspaceEyebrow">01 / ORIGINAL</span>
              <h2>원문을 보면서 읽기</h2>
            </div>
            {link && <a className="readerWorkspaceExternal" href={link}
              target="_blank" rel="noopener noreferrer">원문 새 창 ↗</a>}
          </div>
          <details className="readerSourceChooser" open={undefined}>
            <summary>읽을 원문 선택 · 실제 정부 RSS {availableFeeds}/{totalFeeds} · {sources.length}건</summary>
            {sources.length ? (
              <>
                <label htmlFor="reader-source-search">기사 제목 검색</label>
                <input id="reader-source-search" value={sourceQuery} maxLength={80}
                  onChange={event => setSourceQuery(event.target.value)}
                  placeholder="창업 · 금리 · 정책자금" />
                <div className="readerSourceOptionList">
                  {visibleSources.map(item => (
                    <div key={item.url} className="readerSourceOption">
                      <span>{item.sourceName}</span>
                      <button type="button" aria-pressed={url === item.url}
                        onClick={() => pickSource(item)}>{item.title}</button>
                    </div>
                  ))}
                  {visibleSources.length === 0 && <p>일치하는 원문이 없습니다.</p>}
                </div>
              </>
            ) : <p className="readerLabNotice">정부 원문을 불러오지 못했습니다. 가상 기사를 대신 표시하지 않습니다.</p>}
          </details>

          {headline && (
            <div className="readerSelectedHeadline">
              <span>지금 읽는 기사 · 제목에서 모르는 단어를 눌러보세요</span>
              <div className="readerWordSurface">{words(headline, "title")}</div>
            </div>
          )}

          <div className="readerOriginalViewport" aria-label="외부 기관 원문">
            {framed ? (
              <iframe key={framed} src={framed} title="기관 원문 읽기"
                loading="eager" referrerPolicy="no-referrer" />
            ) : (
              <div className="readerIframeEmpty">
                <strong>원문을 선택해 주세요</strong>
                <p>실제 정부 RSS의 기사 제목을 선택하면 원문을 이 공간에서 불러옵니다.</p>
                {link && <a href={link} target="_blank" rel="noopener noreferrer">선택한 사이트에서 원문 열기 ↗</a>}
              </div>
            )}
          </div>
          <p className="readerFrameCaution">
            언론사·기관이 화면 내 표시를 차단했다면 「원문 새 창」을 이용하세요.
            외부 원문 자체의 단어 선택은 NOAH가 읽거나 감지하지 않습니다.
          </p>

          <section className="readerClipBox" aria-labelledby="reader-clip-title">
            <h3 id="reader-clip-title">읽으면서 간단히 메모하기 <span>(선택)</span></h3>
            <p>원문에서 어려운 짧은 문구만 복사해 붙여넣으세요. 아래에서 단어를 누르면 설명 말풍선이 뜹니다.</p>
            <label className="readerClipLabel" htmlFor="reader-clip-text">짧은 문장 · 최대 500자</label>
            <textarea id="reader-clip-text" value={excerpt} rows={2} maxLength={500}
              onChange={event => {
                setExcerpt(event.target.value);
                setSelectedWord(null);
              }} placeholder="모르는 단어가 들어 있는 문장 한두 개를 여기에 붙여 넣으세요." />
            {excerpt && (
              <div className="readerClipPreview">
                <span>설명이 필요한 단어를 눌러보세요</span>
                <div className="readerWordSurface">{words(excerpt, "excerpt")}</div>
              </div>
            )}
            <p className="readerFrameCaution">메모 전체는 AI 서버로 전송하지 않습니다. 직접 누른 단어와 제목만 질문에 사용됩니다. 기사 전문은 붙여넣지 마세요.</p>
          </section>
        </section>

        <aside className="readerWorkspaceColumn readerAIColumn"
          data-mobile-active={pane === "ai"} aria-label="AI 이해 도우미">
          <div className="readerWorkspaceBar">
            <div>
              <span className="readerWorkspaceEyebrow">02 / COMPANION</span>
              <h2>NOAH AI에게 질문하기</h2>
            </div>
          </div>
          <div className="readerAIInner">
            <p className="readerAIHint">기사 요약 대신 용어와 맥락을 이해하고, 검토할 질문을 만들어 드립니다. 원문 두 건 읽기는 강제하지 않습니다.</p>
            {!modelReady && <p className="readerAIUnavailable" role="status">현재 실제 API 키가 연결되지 않았습니다. 말풍선과 분할 화면은 시험할 수 있으며 AI 답변은 연결 후 활성화됩니다.</p>}
            <button type="button" className="readerClipboardAction"
              onClick={() => void explainCopiedTerm()}>
              <span aria-hidden="true">↳</span> 원문에서 복사한 단어 설명하기
            </button>
            <p className="readerClipboardNote">
              왼쪽 원문에서 단어를 선택해 복사(Ctrl+C)한 뒤 눌러보세요. 단어를 기억해서 다시 입력할 필요가 없습니다.
            </p>
            <div className="readerLabModes" role="group" aria-label="AI 독해 유형">
              {READER_MODES.map(item => (
                <button type="button" key={item.id} aria-pressed={mode === item.id}
                  onClick={() => changeMode(item.id)}>{item.label}</button>
              ))}
            </div>
            <label htmlFor="lab-question" className="readerAIFieldLabel">궁금한 점</label>
            <textarea id="lab-question" rows={4} maxLength={380}
              value={question} onChange={event => setQuestion(event.target.value)}
              placeholder="이 기사에서 이해하기 어려운 부분은 무엇인가요?" />
            <label htmlFor="lab-access" className="readerAIFieldLabel">테스터 초대 코드 <small>(이 화면에서만 사용)</small></label>
            <input id="lab-access" type="password" autoComplete="off"
              value={accessCode} onChange={event => setAccessCode(event.target.value)}
              placeholder="개별 발급 코드" />
            <button type="button" className="readerLabAsk"
              disabled={!modelReady || busy || question.trim().length < 4 || accessCode.length < 32}
              onClick={() => void ask()}>
              {!modelReady ? "AI 연결 대기 중" : busy ? "AI가 답변하는 중…" : "질문 보내기 →"}
            </button>
            {(answer || error) && (
              <section className="readerLabAnswer" aria-live="polite" aria-label="AI 답변">
                <h3>{error ? "연결 확인" : "NOAH AI · 이해 도우미"}</h3>
                {error ? <p role="alert">{error}</p> : <p className="readerLabAnswerText">{answer}</p>}
                {note && <p className="readerLabNotice">{note}</p>}
              </section>
            )}
            <div className="readerAISupplement">
              <h3>시야를 넓혀보세요 <small>선택</small></h3>
              <p>실제 다른 언론사 보도를 직접 찾습니다. 아직 언론사별 관점을 자동 검증·비교하지는 않습니다.</p>
              <a href={googleNewsSearch} target="_blank" rel="noopener noreferrer">
                관련 언론 보도 찾아보기 ↗
              </a>
            </div>
            <div className="readerAISupplement">
              <h3>사용 의견</h3>
              <a href="https://noah-ark-ai.vercel.app/beta"
                target="_blank" rel="noopener noreferrer">NOAH ARK 기존 피드백 공유하기 ↗</a>
            </div>
            <p className="readerAISmall">AI는 원문 페이지에 접속하거나 기사 본문을 읽지 않습니다. 제목과 질문만 참고합니다. 테스터별 요청 제한은 서버별로 적용되며 총 비용 한도를 보장하지는 않습니다.</p>
          </div>
        </aside>
      </div>
      <footer className="readerLabFooter">NOAH ARK · Only What Matters. · 실사용 베타 · 외부 원문 표시·단어 접근은 해당 사이트의 브라우저 정책을 따릅니다.</footer>
    </main>
  );
}
