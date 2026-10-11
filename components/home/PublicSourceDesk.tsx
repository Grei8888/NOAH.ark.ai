"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AppShell, type HomeView } from "@/components/home/AppShell";
import { Icon } from "@/components/home/Icon";
import type { OfficialFeedSnapshot, OfficialSourceLink } from "@/lib/news/public-official-sources";

type SourceKind = "all" | "notice" | "press";
const SAVED_KEY = "noah:official-saved:v1";
const HIDDEN_KEY = "noah:official-hidden:v1";
const INTEREST_KEY = "noah:official-interests:v1";
const dateFormatter = new Intl.DateTimeFormat("ko-KR", {
  timeZone: "Asia/Seoul", month: "short", day: "numeric",
  hour: "2-digit", minute: "2-digit", hourCycle: "h23",
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

export function PublicSourceDesk({ snapshot, view }: { snapshot: OfficialFeedSnapshot; view: HomeView }) {
  const [saved, setSaved] = useState<string[]>([]);
  const [hidden, setHidden] = useState<string[]>([]);
  const [interests, setInterests] = useState<string[]>(["notice", "press"]);
  const [ready, setReady] = useState(false);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<SourceKind>(view === "startup" ? "notice" : "all");

  useEffect(() => {
    setSaved(storedStrings(SAVED_KEY));
    setHidden(storedStrings(HIDDEN_KEY));
    const preferred = storedStrings(INTEREST_KEY).filter(s => s === "notice" || s === "press");
    if (localStorage.getItem(INTEREST_KEY) !== null) setInterests(preferred);
    setReady(true);
  }, []);
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

  const currentKind: SourceKind = view === "startup" ? "notice" : filter;
  const filtered = useMemo(() => snapshot.items.filter(s => {
    if (view === "saved" && !saved.includes(s.url)) return false;
    if (view === "my" && !interests.includes(s.kind)) return false;
    if (view !== "saved" && hidden.includes(s.url)) return false;
    if (currentKind !== "all" && s.kind !== currentKind) return false;
    return !query.trim() || (s.title + s.sourceName).toLocaleLowerCase("ko-KR").includes(query.trim().toLocaleLowerCase("ko-KR"));
  }), [snapshot.items, saved, hidden, interests, currentKind, query, view]);

  const showControls = view !== "settings";
  const title = view === "saved" ? "내가 저장한 자료" : view === "my" ? "내 관심 분야" :
    view === "startup" ? "창업 · 지원사업" : view === "discover" ? "원문 자료 탐색" : view === "settings" ? "서비스 안내" : "오늘 확인할 변화";
  const kstDay = new Intl.DateTimeFormat("ko-KR", { timeZone: "Asia/Seoul", year: "numeric", month: "long", day: "numeric", weekday: "long" }).format(new Date());

  return (
    <AppShell view={view} rail={
      <>
        <section className="railPanel">
          <div className="railEyebrow">SOURCE INTELLIGENCE</div>
          <h2>원문에서 시작합니다.</h2>
          <p>지금은 정부 공식 자료를 제공하는 베타 단계입니다. 한 사건으로 묶는 AI 분석과 NOAH Brief는 아직 제공하지 않습니다.</p>
        </section>
        <section className="railPanel">
          <div className="railEyebrow">SOURCE STATUS</div>
          <div className="signalRow"><span>최근 14일 자료</span><strong>{snapshot.items.length}</strong></div>
          <div className="signalRow"><span>응답한 RSS</span><strong>{snapshot.availableFeeds}/{snapshot.totalFeeds}</strong></div>
          <div className="signalRow"><span>AI 호출</span><strong>0</strong></div>
          <p className="sourceRailFoot">중소벤처기업부의 RSS 원문만 표시합니다. 최신순은 중요도 평가나 개인화 추천을 의미하지 않습니다.</p>
        </section>
        <section className="railPanel">
          <div className="railEyebrow">NEXT PHASE</div>
          <h2>One Event. Multiple Perspectives.</h2>
          <p>사건 군집화, 서로 다른 시각, 개인화 인텔리전스는 후속 출시 예정입니다.</p>
        </section>
      </>
    }>
      <div className="topUtility">
        <span>NOAH ARK / PUBLIC BETA v0.1</span>
        <span>OFFICIAL SOURCES ONLY</span>
      </div>
      <header className="homeIntro">
        <div className="dateLine"><span>{kstDay}</span><span>ONLY WHAT MATTERS.</span></div>
        <p className="greeting">Evidence before interpretation.</p>
        <h1>{title}</h1>
        <div className="editionLine"><span className="signalDot" /><span>실제 정부 RSS · 최근 14일 · 최신순</span><span>무료 공개 베타</span></div>
      </header>
      <div className="trustNotice" role="note">
        <strong>LIVE SOURCES</strong>
        <span>아래는 실제 기관의 공고·보도자료 원문 링크입니다. AI 분석, 중요도 선정 또는 정책 시행 확정 판단이 아닙니다.</span>
      </div>
      {snapshot.availableFeeds < snapshot.totalFeeds && (
        <p className="sourceHealth" role="status">일부 자료원의 연결이 원활하지 않습니다. 표시 가능한 원문만 제공하며 가상 자료로 대체하지 않습니다.</p>
      )}
      {view === "settings" ? (
        <section className="sourceSettings">
          <h2>서비스 운영 원칙</h2>
          <p>NOAH ARK는 실제 근거를 먼저 확인합니다. 현재 제공하는 기능은 중소벤처기업부의 공식 RSS에 게시된 제목·발행시각·출처·원문 링크를 보여주는 것입니다.</p>
          <p>기사 본문과 사진은 재게시하지 않습니다. 원문 내용을 확인하고 제도 적용 여부를 판단할 때는 기관의 원래 페이지를 참고하세요.</p>
          <p>저장·숨김 및 관심 분야 설정은 사용하는 브라우저에만 기록됩니다. 회원 가입, 유료 API, 개인 정보 수집 및 AI 분석은 사용하지 않습니다.</p>
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
          {showControls && (
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
          <section className="feedSection" aria-label="공식 자료 목록">
            <div className="sectionHeading">
              <div><h2>ORIGINAL SOURCES</h2><p>원문을 열어 내용과 적용 조건을 직접 확인하세요.</p></div>
              <span>{ready || view !== "saved" ? filtered.length : "—"} LINKS</span>
            </div>
            {view === "saved" && !ready ? (
              <p className="emptyState">이 브라우저에 저장된 자료를 확인하는 중입니다.</p>
            ) : filtered.length === 0 ? (
              <p className="emptyState">{view === "saved" ? "아직 저장한 자료가 없습니다. 홈에서 자료를 저장해 보세요." : query ? "검색어와 일치하는 원문이 없습니다." : "표시할 공식 자료가 없습니다. 잠시 후 다시 확인해 주세요."}</p>
            ) : filtered.slice(0, view === "home" ? 14 : 40).map((s: OfficialSourceLink, i: number) => (
              <article className="sourceNewsItem" key={s.url}>
                <div className="eventRank">{String(i + 1).padStart(2, "0")}</div>
                <div className="sourceNewsBody">
                  <div className="eventMeta">
                    <span>{sourceLabel(s.kind)}</span><span className="metaDot">·</span><span>{s.sourceName}</span><span className="metaDot">·</span>
                    <time dateTime={s.publishedAt}>{dateFormatter.format(new Date(s.publishedAt))} KST</time>
                  </div>
                  <h3><a href={s.url} target="_blank" rel="noopener noreferrer">{s.title}</a></h3>
                  <div className="sourceNewsActions">
                    <a href={s.url} target="_blank" rel="noopener noreferrer" aria-label={s.title + " 원문 열기"}>원문 보기 <Icon name="arrow" /></a>
                    <button type="button" onClick={() => changeSaved(s.url)} aria-pressed={saved.includes(s.url)}>{saved.includes(s.url) ? "저장됨 ✓" : "저장"}</button>
                    {view !== "saved" && <button type="button" onClick={() => hide(s.url)} aria-label={s.title + " 숨기기"}>숨기기</button>}
                  </div>
                </div>
              </article>
            ))}
            {view === "home" && filtered.length > 14 && <Link className="sourceMoreLink" href="/?view=discover">원문 자료 더 보기 →</Link>}
          </section>
          <p className="sourceDisclaimer">출처: 중소벤처기업부 공식 RSS. 보도자료·공고의 제목은 원문 그대로 제공하며, 본문과 이미지는 복제하지 않습니다. 자료의 시행 여부·신청 자격·기한은 반드시 해당 기관에서 확인하세요.</p>
        </>
      )}
    </AppShell>
  );
}
