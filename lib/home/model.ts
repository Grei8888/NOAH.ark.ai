import type { Category, PublicEvent } from "@/types/domain";

export const TOPICS = [
  {
    id: "ai",
    label: "AI · 기술",
    categories: ["AI_TECH"],
    terms: ["AI", "인공지능", "기술", "로봇"],
  },
  {
    id: "startup",
    label: "창업 · 사업",
    categories: [],
    terms: ["창업", "스타트업", "사업화", "참여기업"],
  },
  {
    id: "policy",
    label: "정책 · 제도",
    categories: ["POLICY"],
    terms: ["정책", "제도", "정부", "개정"],
  },
  {
    id: "finance",
    label: "금융 · 경제",
    categories: ["FINANCE"],
    terms: ["금융", "투자", "정책자금"],
  },
  {
    id: "housing",
    label: "주거 · 부동산",
    categories: ["REAL_ESTATE"],
    terms: ["주거", "주택", "매입약정"],
  },
  { id: "region", label: "지역 변화", categories: ["REGIONAL"], terms: [] },
  {
    id: "research",
    label: "교육 · 연구",
    categories: ["NEURO_EDU"],
    terms: ["연구", "교육"],
  },
] as const;
export const CATEGORY_LABELS: Record<Category, string> = {
  POLICY: "정책·제도",
  REAL_ESTATE: "주거·부동산",
  FINANCE: "금융·경제",
  AI_TECH: "AI·기술",
  NEURO_EDU: "교육·연구",
  REGIONAL: "지역",
  OTHER: "기타",
};
export interface Preferences {
  topics: string[];
  enabled: boolean;
  saved: string[];
  hidden: string[];
}
export const EMPTY_PREFERENCES: Preferences = {
  topics: [],
  enabled: true,
  saved: [],
  hidden: [],
};
export function parsePreferences(raw: string): Preferences {
  try {
    const value = JSON.parse(raw);
    const strings = (input: unknown) =>
      Array.isArray(input)
        ? [
            ...new Set(
              input.filter(
                (x): x is string => typeof x === "string" && x.length <= 100,
              ),
            ),
          ].slice(0, 300)
        : [];
    return {
      topics: strings(value.topics)
        .filter((id) => TOPICS.some((t) => t.id === id))
        .slice(0, 5),
      enabled: value.enabled !== false,
      saved: strings(value.saved),
      hidden: strings(value.hidden),
    };
  } catch {
    return EMPTY_PREFERENCES;
  }
}
export function matchedTopics(event: PublicEvent, selected: string[]) {
  // Transparent declared-topic matching, not a semantic relevance or match-probability claim.
  const text = [
    event.representativeTitle,
    event.analysis.headlineSummary,
    ...event.analysis.tags,
  ]
    .join(" ")
    .normalize("NFKC")
    .toLowerCase();
  return TOPICS.filter(
    (topic) =>
      selected.includes(topic.id) &&
      ((topic.categories as readonly string[]).includes(
        event.primaryCategory,
      ) ||
        topic.terms.some((term) =>
          term === "AI"
            ? /\bai\b/i.test(text)
            : text.includes(term.toLowerCase()),
        )),
  );
}
export function selectHome(events: PublicEvent[], prefs: Preferences) {
  const visible = events.filter((event) => !prefs.hidden.includes(event.id));
  const ranked = [...visible].sort(
    (a, b) =>
      b.importanceScore - a.importanceScore ||
      b.lastSeenAt.localeCompare(a.lastSeenAt) ||
      a.id.localeCompare(b.id),
  );
  const forYou =
    prefs.enabled && prefs.topics.length
      ? [...visible]
          .filter((event) => matchedTopics(event, prefs.topics).length)
          .sort(
            (a, b) =>
              matchedTopics(b, prefs.topics).length -
                matchedTopics(a, prefs.topics).length ||
              b.importanceScore - a.importanceScore ||
              a.id.localeCompare(b.id),
          )
          .slice(0, 5)
      : [];
  const personalIDs = new Set(forYou.map((event) => event.id));
  const mustKnow = ranked
    .filter((event) => !personalIDs.has(event.id))
    .slice(0, 3);
  // Every item remains a candidate requiring original notice review, never an eligibility claim.
  const radar = ranked
    .filter(
      (event) =>
        event.analysis.isOpportunity &&
        (event.isMock || event.officialSourceAvailable),
    )
    .slice(0, 3);
  return { forYou, mustKnow, radar, visible: ranked };
}
export function recommendationReason(event: PublicEvent, prefs: Preferences) {
  const topics = prefs.enabled ? matchedTopics(event, prefs.topics) : [];
  return topics.length
    ? `선택한 ${topics
        .map((t) => t.label)
        .slice(0, 3)
        .join(" / ")} 주제와 관련`
    : "개인 관심사와 별도로 중요도와 출처를 기준으로 선별";
}
export function relativeTime(date: string, now: string) {
  const hours = Math.max(
    0,
    Math.floor((Date.parse(now) - Date.parse(date)) / 3600000),
  );
  if (hours < 1) return "1시간 이내";
  if (hours < 24) return `${hours}시간 전`;
  return `${Math.floor(hours / 24)}일 전`;
}
