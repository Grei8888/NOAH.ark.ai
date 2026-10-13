import { matchesTodayTopic, type TodayTopic } from "@/lib/news/daily-interests";
import { TODAY_TOPICS } from "@/lib/news/daily-interests";
import type { NewsSearchItem, NewsSearchSnapshot, NewsSearchTopic } from "@/lib/news/news-search-contract";

/**
 * Explainable, DETERMINISTIC headline-only curation.
 * It does not read article bodies or predict an article's actual quality,
 * ideological angle, or importance. Grouping is tentative by title similarity.
 */
export type CurationSource = NewsSearchItem & { searchTopic: NewsSearchTopic };
export type CuratedIssue = {
  id: string;
  title: string;
  matchTopics: TodayTopic[];
  sources: CurationSource[];
  newestAt: string | null;
  rationale: string[];
  score: number;
};

const TOPIC_QUERIES: Record<TodayTopic, readonly NewsSearchTopic[]> = {
  startup: ["startup"],
  technology: ["startup", "economy"],
  funding: ["finance", "policy"],
  policy: ["policy"],
  global: ["economy"],
};

export function requiredSearchTopics(selected: readonly TodayTopic[]): NewsSearchTopic[] {
  // No "personalized" ranking without a preference.
  const set = new Set<NewsSearchTopic>();
  for (const topic of selected) for (const key of TOPIC_QUERIES[topic]) set.add(key);
  return Array.from(set);
}

const HEADLINE_STOPWORDS = new Set([
  "대한", "관련", "오늘", "정부", "한국", "올해", "이후", "이번", "전망", "뉴스",
  "확대", "발표", "최신", "긴급", "속보", "계속", "속도", "기자", "단독", "이유",
  "시장", "기업", "기사", "가능", "상황", "본격", "대상", "전국", "새로운",
]);

function meaningfulTerms(headline: string): Set<string> {
  const clean = headline
    .replace(/^\s*(?:\[[^\]]{1,20}\]|【[^】]{1,20}】)\s*/g, "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ");
  return new Set(clean.split(/\s+/).filter(word => word.length >= 2 && !HEADLINE_STOPWORDS.has(word)));
}

export function likelySameHeadlineEvent(a: string, b: string): boolean {
  const left = meaningfulTerms(a), right = meaningfulTerms(b);
  if (left.size < 4 || right.size < 4) return a.trim() === b.trim();
  let shared = 0;
  for (const term of left) if (right.has(term)) shared++;
  const union = left.size + right.size - shared;
  return shared >= 4 && shared / union >= 0.76;
}
function asMillis(iso: string | null): number | null {
  if (!iso) return null;
  const ms = Date.parse(iso);
  return Number.isFinite(ms) ? ms : null;
}
function eligibleArticle(article: NewsSearchItem, nowMs: number): boolean {
  const time = asMillis(article.publishedAt);
  // Unknown publication date is never called "recent"; allow with lower rank.
  if (time === null) return true;
  return time <= nowMs + 6 * 3600_000 && time >= nowMs - 14 * 86_400_000;
}
function articleTopicMatches(title: string, focus: readonly TodayTopic[]): TodayTopic[] {
  return focus.filter(topic => matchesTodayTopic(title, topic));
}

export function curateFromHeadlines(
  snapshots: readonly NewsSearchSnapshot[],
  interests: readonly TodayTopic[],
  now = new Date(),
  maxIssues = 5,
): CuratedIssue[] {
  if (interests.length === 0 || maxIssues <= 0) return [];
  const nowMs = now.getTime();
  const allowed = new Set(requiredSearchTopics(interests));
  // Each original URL only once even if multiple SerpApi topic queries surface it.
  const unique = new Map<string, CurationSource>();
  for (const snapshot of snapshots) {
    if (!allowed.has(snapshot.topic)) continue;
    for (const item of snapshot.items) {
      if (!item.url || unique.has(item.url) || !eligibleArticle(item, nowMs)) continue;
      if (articleTopicMatches(item.title, interests).length === 0) continue;
      unique.set(item.url, { ...item, searchTopic: snapshot.topic });
    }
  }

  // Cluster only close headline matches, not broad thematic co-mentions.
  const groupList: CurationSource[][] = [];
  for (const item of unique.values()) {
    const target = groupList.find(group => group.some(other => {
      const left = asMillis(other.publishedAt), right = asMillis(item.publishedAt);
      const closeInTime = left === null || right === null || Math.abs(left - right) <= 72 * 3600_000;
      return closeInTime && likelySameHeadlineEvent(other.title, item.title);
    }));
    if (target) target.push(item);
    else groupList.push([item]);
  }

  return groupList.map((sources, i) => {
    const ordered = [...sources].sort((a, b) =>
      (asMillis(b.publishedAt) ?? 0) - (asMillis(a.publishedAt) ?? 0) ||
      a.sourceName.localeCompare(b.sourceName, "ko"));
    const matched = interests.filter(topic => ordered.some(item => matchesTodayTopic(item.title, topic)));
    const dates = ordered.map(row => asMillis(row.publishedAt)).filter((v): v is number => v !== null);
    const freshest = dates.length ? Math.max(...dates) : null;
    const days = freshest === null ? null : Math.max(0, (nowMs - freshest) / 86_400_000);
    const outletCount = new Set(ordered.map(s => s.sourceName.trim())).size;
    // Ranking = topic match count, recent timestamp, deduplicated related titles.
    const score = matched.length * 20 +
      (days === null ? 0 : Math.max(0, 15 - days * 2)) +
      Math.min(8, (outletCount - 1) * 4) +
      Math.min(3, sources.length - 1);
    const rationale = [
      ...matched.map(topic => (TODAY_TOPICS.find(t => t.id === topic)?.label || topic) + " 관심사와 제목 일치"),
      days === null ? "발행일 확인 필요" : days < 1 ? "최근 24시간 내 보도" : "최근 14일 내 보도",
      ...(outletCount > 1 ? [`복수 매체의 유사 제목 ${outletCount}곳 · 독립 취재 여부 미검증`] : []),
    ];
    return {
      id: ordered[0].url,
      title: ordered[0].title,
      matchTopics: matched,
      sources: ordered,
      newestAt: freshest === null ? null : new Date(freshest).toISOString(),
      rationale,
      score,
      // used only for stable first-tie order
      _order: i,
    };
  }).sort((a, b) =>
    b.score - a.score || (asMillis(b.newestAt) ?? 0) - (asMillis(a.newestAt) ?? 0) ||
    a._order - b._order
  ).slice(0, Math.min(5, maxIssues)).map(({ _order: _unused, ...issue }) => issue);
}
