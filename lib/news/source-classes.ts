/**
 * Source-class navigation contract for future multi-source NOAH ARK.
 * This file is pure and NOT connected to production source collection or UI.
 *
 * Classifying publishers is different from classifying article TOPICS.
 * No inferred ideological labels, commercial rights, or AI analysis grants.
 */
export type NoahSourceClass = "article" | "policy" | "informant";
export type NoahSourceFilter = "all" | NoahSourceClass;

export const NOAH_SOURCE_FILTERS = [
  { id: "all", label: "전체" },
  { id: "article", label: "기사" },
  { id: "policy", label: "정책소식" },
  { id: "informant", label: "정보원 소식" },
] as const satisfies readonly { id: NoahSourceFilter; label: string }[];

export type VerifiedOriginType = "NEWS_MEDIA" | "GOVERNMENT" | "EXPERT_COMMENTARY";

export function sourceClassFromOrigin(origin: VerifiedOriginType): NoahSourceClass {
  if (origin === "NEWS_MEDIA") return "article";
  if (origin === "GOVERNMENT") return "policy";
  return "informant";
}

export function matchesSourceFilter(sourceClass: NoahSourceClass, filter: NoahSourceFilter): boolean {
  return filter === "all" || filter === sourceClass;
}
