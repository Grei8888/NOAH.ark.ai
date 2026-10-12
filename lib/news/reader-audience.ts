import type { TodayTopic } from "@/lib/news/daily-interests";

/**
 * Declared onboarding goals, not inferred identity or ML personalization.
 * The current public beta has only ministry RSS; a goal offers one optional
 * TODAY_TOPICS keyword shortcut. It must not imply AI understanding or broad media coverage.
 */
export const READER_AUDIENCES = [
  {
    id: "startup",
    label: "창업을 준비하고 있어요",
    name: "창업 준비자",
    headline: "창업의 첫걸음, 공식 정보를 놓치지 않도록.",
    description: "지원사업과 창업 제도를 원문으로 확인해 보세요.",
    topic: "startup",
    topicLabel: "창업·소상공인 소식 보기",
  },
  {
    id: "business",
    label: "사업을 운영하고 있어요",
    name: "사업 운영자",
    headline: "경영에 필요한 변화를 스스로 읽을 수 있도록.",
    description: "정책자금과 기업 지원 소식부터 살펴보세요.",
    topic: "funding",
    topicLabel: "금융·지원 소식 보기",
  },
  {
    id: "economy",
    label: "경제를 배우고 싶어요",
    name: "경제 입문자",
    headline: "낯선 경제 용어도 하나씩 알아가도록.",
    description: "현재는 정부 정책·제도 원문을 먼저 제공합니다.",
    topic: "policy",
    topicLabel: "정책·제도 소식 보기",
  },
] as const satisfies readonly {
  id: string;
  label: string;
  name: string;
  headline: string;
  description: string;
  topic: TodayTopic;
  topicLabel: string;
}[];

export type ReaderAudience = (typeof READER_AUDIENCES)[number]["id"];
export function validReaderAudience(value: unknown): ReaderAudience | null {
  return typeof value === "string" &&
    READER_AUDIENCES.some((audience) => audience.id === value)
    ? value as ReaderAudience
    : null;
}
export function readerAudienceInfo(id: ReaderAudience) {
  return READER_AUDIENCES.find((audience) => audience.id === id)!;
}
