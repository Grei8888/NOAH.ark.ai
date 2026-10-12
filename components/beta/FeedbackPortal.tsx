"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/home/AppShell";
import { Icon } from "@/components/home/Icon";
import {
  buildFeedbackPrefillLink, FEEDBACK_TYPES, type FeedbackFormConfig, type FeedbackType,
} from "@/lib/beta/google-feedback";

const NICK_KEY = "noah:beta-feedback-nickname:v1";

export function FeedbackPortal({ config }: { config: FeedbackFormConfig | null }) {
  const [nickname, setNickname] = useState("");
  const [kind, setKind] = useState<FeedbackType>("개선 아이디어");
  const [message, setMessage] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (!active) return;
      try { setNickname((localStorage.getItem(NICK_KEY) || "").slice(0, 40)); }
      catch { /* Private browsing may disable storage. */ }
      setReady(true);
    });
    return () => { active = false; };
  }, []);

  function changeNickname(value: string) {
    const name = value.slice(0, 40);
    setNickname(name);
    try {
      if (name.trim()) localStorage.setItem(NICK_KEY, name);
      else localStorage.removeItem(NICK_KEY);
    } catch { /* Optional device-local nickname only. */ }
  }

  const validMessage = message.trim().length >= 2 && message.trim().length <= 1500;
  const formLink = config && validMessage
    ? buildFeedbackPrefillLink(config, { nickname: nickname.trim(), kind, message: message.trim() })
    : null;

  return (
    <AppShell rail={
      <>
        <section className="railPanel">
          <div className="railEyebrow">NOAH / COMMUNITY</div>
          <h2>작은 의견도 괜찮습니다.</h2>
          <p>짧은 사용 경험, 사소한 불편함, 다음에 바라는 기능을 언제든 남겨 주세요.</p>
        </section>
        <section className="railPanel">
          <div className="railEyebrow">PRIVATE BY DESIGN</div>
          <p>NOAH는 닉네임을 이 기기에만 기억합니다. 의견은 사용자가 Google 양식에서 제출을 완료할 때만 전송됩니다.</p>
        </section>
      </>
    }>
      <div className="topUtility"><span>NOAH ARK / BETA FEEDBACK</span><Link href="/beta">테스터 안내 →</Link></div>
      <header className="homeIntro">
        <div className="dateLine"><span>NOAH ARK</span><span>YOUR VOICE MATTERS.</span></div>
        <p className="greeting">Think Deep. Act Simple.</p>
        <h1>의견 남기기</h1>
        <div className="editionLine"><span className="signalDot" /><span>약 30초 · 닉네임만으로 참여 · 여러 번 제출 가능</span></div>
      </header>
      <section className="betaFeedbackQuick" aria-label="간편 의견 작성">
        <p className="betaFeedbackQuickLead">사용하시다가 생각나는 대로 남겨 주세요. 답변은 길지 않아도 됩니다. 새로운 의견은 언제든 다시 보낼 수 있어요.</p>
        {config ? (
          <>
            <label htmlFor="feedback-nickname">닉네임 <span>선택</span></label>
            <input id="feedback-nickname" value={nickname} onChange={e => changeNickname(e.target.value)}
              autoComplete="nickname" maxLength={40} placeholder="예: 노아탐험가" disabled={!ready} />
            <p className="betaInputHint">입력하면 이 브라우저에서 다음 방문에도 기억합니다. 실명이나 연락처는 필요 없습니다.</p>
            <label htmlFor="feedback-kind">어떤 의견인가요?</label>
            <select id="feedback-kind" value={kind} onChange={e => setKind(e.target.value as FeedbackType)}>
              {FEEDBACK_TYPES.map(t => <option value={t} key={t}>{t}</option>)}
            </select>
            <label htmlFor="feedback-message">의견 <span>필수</span></label>
            <textarea id="feedback-message" rows={5} value={message} maxLength={1500}
              onChange={e => setMessage(e.target.value)}
              placeholder="어디가 불편했나요? 혹은 이런 기능이 있으면 좋겠어요." />
            <p className="betaInputHint">{message.length}/1500자 · 편하게 한 문장만 써도 좋습니다.</p>
            {formLink ? (
              <a href={formLink} className="betaPrimary betaFeedbackSubmit" target="_blank" rel="noopener noreferrer">
                Google 양식에서 제출 완료하기 <Icon name="arrow" />
              </a>
            ) : (
              <button type="button" disabled className="betaPrimary betaFeedbackSubmit">
                의견을 입력해 주세요
              </button>
            )}
            <p className="betaPrivacy">버튼을 누르면 Google Forms로 이동합니다. 입력한 내용이 채워져 있는지 확인한 뒤, <strong>Google 양식의 ‘제출’</strong>을 눌러야 접수가 완료됩니다. 이 사이트는 별도로 의견을 전송하지 않습니다.</p>
          </>
        ) : (
          <div className="betaFeedbackSetupNote" role="status">
            <strong>의견 수집 양식을 연결하고 있습니다.</strong>
            <p>현재 Google 양식 연결 전입니다. 그동안은 베타테스터 안내 페이지에서 의견을 작성하고 메시지로 공유하실 수 있습니다.</p>
            <Link href="/beta" className="betaSecondary">기존 의견 공유 방식 이용하기 <Icon name="arrow" /></Link>
          </div>
        )}
      </section>
      <footer className="betaFooter"><span>NOAH ARK · Only What Matters.</span><Link href="/">뉴스 홈으로 돌아가기 →</Link></footer>
    </AppShell>
  );
}
