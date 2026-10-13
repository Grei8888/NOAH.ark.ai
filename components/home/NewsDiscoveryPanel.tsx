"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { NewsInlineCompanion, type SelectedNews } from "@/components/home/NewsInlineCompanion";
import { NEWS_SEARCH_TOPICS, type NewsSearchItem, type NewsSearchSnapshot, type NewsSearchTopic } from "@/lib/news/news-search-contract";

const newsDate = new Intl.DateTimeFormat("ko-KR", {
  timeZone: "Asia/Seoul", month: "short", day: "numeric",
});
function safeSnapshot(data: unknown, topic: NewsSearchTopic): NewsSearchSnapshot | null {
  if (!data || typeof data !== "object") return null;
  const obj = data as Partial<NewsSearchSnapshot>;
  if (obj.topic !== topic || obj.provider !== "SerpApi / Google News" ||
      !Array.isArray(obj.items) || obj.items.length > 20 || typeof obj.retrievedAt !== "string") return null;
  const valid = obj.items.every((item: NewsSearchItem) => {
    if (!item || typeof item.title !== "string" || typeof item.sourceName !== "string" ||
        typeof item.url !== "string" || item.title.length > 240 ||
        typeof item.publishedAt !== "string" && item.publishedAt !== null) return false;
    try {
      const u = new URL(item.url);
      return u.protocol === "https:" && u.hostname !== "news.google.com" && u.hostname !== "google.com";
    } catch { return false; }
  });
  return valid ? obj as NewsSearchSnapshot : null;
}

export function NewsDiscoveryPanel({ readerLabAvailable, readerModelReady, enabled }: {
  readerLabAvailable: boolean;
  readerModelReady: boolean;
  enabled: boolean;
}) {
  const [topic, setTopic] = useState<NewsSearchTopic>("economy");
  const [data, setData] = useState<Partial<Record<NewsSearchTopic, NewsSearchSnapshot>>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("");
  const [selectedNews, setSelectedNews] = useState<SelectedNews | null>(null);
  const [mobilePanel, setMobilePanel] = useState<"articles" | "ai">("articles");
  const requestId = useRef(0);

  async function pick(next: NewsSearchTopic) {
    setTopic(next);
    setFilter("");
    setSelectedNews(null);
    setMobilePanel("articles");
    setError("");
    const id = ++requestId.current;
    if (!enabled || data[next]) { setLoading(false); return; }
    setLoading(true);
    try {
      const response = await fetch("/api/news/discovery?topic=" + encodeURIComponent(next), {
        cache: "no-store", signal: AbortSignal.timeout(25000),
      });
      const json: unknown = await response.json();
      if (!response.ok) {
        const failure = json !== null && typeof json === "object" &&
          typeof (json as { error?: unknown }).error === "string"
          ? (json as { error: string }).error : "뉴스 검색 API의 응답을 확인할 수 없습니다.";
        throw new Error(failure.slice(0, 140));
      }
      const snapshot = safeSnapshot(json, next);
      if (!snapshot) throw new Error("검색 결과 형식을 확인할 수 없습니다.");
      if (requestId.current === id) {
        setData(old => ({ ...old, [next]: snapshot }));
      }
    } catch (err) {
      if (requestId.current === id) setError(
        err instanceof Error && err.name !== "TimeoutError"
          ? err.message
          : "검색 응답이 지연되고 있습니다. 연결을 다시 확인해 주세요."
      );
    } finally {
      if (requestId.current === id) setLoading(false);
    }
  }

  useEffect(() => {
    // Explicitly enabled private beta only. No paid query before server has API credentials.
    if (!enabled) return;
    queueMicrotask(() => { void pick("economy"); });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  const selectedQuery = NEWS_SEARCH_TOPICS.find(item => item.id === topic)!.query;
  const googleNewsPage = "https://news.google.com/search?q=" +
    encodeURIComponent(selectedQuery) + "&hl=ko&gl=KR&ceid=KR%3Ako";
  function selectArticle(item: NewsSearchItem) {
    setSelectedNews({ item, topic });
    setMobilePanel("ai");
  }
  const current = data[topic];
  const filtered = current?.items.filter(row =>
    !filter.trim() ||
    (row.title + " " + row.sourceName).toLocaleLowerCase("ko-KR")
      .includes(filter.trim().toLocaleLowerCase("ko-KR"))) ?? [];

  return (
    <section className="newsDiscoveryPanel" aria-labelledby="news-discovery-title">
      <div className="sectionHeading">
        <div>
          <h2 id="news-discovery-title">NEWS · 언론사 원문 탐색</h2>
          <p>실제 언론사의 기사 제목·출처·원문 링크를 확인하세요.</p>
        </div>
        <span>{enabled ? "SEARCH API" : "API 준비 중"}</span>
      </div>
      <nav className="newsAiMobileTabs" aria-label="뉴스 기사와 AI 독해 화면 전환">
        <button type="button" aria-pressed={mobilePanel === "articles"} onClick={() => setMobilePanel("articles")}>뉴스 목록</button>
        <button type="button" aria-pressed={mobilePanel === "ai"} onClick={() => setMobilePanel("ai")}>AI 질문하기</button>
      </nav>
      <div className="newsAiSplit">
      <div className="newsAiStories" data-mobile-active={mobilePanel === "articles"}>
      <div className="newsDiscoveryIntro">
        <p>언론사 웹페이지를 대신 보여주지 않습니다. 검색 결과에서 기사 제목을 고르면 각 언론사의 원문으로 연결됩니다.</p>
        <div className="newsDiscoveryTopics" role="group" aria-label="뉴스 검색 주제">
          {NEWS_SEARCH_TOPICS.map(item => (
            <button key={item.id} type="button" aria-pressed={topic === item.id}
              onClick={() => void pick(item.id)}>{item.label}</button>
          ))}
        </div>
        {enabled && current && (
          <label className="newsDiscoveryFilter">검색된 기사에서 찾기
            <input value={filter} onChange={e => setFilter(e.target.value)}
              placeholder="제목·언론사 내 검색 (추가 API 호출 없음)" maxLength={60} />
          </label>
        )}
      </div>
      {!enabled ? (
        <p className="newsDiscoveryStatus" role="status">
          검색 API 연결 전입니다. 실제 뉴스 검색 결과를 가장해서 표시하지 않으며,
          아래 정부 공식자료는 그대로 이용할 수 있습니다.
          <a className="newsDiscoveryFallback" href={googleNewsPage} target="_blank" rel="noopener noreferrer">
            현재 주제를 Google 뉴스에서 직접 검색하기 ↗
          </a>
        </p>
      ) : loading ? <p className="newsDiscoveryStatus" role="status">실제 뉴스 검색 결과를 불러오는 중입니다…</p> :
        error ? <p className="newsDiscoveryStatus" role="status">{error}
          <a className="newsDiscoveryFallback" href={googleNewsPage} target="_blank" rel="noopener noreferrer">
            Google 뉴스 검색 페이지에서 원문 찾아보기 ↗
          </a>
        </p> :
        filtered.length === 0 ? <p className="newsDiscoveryStatus">
          {current ? "조건에 맞는 검색 결과가 없습니다." : "주제를 선택하면 실제 뉴스가 표시됩니다."}
        </p> : (
          <div className="newsDiscoveryResults">
            {filtered.map(item => (
              <article key={item.url} className="newsDiscoveryItem" data-selected={selectedNews?.item.url === item.url}>
                <div className="newsDiscoverySource">
                  <span>기사</span><span aria-hidden="true">·</span><span>{item.sourceName}</span>
                  {item.publishedAt && <time dateTime={item.publishedAt}>
                    {newsDate.format(new Date(item.publishedAt))}
                  </time>}
                </div>
                <h3><a href={item.url} target="_blank" rel="noopener noreferrer">{item.title}</a></h3>
                <div className="newsDiscoveryActions">
                  <a href={item.url} target="_blank" rel="noopener noreferrer">언론사 원문 보기 ↗</a>
                  <button type="button" onClick={() => selectArticle(item)}
                    aria-pressed={selectedNews?.item.url === item.url}>
                    AI에게 질문 ↗
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      <p className="newsDiscoveryCredit">
        <strong>기사 출처</strong> 각 결과에 표시된 언론사 · <strong>검색 경로</strong> SerpApi의 Google News 검색.
        원문 기사·사진은 복제하지 않습니다. 검색 결과의 정확성이나 언론사별 입장을 NOAH가 보증하지 않으며,
        세부 사실은 반드시 언론사 원문에서 확인하세요.
      </p>
      </div>
      <div className="newsAiSide" data-mobile-active={mobilePanel === "ai"}>
        <NewsInlineCompanion selected={selectedNews} modelReady={readerModelReady} labAvailable={readerLabAvailable} />
      </div>
      </div>
    </section>
  );
}
