"use client";

import { curateFromHeadlines, requiredSearchTopics, type CuratedIssue } from "@/lib/news/personalized-briefing";
import { TODAY_TOPICS, type TodayTopic } from "@/lib/news/daily-interests";
import type { NewsSearchSnapshot, NewsSearchTopic, NewsSearchItem } from "@/lib/news/news-search-contract";

const titleDate = new Intl.DateTimeFormat("ko-KR", {
  timeZone: "Asia/Seoul", month: "short", day: "numeric",
});
function dated(iso: string | null): string {
  return iso && Number.isFinite(Date.parse(iso))
    ? titleDate.format(new Date(iso)) : "발행일 미확인";
}

export function MyBriefingPanel({
  focusTopics, preferenceReady, data, loadingTopics, onSelectArticle, onUpdateFocus,
}: {
  focusTopics: readonly TodayTopic[];
  preferenceReady: boolean;
  data: Partial<Record<NewsSearchTopic, NewsSearchSnapshot>>;
  loadingTopics: readonly NewsSearchTopic[];
  onSelectArticle: (item: NewsSearchItem, topic: NewsSearchTopic) => void;
  onUpdateFocus: () => void;
}) {
  const required = requiredSearchTopics(focusTopics);
  const waiting = required.some(topic => !data[topic] && loadingTopics.includes(topic));
  const unavailable = required.filter(topic => !data[topic] && !loadingTopics.includes(topic));
  const results = curateFromHeadlines(
    required.map(topic => data[topic]).filter((entry): entry is NewsSearchSnapshot => !!entry),
    focusTopics,
  );

  function articleButton(issue: CuratedIssue) {
    const first = issue.sources[0];
    return (
      <button type="button" className="briefingReadButton"
        onClick={() => onSelectArticle(first, first.searchTopic)}>
        이 이슈 살펴보기 <span aria-hidden="true">↗</span>
      </button>
    );
  }

  return (
    <section className="myBriefingPanel" aria-labelledby="my-briefing-title">
      <div className="myBriefingHead">
        <div>
          <span className="myBriefingEyebrow">FOR YOU · PERSONAL BRIEFING</span>
          <h2 id="my-briefing-title">오늘 나에게 중요한 뉴스</h2>
          <p>선택한 관심사에 맞는 실제 기사 제목 중 먼저 살펴볼 만한 이슈를 모았습니다.</p>
        </div>
        <button type="button" className="myBriefingSettings" onClick={onUpdateFocus}>
          관심사 수정 ↗
        </button>
      </div>
      <div className="myBriefingMeta">
        <span>제목·발행시각 기반 선별</span>
        <span>최대 5개 이슈</span>
        <span>AI 요약 아님</span>
      </div>
      {!preferenceReady ? <p className="myBriefingState" role="status">관심사 설정을 확인하고 있습니다…</p> :
        focusTopics.length === 0 ? (
          <div className="myBriefingState" role="status">
            <strong>먼저 관심 분야를 선택해 주세요.</strong>
            <p>아래 뉴스 목록을 그대로 나열하지 않고, 내가 선택한 분야에서 원문을 우선 선별합니다.</p>
            <button type="button" onClick={onUpdateFocus}>나의 관심사 선택하기 →</button>
          </div>
        ) : (
          <>
            <div className="myBriefingFocus">
              {focusTopics.map(topic => (
                <span key={topic}>{TODAY_TOPICS.find(t => t.id === topic)?.label || topic}</span>
              ))}
            </div>
            {waiting && <p className="myBriefingState" role="status">선택한 관심 분야의 실제 언론사 기사를 확인하는 중입니다…</p>}
            {!waiting && results.length === 0 &&
              <div className="myBriefingState" role="status">
                <strong>일치하는 최신 기사 제목이 아직 없습니다.</strong>
                <p>지난 14일 내 기사 제목만 대상으로 확인했습니다. 임의의 기사를 추천하지 않습니다.</p>
                {unavailable.length > 0 && <p>일부 뉴스 검색을 불러오지 못했습니다. 아래 전체 탐색에서 검색 상태를 확인하세요.</p>}
              </div>}
            {results.length > 0 && (
              <ol className="myBriefingList">
                {results.map((issue, index) => (
                  <li className="myBriefingItem" key={issue.id}>
                    <div className="myBriefingRank">{String(index + 1).padStart(2, "0")}</div>
                    <div className="myBriefingBody">
                      <div className="myBriefingSource">
                        <span>{issue.sources[0].sourceName}</span>
                        <span aria-hidden="true">·</span>
                        <time dateTime={issue.newestAt || undefined}>{dated(issue.newestAt)}</time>
                        {issue.sources.length > 1 &&
                          <span>유사 제목 {issue.sources.length}건</span>}
                      </div>
                      <h3>{issue.title}</h3>
                      <p className="myBriefingWhy">선정 근거: {issue.rationale.join(" · ")}</p>
                      <div className="myBriefingActions">
                        <a href={issue.sources[0].url} target="_blank" rel="noopener noreferrer">
                          언론사 원문 ↗
                        </a>
                        {articleButton(issue)}
                      </div>
                      {issue.sources.length > 1 && (
                        <details className="myBriefingMore">
                          <summary>관련 제목과 원문 {issue.sources.length}건 보기</summary>
                          <ul>
                            {issue.sources.map(source => (
                              <li key={source.url}>
                                <a href={source.url} target="_blank" rel="noopener noreferrer">
                                  {source.sourceName} · {source.title} ↗
                                </a>
                              </li>
                            ))}
                          </ul>
                        </details>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            )}
            {!waiting && unavailable.length > 0 && results.length > 0 &&
              <p className="myBriefingPartial">일부 주제의 검색 연결이 지연되어 확인된 기사만 표시합니다.</p>}
          </>
        )}
      <p className="myBriefingDisclaimer">
        선별은 관심사 키워드·발행일·유사 제목에 따른 규칙 기반입니다. 뉴스의 실제 중요도,
        기사의 진실성이나 서로 독립적인 취재 여부를 판단한 결과가 아닙니다.
        유사 기사는 제목만 비교해 잠정적으로 묶었으며 원문을 통해 직접 확인할 수 있습니다.
      </p>
    </section>
  );
}
