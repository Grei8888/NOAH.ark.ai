"use client";
import Link from "next/link";
import { useState } from "react";
import type { Edition } from "@/lib/data";
import type { PublicEvent } from "@/types/domain";
import {
  TOPICS,
  CATEGORY_LABELS,
  matchedTopics,
  selectHome,
  type Preferences,
} from "@/lib/home/model";
import { AppShell, type HomeView } from "./AppShell";
import { Icon } from "./Icon";
import { EventFeedItem } from "./EventFeedItem";
import { usePreferences } from "./preferences";
import { demoImageForEvent } from "@/lib/home/demo-images";

export function PersonalizedHome({
  edition,
  now,
  view,
}: {
  edition: Edition;
  now: string;
  view: HomeView;
}) {
  const { preferences: prefs, update } = usePreferences(edition.mode);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("ALL");
  const [notice, setNotice] = useState("");
  const [undo, setUndo] = useState<Preferences | null>(null);
  const selected = selectHome(edition.items, prefs);
  const kst = new Date(now);
  const hour = Number(
    new Intl.DateTimeFormat("en", {
      hour: "numeric",
      hourCycle: "h23",
      timeZone: "Asia/Seoul",
    }).format(kst),
  );
  const greeting =
    hour < 12
      ? "좋은 아침이에요."
      : hour < 18
        ? "좋은 오후예요."
        : "좋은 저녁이에요.";
  const date = new Intl.DateTimeFormat("ko-KR", {
    month: "long",
    day: "numeric",
    weekday: "long",
    timeZone: "Asia/Seoul",
  }).format(kst);
  const hasProfile = prefs.enabled && prefs.topics.length > 0;
  function commit(next: Preferences, message: string, canUndo = false) {
    if (canUndo) setUndo(prefs);
    else setUndo(null);
    const durable = update(next);
    setNotice(
      durable
        ? message
        : `${message} 브라우저 저장이 제한되어 새로고침하면 초기화됩니다.`,
    );
  }
  function save(id: string) {
    const saved = prefs.saved.includes(id);
    commit(
      {
        ...prefs,
        saved: saved
          ? prefs.saved.filter((x) => x !== id)
          : [...prefs.saved, id],
      },
      saved ? "저장을 취소했습니다." : "이 브라우저에 저장했습니다.",
      true,
    );
  }
  function hide(id: string) {
    commit(
      { ...prefs, hidden: [...prefs.hidden, id] },
      "Event를 숨겼습니다.",
      true,
    );
  }
  function toggleTopic(id: string) {
    if (!prefs.topics.includes(id) && prefs.topics.length >= 5) {
      setNotice("관심사는 최대 5개까지 선택할 수 있습니다.");
      return;
    }
    commit(
      {
        ...prefs,
        topics: prefs.topics.includes(id)
          ? prefs.topics.filter((x) => x !== id)
          : [...prefs.topics, id],
      },
      "관심사를 반영했습니다.",
    );
  }
  function changeTopics(event: PublicEvent, more: boolean) {
    const matching: string[] = matchedTopics(
      event,
      TOPICS.map((t) => t.id),
    ).map((t) => t.id);
    commit(
      {
        ...prefs,
        topics: more
          ? [...new Set([...prefs.topics, ...matching])].slice(0, 5)
          : prefs.topics.filter((id) => !matching.includes(id)),
      },
      more
        ? "관련 주제를 관심사에 반영했습니다."
        : "관련 주제를 관심사에서 제외했습니다.",
      true,
    );
  }
  function feed(events: PublicEvent[], editorial = false) {
    return events.map((event, i) => (
      <EventFeedItem
        key={event.id}
        event={event}
        rank={i + 1}
        variant={
          editorial ? (i === 0 ? "lead" : i < 3 ? "medium" : "compact") : "compact"
        }
        now={now}
        mode={edition.mode}
        demoImage={editorial && i < 3 ? demoImageForEvent(event, edition.mode) : undefined}
        prefs={prefs}
        onSave={save}
        onHide={hide}
        onTopics={changeTopics}
      />
    ));
  }
  function section(
    title: string,
    subtitle: string,
    events: PublicEvent[],
    empty: string,
    editorial = false,
  ) {
    return (
      <section className="feedSection">
        <div className="sectionHeading">
          <div>
            <h2>{title}</h2>
            <p>{subtitle}</p>
          </div>
          <span>{events.length} EVENTS</span>
        </div>
        {events.length ? feed(events, editorial) : <p className="emptyState">{empty}</p>}
      </section>
    );
  }
  const radar = (
    <section className="radarSection">
      <div className="sectionHeading">
        <div>
          <h2>STARTUP RADAR</h2>
          <p>사업 기회로 연결하기 전에, 원문과 요건부터</p>
        </div>
        <Link href="/?view=startup">
          모두 보기 <Icon name="arrow" />
        </Link>
      </div>
      {selected.radar.length ? (
        selected.radar.map((event) => (
          <Link
            className="radarItem"
            key={event.id}
            href={`/event/${event.id}#next`}
          >
            <span>{event.isMock ? "DEMO 공고" : "공식 원문 포함"}</span>
            <strong>{event.representativeTitle}</strong>
            <small>적용 대상 · 일정 · 요건 확인 필요</small>
            <Icon name="arrow" />
          </Link>
        ))
      ) : (
        <p className="emptyState">
          확인할 공식 공고가 아직 없습니다. 보도만으로 지원 자격을 판단하지
          않습니다.
        </p>
      )}
    </section>
  );
  const rail = (
    <>
      <section className="railPanel">
        <div className="railEyebrow">MY SIGNALS</div>
        <h2>내 관심사의 변화</h2>
        {hasProfile ? (
          TOPICS.filter((t) => prefs.topics.includes(t.id)).map((t) => (
            <div className="signalRow" key={t.id}>
              <span>{t.label}</span>
              <strong>
                {
                  selected.visible.filter(
                    (e) => matchedTopics(e, [t.id]).length,
                  ).length
                }
              </strong>
            </div>
          ))
        ) : (
          <p>관심사를 선택하면 현재 발행본에서 관련 Event 수를 보여드려요.</p>
        )}
        <Link className="textLink" href="/?view=my">
          관심사 편집 <Icon name="arrow" />
        </Link>
      </section>
      <section className="railPanel">
        <div className="railEyebrow">WATCHING</div>
        <h2>선택한 관심분야</h2>
        <div className="watchingTags">
          {TOPICS.filter((t) => prefs.topics.includes(t.id)).map((t) => (
            <span key={t.id}>{t.label}</span>
          ))}
        </div>
        {!prefs.topics.length && <p>아직 선택한 관심분야가 없습니다.</p>}
        <p className="railHint">
          {prefs.enabled
            ? "선언한 관심분야를 기준으로 추천합니다."
            : "개인화가 꺼져 있습니다."}
        </p>
      </section>
      <section className="railEditorial">
        <span className="signalDot" />
        <h2>
          하나의 사건,
          <br />
          여러 개의 시선.
        </h2>
        <p>
          같은 변화도 다른 관점에서.
          <br />
          해석보다 먼저 출처를 확인하세요.
        </p>
        <div>NOAH ARK</div>
      </section>
    </>
  );
  const filtered = selected.visible.filter(
    (event) =>
      (category === "ALL" || event.primaryCategory === category) &&
      [event.representativeTitle, event.analysis.headlineSummary]
        .join(" ")
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  return (
    <AppShell view={view} rail={rail}>
      <div className="topUtility">
        <span>PERSONAL INTELLIGENCE</span>
        <Link href="/?view=discover" aria-label="Event 검색">
          <Icon name="search" />
          <span>Event 검색</span>
        </Link>
      </div>
      {edition.mode === "mock" && (
        <div className="trustNotice">
          <strong>DEMO</strong>
          <span>
            가상 Event로 동작을 확인하는 화면입니다. 실제 뉴스가 아닙니다.
          </span>
        </div>
      )}
      <header className="homeIntro">
        <div className="dateLine">
          {date}
          <span>SEOUL · KST</span>
        </div>
        <p className="greeting">{greeting}</p>
        <h1>
          {view === "home"
            ? hasProfile
              ? "당신에게 중요한 오늘의 변화"
              : "오늘, 알아야 할 변화"
            : {
                discover: "변화를 발견하세요.",
                startup: "사업의 다음 기회를 살펴보세요.",
                saved: "다시 읽을 변화.",
                my: "나의 관심사가 기준입니다.",
                settings: "내 추천을 직접 관리하세요.",
              }[view]}
        </h1>
        <div className="editionLine">
          <span className="signalDot" />
          <span>
            최근 발행본 {edition.date ?? "없음"} · {edition.items.length}개
            Event
          </span>
          {edition.publishedAt && (
            <time dateTime={edition.publishedAt}>
              {new Intl.DateTimeFormat("ko-KR", {
                hour: "2-digit",
                minute: "2-digit",
                hourCycle: "h23",
                timeZone: "Asia/Seoul",
              }).format(new Date(edition.publishedAt))}{" "}
              KST
            </time>
          )}
        </div>
      </header>
      {notice && (
        <div className="feedbackNotice" role="status">
          {notice}
          {undo && (
            <button
              onClick={() => {
                update(undo);
                setUndo(null);
                setNotice("이전 상태로 되돌렸습니다.");
              }}
            >
              되돌리기
            </button>
          )}
          <button
            aria-label="알림 닫기"
            onClick={() => {
              setNotice("");
              setUndo(null);
            }}
          >
            ×
          </button>
        </div>
      )}
      {view === "home" && (
        <>
          {edition.mode === "live" && (
            <div className="coldStart" role="note">
              <span>AI 분석과 별도로, 수집된 자료의 출처와 원문 링크를 확인할 수 있습니다.</span>
              <Link href="/sources">
                원문 탐색 <Icon name="arrow" />
              </Link>
            </div>
          )}
          {!hasProfile && (
            <div className="coldStart">
              <span>
                {prefs.enabled
                  ? "관심사 3–5개로 나만의 피드를 만들어보세요."
                  : "개인화가 꺼져 있습니다. 공개 주요 변화를 보여드립니다."}
              </span>
              <Link href="/?view=my">
                관심사 선택 <Icon name="arrow" />
              </Link>
            </div>
          )}
          {hasProfile &&
            section(
              "FOR YOU",
              "선택한 관심분야에서 중요한 변화",
              selected.forYou,
              "선택한 관심분야에 해당하는 Event가 아직 없습니다. 공개 주요 변화를 확인하거나 관심사를 편집하세요.",
              true,
            )}
          {section(
            "MUST KNOW",
            hasProfile
              ? "관심사 밖이라도 오늘 알아야 할 변화"
              : "개인화 전, 중요도와 출처로 선별한 공개 Event",
            selected.mustKnow,
            "아직 발행된 주요 변화가 없습니다. 수집·분석이 끝난 뒤 다시 확인해주세요.",
          )}
          {radar}
        </>
      )}
      {view === "discover" && (
        <>
          <div className="discoverTools">
            <label>
              Event 검색
              <input
                aria-label="Event 검색"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="제목이나 주제를 검색하세요"
              />
            </label>
            <label>
              분야
              <select
                aria-label="분야"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="ALL">모든 분야</option>
                {Object.entries(CATEGORY_LABELS).map(([id, label]) => (
                  <option key={id} value={id}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
          </div>
          {section(
            "DISCOVER",
            "발행된 Event에서 직접 찾아보세요",
            filtered,
            "검색 조건에 해당하는 Event가 없습니다.",
          )}
        </>
      )}
      {view === "startup" && radar}
      {view === "saved" && (
        <>
          <p className="localStateNotice">
            저장은 이 브라우저에 보관됩니다. 현재 발행본에 포함된 저장 Event를
            보여드립니다.
          </p>
          {section(
            "SAVED",
            "다시 확인할 Event",
            selected.visible.filter((e) => prefs.saved.includes(e.id)),
            "아직 저장한 Event가 없습니다. 관심 있는 변화의 저장 버튼을 눌러보세요.",
          )}
        </>
      )}
      {view === "my" && (
        <section className="profilePanel">
          <h2>관심분야를 선택해주세요.</h2>
          <p>3–5개를 권장합니다. 관심사는 언제든 바꿀 수 있어요.</p>
          <div className="interestOptions">
            {TOPICS.map((topic) => (
              <button
                key={topic.id}
                aria-pressed={prefs.topics.includes(topic.id)}
                onClick={() => toggleTopic(topic.id)}
              >
                {topic.label}
                <span>{prefs.topics.includes(topic.id) ? "✓" : "+"}</span>
              </button>
            ))}
          </div>
          <div className="profileStatus">{prefs.topics.length}/5 선택</div>
          <label className="switchRow">
            <span>선택한 관심사로 개인화</span>
            <input
              type="checkbox"
              checked={prefs.enabled}
              onChange={(e) =>
                commit(
                  { ...prefs, enabled: e.target.checked },
                  e.target.checked
                    ? "개인화를 켰습니다."
                    : "개인화를 껐습니다.",
                )
              }
            />
          </label>
          <p className="localStateNotice">
            계정 로그인 전 단계입니다. 관심사와 저장은 이 브라우저에만 보관되며
            다른 기기와 동기화되지 않습니다.
          </p>
          <Link className="primaryButton" href="/">
            내 피드 읽기 <Icon name="arrow" />
          </Link>
        </section>
      )}
      {view === "settings" && (
        <section className="profilePanel">
          <h2>추천 신호와 저장 데이터</h2>
          <label className="switchRow">
            <span>관심사 개인화</span>
            <input
              type="checkbox"
              checked={prefs.enabled}
              onChange={(e) =>
                commit(
                  { ...prefs, enabled: e.target.checked },
                  "개인화 설정을 바꿨습니다.",
                )
              }
            />
          </label>
          <p>
            개인화는 선택한 주제와 공개된 Event 분류·제목·요약의 일치를 기준으로
            합니다. 읽기 시간이나 다른 사용자의 활동은 사용하지 않습니다.
          </p>
          <button
            className="secondaryButton"
            onClick={() =>
              commit(
                { ...prefs, hidden: [] },
                "숨긴 Event를 다시 보여드립니다.",
                true,
              )
            }
          >
            숨긴 Event 복원 ({prefs.hidden.length})
          </button>
          <button
            className="secondaryButton"
            onClick={() =>
              commit(
                { topics: [], enabled: false, saved: [], hidden: [] },
                "이 브라우저의 관심사와 저장을 초기화했습니다.",
                true,
              )
            }
          >
            관심사와 저장 초기화
          </button>
          <p className="localStateNotice">
            기기 간 동기화 · 회원 인증 · AI 의미 기반 개인화 · 집단 행동 기반
            추천은 아직 제공되지 않습니다.
          </p>
        </section>
      )}
      <footer className="homeFooter">
        <span>Only What Matters.</span>
        <Link href="/?view=settings">추천 설정</Link>
      </footer>
    </AppShell>
  );
}
