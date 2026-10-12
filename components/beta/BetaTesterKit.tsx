"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AppShell } from "@/components/home/AppShell";
import { Icon } from "@/components/home/Icon";

const TASK_STORAGE_KEY = "noah:beta-tester-checklist:v1";
const NICKNAME_KEY = "noah:beta-tester-nickname:v1";
const tasks = [
  { id: "original", title: "실제 원문 확인", description: "Home에서 공고 한 건을 선택하고 정부기관 원문이 열리는지 확인하세요.", href: "/", label: "Home 열기" },
  { id: "search", title: "검색과 분류", description: "Discover에서 키워드를 검색하고 사업공고·보도자료 필터를 바꿔 보세요.", href: "/?view=discover", label: "Discover 열기" },
  { id: "startup", title: "창업 자료 살펴보기", description: "Startup에서 필요한 지원사업 공고를 쉽게 찾을 수 있는지 확인하세요.", href: "/?view=startup", label: "Startup 열기" },
  { id: "saved", title: "저장 기능 확인", description: "기사 한 건을 저장한 다음 Saved에서 보이는지 확인하세요.", href: "/?view=saved", label: "Saved 열기" },
  { id: "mobile", title: "모바일 사용성 확인", description: "휴대폰에서 하단 메뉴와 글자 크기, 화면 잘림을 살펴보세요.", href: "/", label: "사이트 다시 열기" },
] as const;

type TaskId = (typeof tasks)[number]["id"];
const taskIds = new Set<string>(tasks.map(t => t.id));
const validChecks = (input: unknown): TaskId[] =>
  Array.isArray(input) ? input.filter((v): v is TaskId => typeof v === "string" && taskIds.has(v)).slice(0, tasks.length) : [];

export function BetaTesterKit({ feedbackEnabled = false }: { feedbackEnabled?: boolean }) {
  const [checked, setChecked] = useState<TaskId[]>([]);
  const [nickname, setNickname] = useState("");
  const [sending, setSending] = useState(false);
  const pendingId = useRef<string | null>(null);
  const [score, setScore] = useState("");
  const [liked, setLiked] = useState("");
  const [problems, setProblems] = useState("");
  const [status, setStatus] = useState("");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (!active) return;
      try { setChecked(validChecks(JSON.parse(localStorage.getItem(TASK_STORAGE_KEY) ?? "[]"))); }
      catch { setChecked([]); }
      try { setNickname((localStorage.getItem(NICKNAME_KEY) || "").slice(0, 40)); }
      catch { /* Browsers may block storage */ }
      setHydrated(true);
    });
    return () => { active = false; };
  }, []);

  function toggle(id: TaskId) {
    const next = checked.includes(id) ? checked.filter(v => v !== id) : [...checked, id];
    setChecked(next);
    try { localStorage.setItem(TASK_STORAGE_KEY, JSON.stringify(next)); }
    catch { /* local preferences are optional */ }
  }

  function changeNickname(value: string) {
    const next = value.slice(0, 40);
    setNickname(next);
    pendingId.current = null;
    try {
      if (next.trim()) localStorage.setItem(NICKNAME_KEY, next);
      else localStorage.removeItem(NICKNAME_KEY);
    } catch { /* Storage is optional */ }
  }

  function feedbackText() {
    return [
      "NOAH ARK 베타테스트 의견",
      "서비스: https://noah-ark-ai.vercel.app",
      "닉네임: " + (nickname.trim() || "익명"),
      "확인한 항목: " + (checked.length ? tasks.filter(t => checked.includes(t.id)).map(t => t.title).join(", ") : "미선택"),
      "사용 경험 점수: " + (score ? score + "/5" : "응답 없음"),
      "좋았던 점: " + (liked.trim() || "응답 없음"),
      "불편하거나 개선할 점: " + (problems.trim() || "응답 없음"),
      "※ 본문은 테스터가 직접 공유한 경우에만 전달됩니다.",
    ].join("\n");
  }

  async function copyText(value: string, success: string) {
    try {
      await navigator.clipboard.writeText(value);
      setStatus(success);
    } catch {
      setStatus("자동 복사를 사용할 수 없습니다. 표시된 내용을 길게 눌러 복사해 주세요.");
      window.prompt("내용을 복사하세요", value);
    }
  }

  async function submitFeedback() {
    if (sending) return;
    if (!score && !liked.trim() && !problems.trim()) {
      setStatus("점수를 선택하거나 한 줄 이상 의견을 남겨 주세요.");
      return;
    }
    setSending(true);
    setStatus("");
    const submissionId = pendingId.current || crypto.randomUUID();
    pendingId.current = submissionId;
    try {
      const result = await fetch("/api/beta/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submissionId, nickname: nickname.trim(), score, liked: liked.trim(), problems: problems.trim() }),
        cache: "no-store",
        signal: AbortSignal.timeout(12000),
      });
      const payload: unknown = await result.json();
      if (!result.ok || !payload || typeof payload !== "object" || !("ok" in payload) || payload.ok !== true) {
        throw new Error(payload && typeof payload === "object" && "error" in payload && typeof payload.error === "string"
          ? payload.error : "지금은 접수할 수 없습니다. 잠시 후 다시 시도해 주세요.");
      }
      setStatus("의견이 접수됐습니다. 감사합니다! 새로운 의견도 언제든 남길 수 있어요.");
      setScore(""); setLiked(""); setProblems("");
      pendingId.current = null;
    } catch (error) {
      setStatus(error instanceof Error && !["Failed to fetch","The operation was aborted."].includes(error.message)
        ? error.message : "연결에 문제가 있습니다. 작성한 내용은 그대로 남아 있습니다.");
    } finally { setSending(false); }
  }

  async function shareFeedback() {
    const text = feedbackText();
    if (navigator.share) {
      try {
        await navigator.share({ title: "NOAH ARK 베타 테스트 의견", text });
        setStatus("기기 공유 기능을 열었습니다. 선택한 연락처로 전송됐는지는 공유 앱에서 확인해 주세요.");
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") {
          setStatus("공유를 취소했습니다. 작성한 내용은 화면에 남아 있습니다.");
        } else {
          await copyText(text, "피드백을 복사했습니다. 초대한 사람에게 메시지로 보내 주세요.");
        }
      }
    } else {
      await copyText(text, "피드백을 복사했습니다. 초대한 사람에게 메시지로 보내 주세요.");
    }
  }

  return (
    <AppShell rail={
      <>
        <section className="railPanel">
          <div className="railEyebrow">BETA PARTICIPANT GUIDE</div>
          <h2>당신의 사용 경험이 필요합니다.</h2>
          <p>실제 원문을 쉽고 빠르게 찾을 수 있는지, 모바일에서도 불편함이 없는지 확인해 주세요.</p>
        </section>
        <section className="railPanel">
          <div className="railEyebrow">TEST STATUS</div>
          <div className="signalRow"><span>테스트 항목</span><strong>{tasks.length}</strong></div>
          <div className="signalRow"><span>완료한 항목</span><strong>{hydrated ? checked.length : "–"}</strong></div>
          <p>점검표는 사용 중인 브라우저에만 저장됩니다. 의견은 제출 버튼을 누르기 전까지 전송되지 않습니다.</p>
        </section>
        <section className="railPanel">
          <div className="railEyebrow">CURRENT RELEASE</div>
          <h2>무료 공개 베타 v0.1</h2>
          <p>정부 RSS 기반 실제 공고·보도자료 원문 탐색을 제공합니다. AI Event 분석 및 NOAH Brief는 아직 제공하지 않습니다.</p>
        </section>
      </>
    }>
      <div className="topUtility">
        <span>NOAH ARK / BETA PROGRAM</span>
        <Link href="/">서비스로 이동 →</Link>
      </div>
      <header className="homeIntro">
        <div className="dateLine"><span>NOAH ARK</span><span>EARLY ACCESS · v0.1</span></div>
        <p className="greeting">One Event. Multiple Perspectives.</p>
        <h1>NOAH ARK 베타테스트에 초대합니다.</h1>
        <div className="editionLine"><span className="signalDot"/><span>약 5분 · 아이폰·안드로이드·PC · 회원가입 불필요</span></div>
      </header>
      <div className="trustNotice" role="note">
        <strong>실제 데이터</strong>
        <span>중소벤처기업부의 공식 RSS 원문을 연결합니다. 현재는 뉴스 원문 탐색 단계이며 AI 브리핑은 제공하지 않습니다.</span>
      </div>
      <section className="betaWelcome">
        <span className="betaEyebrow">A BETTER WAY TO FIND WHAT MATTERS</span>
        <h2>정보는 많아도,<br/>중요한 변화는 놓치지 않도록.</h2>
        <p>NOAH ARK가 더 적은 탐색으로 필요한 정보를 찾도록 돕는지 확인하고 있습니다. 다섯 가지 기능을 시험한 후 편한 방식으로 의견을 전해 주세요.</p>
        <div className="betaWelcomeActions">
          <Link href="/" target="_blank" rel="noopener noreferrer" className="betaPrimary">
            실제 서비스 체험하기 <Icon name="arrow" />
          </Link>
          <button type="button" className="betaSecondary" onClick={() => copyText("https://noah-ark-ai.vercel.app/beta", "테스터 초대 링크를 복사했습니다.")}>테스트 링크 복사</button>
        </div>
      </section>
      <section className="betaChecklist" aria-label="베타 점검표">
        <div className="sectionHeading">
          <div><h2>TEST CHECKLIST</h2><p>기능을 직접 사용한 뒤 확인란을 선택하세요.</p></div>
          <span>{hydrated ? checked.length : "–"} / {tasks.length} DONE</span>
        </div>
        {tasks.map((task, i) => (
          <article className="betaMission" key={task.id}>
            <label className="betaMissionCheck">
              <input type="checkbox" checked={checked.includes(task.id)} onChange={() => toggle(task.id)} aria-label={task.title + " 완료 표시"} />
              <span aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
            </label>
            <div>
              <h3>{task.title}</h3>
              <p>{task.description}</p>
              <Link href={task.href} target="_blank" rel="noopener noreferrer">{task.label} <Icon name="arrow" /></Link>
            </div>
          </article>
        ))}
      </section>
      <section className="betaFeedback" aria-label="베타테스터 의견">
        <div className="sectionHeading">
          <div><h2>YOUR FEEDBACK</h2><p>잘된 점과 불편한 점을 편하게 알려 주세요.</p></div>
          <span>OPTIONAL</span>
        </div>
        <label htmlFor="beta-nickname">닉네임 <span className="betaOptionalLabel">선택</span></label>
        <input id="beta-nickname" className="betaNickname" autoComplete="nickname" maxLength={40} value={nickname} onChange={e => changeNickname(e.target.value)} placeholder="예: 노아탐험가 (익명도 가능)" />
        <p className="betaNicknameHint">닉네임만 이 기기에 기억합니다. 여러 번 편하게 의견을 남겨 주세요.</p>
        <label htmlFor="beta-score">전반적인 사용 경험</label>
        <select id="beta-score" value={score} onChange={e => { setScore(e.target.value); pendingId.current = null; }}>
          <option value="">선택하지 않음</option>
          <option value="5">5점 — 매우 편리함</option>
          <option value="4">4점 — 편리함</option>
          <option value="3">3점 — 보통</option>
          <option value="2">2점 — 불편함</option>
          <option value="1">1점 — 매우 불편함</option>
        </select>
        <label htmlFor="beta-liked">좋았던 점</label>
        <textarea id="beta-liked" rows={3} maxLength={1500} value={liked} onChange={e => { setLiked(e.target.value); pendingId.current = null; }} placeholder="계속 사용하고 싶은 기능이나 인상적인 점" />
        <label htmlFor="beta-problems">불편하거나 개선할 점</label>
        <textarea id="beta-problems" rows={4} maxLength={1500} value={problems} onChange={e => { setProblems(e.target.value); pendingId.current = null; }} placeholder="오류, 화면 잘림, 찾기 어려운 정보, 제안 등" />
        <div className="betaWelcomeActions">
          {feedbackEnabled ? (
            <button type="button" className="betaPrimary" onClick={submitFeedback} disabled={sending}>
              {sending ? "접수 중…" : "피드백 보내기"} {!sending && <Icon name="arrow" />}
            </button>
          ) : (
            <button type="button" className="betaPrimary" onClick={shareFeedback}>피드백 공유하기 <Icon name="arrow" /></button>
          )}
          <button type="button" className="betaSecondary" onClick={() => copyText(feedbackText(), "피드백이 복사됐습니다. 초대한 사람에게 전달해 주세요.")}>내용 복사</button>
        </div>
        {status && <p className="betaFeedbackStatus" role="status">{status}</p>}
        <p className="betaPrivacy">{feedbackEnabled
          ? "보내기 버튼을 누르면 의견이 NOAH ARK의 Google 관리 시트에 저장됩니다. 이메일·실명·전화번호는 필요하지 않으며, 언제든 다시 제출할 수 있습니다. 개인정보나 비밀번호는 입력하지 마세요."
          : "현재 자동 접수 기능을 연결하고 있습니다. 당분간 공유 버튼을 누른 후 카카오톡·문자·이메일 등으로 보내거나 내용을 복사해 전달해 주세요. 이 페이지는 의견을 서버에 자동 저장하지 않습니다."}</p>
      </section>
      <footer className="betaFooter"><span>NOAH ARK · Only What Matters.</span><Link href="/">서비스 홈으로 돌아가기 →</Link></footer>
    </AppShell>
  );
}
