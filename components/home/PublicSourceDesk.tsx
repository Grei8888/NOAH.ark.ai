"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AppShell, type HomeView } from "@/components/home/AppShell";
import { Icon } from "@/components/home/Icon";
import { SourceCardVisual } from "@/components/home/SourceCardVisual";
import { ReaderAudiencePanel } from "@/components/home/ReaderAudiencePanel";
import { NewsDiscoveryPanel } from "@/components/home/NewsDiscoveryPanel";
import type { OfficialFeedSnapshot, OfficialSourceLink } from "@/lib/news/public-official-sources";
import { TODAY_TOPICS, matchesTodayTopic, restoreTodayTopics, validTodayTopics, todayKstDate, type TodayTopic } from "@/lib/news/daily-interests";

type SourceKind = "all" | "notice" | "press";
const SAVED_KEY = "noah:official-saved:v1";
const HIDDEN_KEY = "noah:official-hidden:v1";
const INTEREST_KEY = "noah:official-interests:v1";
const TODAY_KEY = "noah:today-topics:v1";
const FOCUS_KEY = "noah:personal-focus:v1";
const RECENT_REFRESH_KEY = "noah:manual-source-refresh:v1";
const MANUAL_WAIT_MS = 120000;
const refreshTime = new Intl.DateTimeFormat("ko-KR", {
  timeZone: "Asia/Seoul", hour: "2-digit", minute: "2-digit", hourCycle: "h23",
});
function isOfficialRefresh(value: unknown): value is OfficialFeedSnapshot {
  if (!value || typeof value !== "object") return false;
  const o = value as Partial<OfficialFeedSnapshot>;
  if (!Array.isArray(o.items) || typeof o.retrievedAt !== "string" || !Number.isFinite(new Date(o.retrievedAt).getTime()) ||
      typeof o.availableFeeds !== "number" || !Number.isInteger(o.availableFeeds) || o.availableFeeds < 1 || o.availableFeeds > 2 ||
      o.totalFeeds !== 2 || o.items.length > 40) return false;
  return o.items.every(item => {
    if (!item || typeof item !== "object" || typeof item.url !== "string" || typeof item.title !== "string" ||
      typeof item.sourceName !== "string" || typeof item.publishedAt !== "string" ||
      !["notice", "press"].includes(item.kind) || !Number.isFinite(new Date(item.publishedAt).getTime())) return false;
    try { const u = new URL(item.url); return u.protocol === "https:" && ["mss.go.kr", "www.mss.go.kr"].includes(u.hostname); }
    catch { return false; }
  });
}
const dateFormatter = new Intl.DateTimeFormat("ko-KR", {
  timeZone: "Asia/Seoul", month: "short", day: "numeric",
  hour: "2-digit", minute: "2-digit", hourCycle: "h23",
});
const shortDateFormatter = new Intl.DateTimeFormat("ko-KR", {
  timeZone: "Asia/Seoul", month: "short", day: "numeric",
});
function storedStrings(key: string): string[] {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(key) ?? "[]");
    return Array.isArray(value) ? value.filter((v): v is string => typeof v === "string").slice(0, 200) : [];
  } catch { return []; }
}
function sourceLabel(kind: SourceKind) {
  return kind === "notice" ? "사업공고" : kind === "press" ? "보도자료" : "모든 자료";
}

export function PublicSourceDesk({ snapshot, view, readerLabAvailable = false, readerModelReady = false, newsSearchEnabled = false, businessSupportEnabled = false }: { snapshot: OfficialFeedSnapshot; view: HomeView; readerLabAvailable?: boolean; readerModelReady?: boolean; newsSearchEnabled?: boolean; businessSupportEnabled?: boolean }) {
  const [saved, setSaved] = useState<string[]>([]);
  const [hidden, setHidden] = useState<string[]>([]);
  const [interests, setInterests] = useState<string[]>(["notice", "press"]);
  const [todayTopics, setTodayTopics] = useState<TodayTopic[]>([]);
  const [focusTopics, setFocusTopics] = useState<TodayTopic[]>([]);
  const [currentSnapshot, setCurrentSnapshot] = useState(snapshot);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshStatus, setRefreshStatus] = useState<{ text: string; persistent: boolean } | null>(null);
  const [lastRefreshTap, setLastRefreshTap] = useState(0);
  const [ready, setReady] = useState(false);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<SourceKind>(view === "startup" ? "notice" : "all");

  useEffect(() => {
    // Read browser-only preferences after hydration. Deferred callback avoids
    // cascading synchronous state updates from React effects.
    let active = true;
    queueMicrotask(() => {
      if (!active) return;
      setSaved(storedStrings(SAVED_KEY));
      setHidden(storedStrings(HIDDEN_KEY));
      const preferred = storedStrings(INTEREST_KEY).filter(s => s === "notice" || s === "press");
      if (localStorage.getItem(INTEREST_KEY) !== null) setInterests(preferred);
      const today = restoreTodayTopics(localStorage.getItem(TODAY_KEY), todayKstDate());
      setTodayTopics(today);
      try {
        const storedFocus = localStorage.getItem(FOCUS_KEY);
        if (storedFocus !== null) setFocusTopics(validTodayTopics(JSON.parse(storedFocus)));
        else setFocusTopics(today);
      } catch { setFocusTopics(today); }
      try {
        const stored: unknown = JSON.parse(sessionStorage.getItem(RECENT_REFRESH_KEY) ?? "null");
        if (isOfficialRefresh(stored)) {
          const checked = new Date(stored.retrievedAt).getTime();
          const previous = new Date(snapshot.retrievedAt).getTime();
          if (Date.now() - checked < 10 * 60000 && (!Number.isFinite(previous) || checked > previous)) setCurrentSnapshot(stored);
        }
      } catch { /* private session */ }
      setReady(true);
    });
    return () => { active = false; };
  }, []);
  useEffect(() => {
    if (!refreshStatus || refreshStatus.persistent) return;
    const timer = window.setTimeout(() => setRefreshStatus(null), 3000);
    return () => window.clearTimeout(timer);
  }, [refreshStatus]);

  async function refreshSources() {
    if (refreshing) return;
    if (lastRefreshTap && Date.now() - lastRefreshTap < MANUAL_WAIT_MS) {
      setRefreshStatus({ text: "방금 확인했습니다. 잠시 후 다시 확인할 수 있습니다.", persistent: false });
      return;
    }
    setRefreshing(true);
    setRefreshStatus({ text: "기관의 최신 자료를 확인하는 중입니다.", persistent: true });
    setLastRefreshTap(Date.now());
    try {
      const response = await fetch("/api/sources/refresh", { cache: "no-store", signal: AbortSignal.timeout(10000) });
      if (!response.ok) throw new Error("RSS refresh unavailable");
      const data: unknown = await response.json();
      if (!isOfficialRefresh(data)) throw new Error("Unexpected source data");
      if (data.items.length === 0) {
        setRefreshStatus({ text: "기관을 확인했지만 최근 14일 자료가 없습니다.", persistent: true });
      } else {
        setCurrentSnapshot(data);
        try { sessionStorage.setItem(RECENT_REFRESH_KEY, JSON.stringify(data)); } catch { /* private session */ }
        setRefreshStatus({ text: `최신 자료 ${data.items.length}건을 확인했습니다.`, persistent: false });
      }
    } catch {
      setRefreshStatus({ text: "기관 연결이 원활하지 않습니다. 기존 목록을 유지합니다.", persistent: true });
    } finally {
      setRefreshing(false);
    }
  }

  function changeSaved(url: string) {
    const next = saved.includes(url) ? saved.filter(s => s !== url) : [...saved, url].slice(-200);
    setSaved(next);
    try { localStorage.setItem(SAVED_KEY, JSON.stringify(next)); } catch { /* private browsers */ }
  }
  function hide(url: string) {
    const next = [...new Set([...hidden, url])].slice(-200);
    setHidden(next);
    try { localStorage.setItem(HIDDEN_KEY, JSON.stringify(next)); } catch { /* private browsers */ }
  }
  function restore() {
    setHidden([]);
    try { localStorage.removeItem(HIDDEN_KEY); } catch { /* private browsers */ }
  }
  function toggleInterest(kind: "notice" | "press") {
    const next = interests.includes(kind) ? interests.filter(k => k !== kind) : [...interests, kind];
    setInterests(next);
    try { localStorage.setItem(INTEREST_KEY, JSON.stringify(next)); } catch { /* private browsers */ }
  }

  function toggleTodayTopic(topic: TodayTopic) {
    const next = todayTopics.includes(topic) ? todayTopics.filter(t => t !== topic) : [...todayTopics, topic];
    setTodayTopics(next);
    try { localStorage.setItem(TODAY_KEY, JSON.stringify({ date: todayKstDate(), topics: next })); } catch { /* private mode */ }
  }
  function clearTodayTopics() {
    setTodayTopics([]);
    try { localStorage.removeItem(TODAY_KEY); } catch { /* private mode */ }
  }

  function focusReaderTopic(topic: TodayTopic) {
    const next: TodayTopic[] = [topic];
    setTodayTopics(next);
    setFocusTopics(next);
    try {
      localStorage.setItem(TODAY_KEY, JSON.stringify({ date: todayKstDate(), topics: next }));
      localStorage.setItem(FOCUS_KEY, JSON.stringify(next));
    } catch { /* private mode */ }
  }
  function setPersonalFocus(next: TodayTopic[]) {
    const valid = validTodayTopics(next);
    setFocusTopics(valid);
    setTodayTopics(valid);
    try {
      localStorage.setItem(FOCUS_KEY, JSON.stringify(valid));
      localStorage.setItem(TODAY_KEY, JSON.stringify({ date: todayKstDate(), topics: valid }));
    } catch { /* private mode */ }
  }
  function updatePersonalFocus(topic: TodayTopic) {
    setPersonalFocus(focusTopics.includes(topic)
      ? focusTopics.filter(t => t !== topic) : [...focusTopics, topic]);
  }
  function focusInterestControls() {
    document.getElementById("my-focus-settings")?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  const currentKind: SourceKind = view === "startup" ? "notice" : filter;
  const activeTopics = view === "home" ? focusTopics : todayTopics;
  const filtered = useMemo(() => currentSnapshot.items.filter(s => {
    if (view === "saved" && !saved.includes(s.url)) return false;
    if (view === "my" && !interests.includes(s.kind)) return false;
    if (view !== "saved" && hidden.includes(s.url)) return false;
    if (currentKind !== "all" && s.kind !== currentKind) return false;
    // MY FOCUS drives only the personalized news briefing on Home; official sources remain independently browsable.
    if (view !== "saved" && view !== "home" && todayTopics.length && !todayTopics.some(t => matchesTodayTopic(s.title, t))) return false;
    return !query.trim() || (s.title + s.sourceName).toLocaleLowerCase("ko-KR").includes(query.trim().toLocaleLowerCase("ko-KR"));
  }), [currentSnapshot.items, saved, hidden, interests, todayTopics, currentKind, query, view]);

  const showControls = view !== "settings";
  const title = view === "saved" ? "내가 저장한 자료" : view === "my" ? "내 관심 분야" :
    view === "startup" ? "창업 · 지원사업" : view === "discover" ? "원문 자료 탐색" : view === "settings" ? "서비스 안내" : "오늘 확인할 변화";
  const kstDay = new Intl.DateTimeFormat("ko-KR", { timeZone: "Asia/Seoul", year: "numeric", month: "long", day: "numeric", weekday: "long" }).format(new Date());

  return (
    <AppShell view={view} compactRail={newsSearchEnabled} rail={
      <>
        <section className="railPanel">
          <div className="railEyebrow">YOUR AI NEWS PARTNER</div>
          <h2>뉴스를 넘어, 이해로.</h2>
          <p>원문을 직접 읽고 스스로 판단하도록 돕는 AI 뉴스 파트너입니다. 현재는 정부 공식자료와 {newsSearchEnabled ? "검색 기반 언론사 기사" : "공식자료 탐색"}를 제공하며, {readerModelReady ? "실제 AI 독해 기능을 시험할 수 있습니다." : readerLabAvailable ? "AI 독해 화면은 확인할 수 있으며 실제 답변은 API 연결 대기 중입니다." : "AI 독해 도우미는 준비 중입니다."}</p>
        </section>
        <section className="railPanel">
          <div className="railEyebrow">SOURCE STATUS</div>
          <div className="signalRow"><span>최근 14일 자료</span><strong>{currentSnapshot.items.length}</strong></div>
          <div className="signalRow"><span>응답한 RSS</span><strong>{currentSnapshot.availableFeeds}/{currentSnapshot.totalFeeds}</strong></div>
          <div className="signalRow"><span>AI 상태</span><strong>{readerModelReady ? "실사용 테스트" : readerLabAvailable ? "모델 연결 대기" : "비활성"}</strong></div>
          <p className="sourceRailFoot">정부 공식자료는 중소벤처기업부 RSS를 이용합니다. {newsSearchEnabled ? "언론사 기사는 검색 API에서 별도로 가져옵니다." : "언론사 검색 기능은 연결 준비 중입니다."} 키워드 선택은 AI 추천·중요도 평가가 아닙니다.</p>
        </section>
        <section className="railPanel">
          <div className="railEyebrow">NEXT PHASE</div>
          <h2>Read. Understand. Decide.</h2>
          <p>{readerModelReady ? "경제용어 설명·배경지식·비판적 독해를 실제 AI로 시험합니다." : readerLabAvailable ? "AI 독해 화면을 검토할 수 있으며 실제 모델 연결은 대기 중입니다." : "경제용어 설명과 비판적 독해는 후속 출시 예정입니다."} 검증된 기사 간 관점 비교는 아직 미제공이며, 두 기사 읽기를 강제하지 않습니다.</p>
        </section>
      </>
    }>
      <div className="topUtility">
        <span>NOAH ARK / {readerLabAvailable ? "10-READER PRIVATE BETA" : "PUBLIC BETA v0.1"}</span>
        <span>{newsSearchEnabled ? "PUBLISHER LINKS + OFFICIAL SOURCES" : "OFFICIAL SOURCES ONLY"}</span>
      </div>
      <header className="homeIntro">
        <div className="dateLine"><span>{kstDay}</span><span>ONLY WHAT MATTERS.</span></div>
        <p className="greeting">Your AI News Partner. · 어려운 뉴스를 이해하기 쉽게.</p>
        <h1>{title}</h1>
        <div className="editionLine"><span className="signalDot" /><span>{newsSearchEnabled ? "언론사 기사 검색 + 정부 공식자료" : "실제 정부 RSS · 최근 14일 · 최신순"}</span><span>{readerLabAvailable ? "10명 사전검증" : "무료 공개 베타"}</span></div>
        {readerLabAvailable && <div className="readerBetaPrompt"><Link href="/lab/reader">실제 AI 뉴스 독해 도우미 사용하기 →</Link></div>}
      </header>
      <div className="trustNotice" role="note">
        <strong>LIVE SOURCES</strong>
        <span>{newsSearchEnabled ? "아래 언론사 기사는 검색 API에서 가져온 원문 링크이고, 정부 공고·보도자료는 공식 RSS에서 가져옵니다." : "아래는 실제 기관의 공고·보도자료 원문 링크입니다."} AI 중요도 선정이나 정책 시행 확정 판단은 아닙니다.</span>
      </div>
      {currentSnapshot.availableFeeds < currentSnapshot.totalFeeds && (
        <p className="sourceHealth" role="status">일부 자료원의 연결이 원활하지 않습니다. 표시 가능한 원문만 제공하며 가상 자료로 대체하지 않습니다.</p>
      )}
      {(view === "home" || view === "my") && (
        <ReaderAudiencePanel activeTopics={activeTopics} onFocusTopic={focusReaderTopic} aiReaderAvailable={readerModelReady} newsSearchEnabled={newsSearchEnabled} />
      )}
      {(view === "home" || view === "discover" || view === "startup" || view === "my") && (
        <section id={view === "home" ? "my-focus-settings" : undefined} className={view === "home" ? "todayInterestPanel personalFocusPanel" : "todayInterestPanel"} aria-label={view === "home" ? "나의 관심사 설정" : "오늘의 관심사 선택"}>
          <div className="todayInterestHeading">
            <div>
              <h2>{view === "home" ? "MY FOCUS · 나의 관심사" : "오늘의 관심사"}</h2>
              <p>{view === "home" ? "선택한 분야를 기억하고 관련 기사 제목을 우선 선별합니다." : "관심사는 언제든 변경할 수 있습니다."}</p>
            </div>
            {activeTopics.length > 0 && <button className="todayInterestReset" type="button" onClick={() => view === "home" ? setPersonalFocus([]) : clearTodayTopics()}>{view === "home" ? "선택 해제" : "전체 보기"}</button>}
          </div>
{view !== "home" && (
          <div className="sourceFreshnessBar">
            <span className="sourceFreshnessText" aria-live="polite" aria-atomic="true">
              <span
                key={refreshStatus?.text ?? "normal"}
                className={refreshStatus ? "sourceFreshnessMessage" : "sourceFreshnessDefault"}
              >
                {refreshStatus?.text ?? (
                  currentSnapshot.availableFeeds > 0 && currentSnapshot.retrievedAt
                    ? `최근 뉴스 확인 ${refreshTime.format(new Date(currentSnapshot.retrievedAt))} · 신청기한은 원문 확인`
                    : "최신 뉴스 확인 지연 · 신청기한은 원문 확인"
                )}
              </span>
            </span>
            <button type="button" className="sourceRefreshButton" onClick={refreshSources} disabled={refreshing}>
              <Icon name="refresh" /> {refreshing ? "확인 중…" : "최신 자료 확인"}
            </button>
          </div>
          )}
          <div className="todayInterestChips">
            {TODAY_TOPICS.map(topic => (
              <button type="button" key={topic.id} aria-pressed={activeTopics.includes(topic.id)}
                onClick={() => view === "home" ? updatePersonalFocus(topic.id) : toggleTodayTopic(topic.id)}>
                <span aria-hidden="true">{activeTopics.includes(topic.id) ? "✓ " : ""}</span>{topic.label}
              </button>
            ))}
          </div>
          <p className="todayInterestNote" aria-live="polite">
            {view === "home"
              ? activeTopics.length
                ? `${activeTopics.length}개 분야 선택 · 관심 분야에 일치하는 실제 기사 제목을 먼저 보여드립니다.`
                : "관심사 미설정 · 하나 이상 고르면 맞춤 뉴스 브리핑을 시작합니다."
              : `${todayTopics.length ? `${todayTopics.length}개 관심사 선택 · 주제 일치 자료만 표시` : "전체 주제 표시"} · 한국시간 기준 다음 날 초기화`}
            {view === "home" && " 선택한 관심사는 이 브라우저에 유지되고 언제든 변경할 수 있습니다."}
          </p>
        </section>
      )}
      {view === "settings" ? (
        <section className="sourceSettings">
          <h2>서비스 운영 원칙</h2>
          <p>NOAH ARK는 실제 근거를 먼저 확인합니다. 정부자료는 중소벤처기업부 공식 RSS의 제목·출처·원문 링크를 보여줍니다. {newsSearchEnabled ? "언론사 기사는 SerpApi의 Google News 검색 결과에 제공된 제목·언론사명·원문 링크만 표시합니다." : "언론사 뉴스 검색 API는 별도로 연결할 예정입니다."}</p>
          <p>기사 본문과 사진은 재게시하지 않습니다. 원문 내용을 확인하고 제도 적용 여부를 판단할 때는 기관의 원래 페이지를 참고하세요.</p>
          <p>정부 공식자료의 저장·숨김, 관심 분야 및 읽기 목적은 사용하는 브라우저에만 기록됩니다. 오늘의 관심사는 한국시간 기준 해당 날짜에만 유지됩니다. {newsSearchEnabled ? "뉴스 탐색에서는 고정된 주제별 검색 API를 공유 캐시로 사용하며 검색어를 매번 API에 전송하지 않습니다." : "뉴스 검색 API가 아직 연결되지 않았습니다."}</p>
          <p>NOAH ARK는 경제를 이해하고 세상을 읽는 AI 뉴스 파트너를 지향합니다. {readerModelReady ? "현재 내부 베타에서 실제 AI 용어 설명·배경 이해·비판적 독해를 시험합니다." : readerLabAvailable ? "AI 질문 화면을 시험할 수 있지만 실제 모델은 아직 연결 전입니다." : "경제용어 설명·배경 이해·비판적 독해·다른 시각의 원문 추천은 아직 개발 중인 기능입니다."} 검증된 기사 간 관점 비교는 후속 단계입니다.</p>
          <button type="button" className="sourceRestore" onClick={restore}>숨김 항목 모두 복원</button>
          <Link className="textLink" href="/">첫 화면으로 돌아가기 →</Link>
        </section>
      ) : (
        <>
          {view === "my" && (
            <section className="sourcePreferences" aria-label="관심 분야 선택">
              <p>선택한 분야의 공식 자료만 표시합니다. AI가 추론한 개인화 추천이 아닙니다.</p>
              <div className="sourceFilters">
                {(["notice", "press"] as const).map(k => (
                  <button key={k} type="button" aria-pressed={interests.includes(k)} onClick={() => toggleInterest(k)}>
                    <span aria-hidden="true">{interests.includes(k) ? "✓ " : "+ "}</span>{sourceLabel(k)}
                  </button>
                ))}
              </div>
            </section>
          )}
          {showControls && view !== "home" && (
            <div className="sourceToolbar">
              <label className="sourceSearch">
                <Icon name="search" />
                <input value={query} onChange={e => setQuery(e.target.value)} placeholder="자료 제목 검색" aria-label="자료 제목 검색"/>
              </label>
              {view !== "startup" && view !== "my" && <div className="sourceFilters" aria-label="자료 종류">
                {(["all", "notice", "press"] as const).map(k => (
                  <button key={k} type="button" aria-pressed={currentKind === k} onClick={() => setFilter(k)}>{sourceLabel(k)}</button>
                ))}
              </div>}
            </div>
          )}
          {(view === "home" || view === "discover" || view === "startup") && (
            <NewsDiscoveryPanel readerLabAvailable={readerLabAvailable}
              readerModelReady={readerModelReady} enabled={newsSearchEnabled}
              showBriefing={view === "home"} focusTopics={focusTopics}
              preferenceReady={ready} onUpdateFocus={focusInterestControls}
              businessSupportEnabled={businessSupportEnabled} showBusinessSupport={view === "home" || view === "startup"} />
          )}
          {view === "home" && (
            <div className="officialFreshnessBar">
              <div className="sourceFreshnessBar">
                <span className="sourceFreshnessText" aria-live="polite" aria-atomic="true">
                  {refreshStatus?.text ?? (currentSnapshot.availableFeeds > 0 && currentSnapshot.retrievedAt
                    ? `정부자료 확인 ${refreshTime.format(new Date(currentSnapshot.retrievedAt))} · 신청기한은 원문 확인`
                    : "정부 공식자료의 최신 확인이 지연되고 있습니다.")}
                </span>
                <button type="button" className="sourceRefreshButton" onClick={refreshSources} disabled={refreshing}>
                  <Icon name="refresh" /> {refreshing ? "확인 중…" : "공식 RSS 새로 확인"}
                </button>
              </div>
            </div>
          )}
          {view === "home" && (
            <div className="officialDataControls">
              <p>정부 공식자료 · 제목으로 직접 찾기</p>
              <div className="sourceToolbar">
                <label className="sourceSearch">
                  <Icon name="search" />
                  <input value={query} onChange={e => setQuery(e.target.value)}
                    placeholder="정부 공고·보도자료 제목 검색" aria-label="정부 공식자료 제목 검색" />
                </label>
                <div className="sourceFilters" aria-label="정부 자료 종류">
                  {(["all", "notice", "press"] as const).map(k => (
                    <button key={k} type="button" aria-pressed={currentKind === k}
                      onClick={() => setFilter(k)}>{sourceLabel(k)}</button>
                  ))}
                </div>
              </div>
            </div>
          )}
          <section className="feedSection" aria-label="공식 자료 목록">
            <div className="sectionHeading">
              <div><h2>POLICY · 정부 공식자료</h2><p>출처: 중소벤처기업부 공식 RSS · 공고·보도자료는 원문에서 확인하세요.</p></div>
              <span>{ready || view !== "saved" ? filtered.length : "—"} LINKS</span>
            </div>
            {view === "saved" && !ready ? (
              <p className="emptyState">이 브라우저에 저장된 자료를 확인하는 중입니다.</p>
            ) : filtered.length === 0 ? (
              <div className="emptyState" role="status">
                {view === "saved" ? "아직 저장한 자료가 없습니다. 홈에서 자료를 저장해 보세요." :
                  currentSnapshot.items.length > 0
                    ? `공식자료는 전체 ${currentSnapshot.items.length}건 있습니다. 현재 관심사·검색 조건에 맞는 자료가 0건입니다.`
                    : "최근 14일에 표시할 정부 공식자료가 없습니다. RSS 연결 상태를 확인해 주세요."}
                {view !== "saved" && currentSnapshot.items.length > 0 && (
                  <div className="sourceEmptyActions">
                    <button type="button" onClick={() => {
                      clearTodayTopics();
                      setQuery("");
                      setFilter("all");
                    }}>관심사·검색 조건 해제하고 전체 보기 →</button>
                    {view === "startup" && <Link href="/?view=discover">전체 자료 탐색으로 이동 ↗</Link>}
                  </div>
                )}
              </div>
            ) : filtered.slice(0, view === "home" ? 14 : 40).map((s: OfficialSourceLink, i: number) => (
              <article className={`sourceNewsItem sourceNewsItem--${s.kind}`} key={s.url}>
                <div className="eventRank">{String(i + 1).padStart(2, "0")}</div>
                <a className="sourceVisualLink" href={s.url} target="_blank" rel="noopener noreferrer" aria-label={s.title + " 원문 열기"}>
                  <SourceCardVisual title={s.title} kind={s.kind} />
                </a>
                <div className="sourceNewsBody">
                  <div className="eventMeta">
                    <span className="sourceKindBadge">{s.kind === "notice" ? "정부 공고" : "정부 보도"}</span>
                    <span className="sourcePublisherName">{s.sourceName.replace(/\s*·\s*(사업공고|보도자료)$/, "")}</span>
                    <time dateTime={s.publishedAt}>
                      <span className="sourceDateDesktop">{dateFormatter.format(new Date(s.publishedAt))} KST</span>
                      <span className="sourceDateMobile">{shortDateFormatter.format(new Date(s.publishedAt))}</span>
                    </time>
                  </div>
                  <h3><a href={s.url} target="_blank" rel="noopener noreferrer">{s.title}</a></h3>
                  <div className="sourceNewsActions">
                    <a href={s.url} target="_blank" rel="noopener noreferrer" aria-label={s.title + " 원문 열기"}>원문 보기 <Icon name="arrow" /></a>
                    {readerLabAvailable && <Link href={`/lab/reader?source=${encodeURIComponent(s.url)}`} aria-label={s.title + " AI 독해 도우미에서 질문하기"}>AI로 이해하기 ↗</Link>}
                    <button type="button" onClick={() => changeSaved(s.url)} aria-pressed={saved.includes(s.url)}>{saved.includes(s.url) ? "저장됨 ✓" : "저장"}</button>
                    {view !== "saved" && <button type="button" onClick={() => hide(s.url)} aria-label={s.title + " 숨기기"}>숨기기</button>}
                  </div>
                </div>
              </article>
            ))}
            {view === "home" && filtered.length > 14 && <Link className="sourceMoreLink" href="/?view=discover">원문 자료 더 보기 →</Link>}
          </section>
          <p className="sourceDisclaimer"><strong>정부 공식자료 출처:</strong> 중소벤처기업부 RSS(사업공고·보도자료). {newsSearchEnabled && <><strong>언론 기사 출처:</strong> 각 카드에 표시된 개별 언론사 · 검색 경로: SerpApi / Google News. </>}제목과 원문 링크를 제공하며 본문과 사진은 재게시하지 않습니다. 기사 사실관계는 해당 언론사에서, 정책 시행 여부·신청자격·기한은 관계기관 원문에서 확인하세요.</p>
        </>
      )}
    </AppShell>
  );
}
