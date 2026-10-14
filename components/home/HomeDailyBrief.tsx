"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { NewsSearchItem, NewsSearchSnapshot, NewsSearchTopic } from "@/lib/news/news-search-contract";

type TopicKey = "startup" | "policy";
type BriefState = { status: "loading" | "ready" | "unavailable"; items: NewsSearchItem[] };

const GROUPS: { key: TopicKey; label: string; description: string }[] = [
  { key: "startup", label: "창업 · 스타트업", description: "창업과 중소기업을 둘러싼 이슈" },
  { key: "policy", label: "정부 · 정책", description: "경제정책과 기업지원 제도 관련 소식" },
];
const INITIAL: BriefState = { status: "loading", items: [] };

function validArticle(value: NewsSearchItem): boolean {
  if (!value || typeof value.title !== "string" || !value.title.trim() ||
      typeof value.sourceName !== "string" || typeof value.url !== "string") return false;
  try { const u = new URL(value.url); return u.protocol === "https:" && !!u.hostname; }
  catch { return false; }
}

/**
 * Treat titles as titles, never as verified analysis of unavailable article
 * bodies. A missing timestamp is not a "today" story. Do not invent items.
 */
export function selectRecentBriefArticles(
  snapshot: Partial<NewsSearchSnapshot> | null, topic: NewsSearchTopic,
  now = new Date(), limit = 3,
): NewsSearchItem[] {
  if (snapshot?.topic !== topic || snapshot.provider !== "SerpApi / Google News" ||
      !Array.isArray(snapshot.items) || snapshot.items.length > 20) return [];
  const nowMs = now.getTime();
  const min = nowMs - 14 * 86_400_000;
  const seen = new Set<string>();
  return snapshot.items.filter(item => {
    if (!validArticle(item) || !item.publishedAt) return false;
    const time = Date.parse(item.publishedAt);
    if (!Number.isFinite(time) || time < min || time > nowMs + 60_000 || seen.has(item.url)) return false;
    seen.add(item.url);
    return true;
  }).sort((a, b) => Date.parse(b.publishedAt!) - Date.parse(a.publishedAt!)).slice(0, Math.max(0, Math.min(3, limit)));
}

const dateText = new Intl.DateTimeFormat("ko-KR", { timeZone: "Asia/Seoul", month: "numeric", day: "numeric" });

export function HomeDailyBrief() {
  const [brief, setBrief] = useState<Record<TopicKey, BriefState>>({
    startup: INITIAL, policy: INITIAL,
  });

  useEffect(() => {
    const controller = new AbortController();
    for (const topic of ["startup", "policy"] as const) {
      void (async () => {
        try {
          const res = await fetch("/api/news/discovery?topic=" + topic, {
            cache: "no-store", signal: controller.signal,
          });
          if (!res.ok) throw new Error("Search unavailable");
          const payload: unknown = await res.json();
          const rows = selectRecentBriefArticles(payload as Partial<NewsSearchSnapshot>, topic);
          if (!controller.signal.aborted) setBrief(old => ({
            ...old, [topic]: { status: rows.length ? "ready" : "unavailable", items: rows },
          }));
        } catch {
          if (!controller.signal.aborted) setBrief(old => ({
            ...old, [topic]: { status: "unavailable", items: [] },
          }));
        }
      })();
    }
    return () => controller.abort();
  }, []);

  const firstStartup = brief.startup.items[0], firstPolicy = brief.policy.items[0];
  return (
    <section className="homeDailyBrief" aria-labelledby="home-daily-title">
      <div className="homeDailyHeading">
        <div>
          <span className="homeDailyEyebrow">TODAY'S SIGNALS · NEWS HEADLINES</span>
          <h2 id="home-daily-title">오늘 확인할 변화</h2>
          <p>오늘의 흐름을 짧게 살펴보고, 더 알고 싶은 영역으로 들어가세요.</p>
        </div>
        <span className="homeDailyScope">최근 14일 내 보도 확인</span>
      </div>
      {(firstStartup || firstPolicy) && (
        <div className="homeDailyTakeaway" role="status">
          <strong>지금 살펴볼 흐름</strong>
          <p>
            {firstStartup ? <>창업 분야에서는 <b>‘{firstStartup.title}’</b> 소식이 보도됐습니다.</> : null}
            {firstStartup && firstPolicy ? " " : null}
            {firstPolicy ? <>정책 분야에서는 <b>‘{firstPolicy.title}’</b> 소식을 확인할 수 있습니다.</> : null}
          </p>
        </div>
      )}
      <div className="homeDailyColumns">
        {GROUPS.map(group => (
          <div className="homeDailyGroup" key={group.key}>
            <div className="homeDailyGroupTitle">
              <h3>{group.label}</h3>
              <span>{group.description}</span>
            </div>
            {brief[group.key].status === "loading" ? (
              <p className="homeDailyState" role="status">최근 보도를 확인하고 있습니다…</p>
            ) : brief[group.key].status === "unavailable" ? (
              <p className="homeDailyState" role="status">현재 확인 가능한 최근 보도가 없습니다. 뉴스 메뉴에서 직접 검색할 수 있습니다.</p>
            ) : (
              <ol className="homeDailyArticles">
                {brief[group.key].items.map(article => (
                  <li key={article.url}>
                    <a href={article.url} target="_blank" rel="noopener noreferrer">{article.title} ↗</a>
                    <span>{article.sourceName} · {dateText.format(new Date(article.publishedAt!))}</span>
                  </li>
                ))}
              </ol>
            )}
          </div>
        ))}
      </div>
      <div className="homeDailyFooter">
        <p>기사 본문을 요약한 AI 분석이 아니라 <strong>실제 언론사 기사 제목을 기준으로 정리한 동향</strong>입니다. 목록 순서는 중요도 순위가 아니며, 사실관계와 정책 시행 여부는 원문에서 확인하세요.</p>
        <Link href="/?view=discover">뉴스에서 자세히 알아보기 →</Link>
      </div>
    </section>
  );
}
