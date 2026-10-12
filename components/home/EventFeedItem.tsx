"use client";
import Link from "next/link";
import type { PublicEvent } from "@/types/domain";
import {
  CATEGORY_LABELS,
  matchedTopics,
  recommendationReason,
  relativeTime,
  type Preferences,
} from "@/lib/home/model";
import { Icon } from "./Icon";
import { LeadEventImage } from "./LeadEventImage";
import type { EditorialImage } from "@/lib/home/editorial-image";
import { DemoEventImage } from "./DemoEventImage";
import type { DemoImage } from "@/lib/home/demo-images";
export function EventFeedItem({
  event,
  rank,
  now,
  prefs,
  onSave,
  onHide,
  onTopics,
  variant = "medium",
  image,
  demoImage,
  mode,
}: {
  event: PublicEvent;
  rank: number;
  now: string;
  prefs: Preferences;
  onSave: (id: string) => void;
  onHide: (id: string) => void;
  onTopics: (event: PublicEvent, more: boolean) => void;
  variant?: "lead" | "medium" | "compact";
  image?: EditorialImage;
  demoImage?: DemoImage;
  mode: "mock" | "live";
}) {
  const saved = prefs.saved.includes(event.id);
  const topics = matchedTopics(event, prefs.enabled ? prefs.topics : []);
  return (
    <article
      className={`eventFeedItem eventFeedItem--${variant}`}
      data-event-id={event.id}
    >
      <div className="eventRank">{String(rank).padStart(2, "0")}</div>
      <div className="eventBody">
        <div className="eventMeta">
          <span>{CATEGORY_LABELS[event.primaryCategory]}</span>
          <span className="metaDot">·</span>
          <time dateTime={event.lastSeenAt}>
            {relativeTime(event.lastSeenAt, now)}
          </time>
          {event.isMock && <span className="demoTag">DEMO</span>}
        </div>
        {variant === "medium" && demoImage && (
          <DemoEventImage key={demoImage.src} event={event} image={demoImage} mode={mode} thumbnail />
        )}
        <h3>
          <Link href={`/event/${event.id}`}>{event.representativeTitle}</Link>
        </h3>
        {variant === "lead" && image && (
          <LeadEventImage key={image.src} event={event} image={image} />
        )}
        {variant === "lead" && !image && demoImage && (
          <DemoEventImage key={demoImage.src} event={event} image={demoImage} mode={mode} />
        )}
        <p className="eventSummary">{event.analysis.headlineSummary}</p>
        {variant === "lead" && (
          <p className="leadRecommendation">
            <strong>
              {topics.length ? "나에게 중요한 이유" : "오늘 알아야 할 이유"}
            </strong>
            <span>{recommendationReason(event, prefs)}</span>
          </p>
        )}
        <details className="recommendationReason">
          <summary>
            <span className="reasonMarker" aria-hidden="true"><Icon name="arrow" /></span>
            {variant === "lead"
              ? "왜 추천했나요?"
              : topics.length ? "나에게 중요한 이유" : "오늘 알아야 할 이유"}
            {variant !== "lead" && (
              <span className="whyLabel">왜 추천했나요?</span>
            )}
          </summary>
          <p>
            {recommendationReason(event, prefs)}. {topics.length ? "공개된 Event 제목·요약·분류에 선택한 주제가 포함되어 있습니다." : "개인화와 별개로 공개 중요도 순위를 사용했습니다."} 의미 기반 AI 개인화는 아직 연결되지 않았습니다.
          </p>
        </details>
        {topics.length > 0 && (
          <div className="topicTags">
            {topics.slice(0, 3).map((t) => (
              <span key={t.id}>{t.label}</span>
            ))}
          </div>
        )}
        <div className="eventActions">
          <Link
            href={`/event/${event.id}#perspectives`}
            className="perspectiveLink"
          >
            <Icon name="layers" />
            출처 {event.sourceCount}개 · 다른 시선
            <Icon name="arrow" />
          </Link>
          <div className="eventButtons">
            <button
              className={saved ? "saveButton isSaved" : "saveButton"}
              onClick={() => onSave(event.id)}
              aria-label={`${event.representativeTitle} ${saved ? "저장 취소" : "저장"}`}
              aria-pressed={saved}
            >
              <Icon name="saved" />
              <span>{saved ? "저장됨" : "저장"}</span>
            </button>
            <details className="overflowMenu">
              <summary aria-label={`${event.representativeTitle} 추가 메뉴`}>
                ···
              </summary>
              <div>
                <button onClick={() => onTopics(event, true)}>
                  이 주제 더 보기
                </button>
                <button onClick={() => onTopics(event, false)}>
                  이 주제 덜 보기
                </button>
                <button onClick={() => onHide(event.id)}>관심 없음</button>
                <Link href={`/event/${event.id}#sources`}>원문 출처 보기</Link>
              </div>
            </details>
          </div>
        </div>
      </div>
    </article>
  );
}
