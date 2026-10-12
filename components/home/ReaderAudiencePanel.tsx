"use client";

import { useEffect, useState } from "react";
import type { TodayTopic } from "@/lib/news/daily-interests";
import {
  READER_AUDIENCES, readerAudienceInfo, validReaderAudience,
  type ReaderAudience,
} from "@/lib/news/reader-audience";

const STORAGE_KEY = "noah:reader-audience:v1";

/**
 * An optional, browser-local onboarding goal. No auth, tracking, API or AI call.
 * Goal selection changes explanatory copy only; a distinct button applies
 * the declared topic shortcut using the existing keyword-filter pipeline.
 */
export function ReaderAudiencePanel({
  activeTopics,
  onFocusTopic,
}: {
  activeTopics: readonly TodayTopic[];
  onFocusTopic: (topic: TodayTopic) => void;
}) {
  const [audience, setAudience] = useState<ReaderAudience | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (!active) return;
      try {
        setAudience(validReaderAudience(localStorage.getItem(STORAGE_KEY)));
      } catch {
        setAudience(null);
      }
      setReady(true);
    });
    return () => { active = false; };
  }, []);

  function choose(id: ReaderAudience) {
    setAudience(id);
    try { localStorage.setItem(STORAGE_KEY, id); } catch { /* private browsing */ }
  }

  const selected = audience ? readerAudienceInfo(audience) : null;
  const focused = !!selected && activeTopics.length === 1 && activeTopics[0] === selected.topic;

  return (
    <section className="readerAudiencePanel" aria-labelledby="reader-audience-title">
      <div className="readerAudienceIntro">
        <p className="readerAudienceEyebrow">YOUR AI NEWS PARTNER · EARLY BETA</p>
        <h2 id="reader-audience-title">경제를 이해하고, 세상을 읽는 뉴스 파트너.</h2>
        <p>어떤 목적으로 뉴스를 읽으시나요? 하나를 선택하면 살펴볼 주제를 안내합니다.</p>
      </div>
      <div className="readerAudienceChoices" role="group" aria-label="뉴스를 읽는 목적">
        {READER_AUDIENCES.map((item) => (
          <button
            type="button"
            key={item.id}
            aria-pressed={audience === item.id}
            onClick={() => choose(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>
      {ready && selected && (
        <div className="readerAudienceSelected" aria-live="polite">
          <div>
            <strong>{selected.headline}</strong>
            <p>{selected.description}</p>
          </div>
          <button
            type="button"
            onClick={() => onFocusTopic(selected.topic)}
            aria-pressed={focused}
          >
            {focused ? "선택한 주제 표시 중 ✓" : selected.topicLabel + " →"}
          </button>
        </div>
      )}
      <p className="readerAudienceFoot">
        현재는 중소벤처기업부의 공식 원문과 제목 키워드 필터만 제공합니다.
        AI 용어 설명·배경 이해·비판적 독해·다른 관점 추천은 준비 중입니다.
        선택한 읽기 목적은 이 브라우저에만 저장되며 언제든 바꿀 수 있습니다.
      </p>
    </section>
  );
}
