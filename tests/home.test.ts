import { describe, it, expect } from "vitest";
import {
  selectHome,
  matchedTopics,
  recommendationReason,
  parsePreferences,
  EMPTY_PREFERENCES,
} from "@/lib/home/model";
import type { PublicEvent } from "@/types/domain";
const event = (
  id: string,
  category: PublicEvent["primaryCategory"],
  title: string,
  importanceScore = 80,
): PublicEvent => ({
  id,
  primaryCategory: category,
  representativeTitle: title,
  importanceScore,
  grade: "A",
  isMock: true,
  articleCount: 1,
  sourceCount: 1,
  officialSourceAvailable: false,
  firstSeenAt: "2026-10-10T00:00:00.000Z",
  lastSeenAt: "2026-10-10T00:00:00.000Z",
  sources: [],
  analysis: {
    primaryCategory: category,
    secondaryCategories: [],
    tags: [],
    importance: {
      socialImportance: 10,
      policyImpact: 15,
      industryImpact: 10,
      novelty: 10,
      actionability: 5,
    },
    headlineSummary: title,
    keyPoints: [],
    whyItMatters: "해석",
    isOpportunity: false,
    opportunity: "",
    risk: "확인 필요",
    followUp: [],
    confidence: 0.5,
  },
});
const events = [
  event("ai", "AI_TECH", "AI 기술 발표"),
  event("housing", "REAL_ESTATE", "주거 공급계획", 95),
  event("policy", "POLICY", "제도 개정"),
];
describe("declared-interest Home", () => {
  it("cold start and opt-out expose public significance without invented For You", () => {
    expect(selectHome(events, EMPTY_PREFERENCES).forYou).toEqual([]);
    expect(selectHome(events, EMPTY_PREFERENCES).mustKnow[0].id).toBe(
      "housing",
    );
    expect(
      selectHome(events, {
        ...EMPTY_PREFERENCES,
        topics: ["ai"],
        enabled: false,
      }).forYou,
    ).toEqual([]);
  });
  it("two independent profiles receive different For You and a distinct Must Know", () => {
    const a = selectHome(events, { ...EMPTY_PREFERENCES, topics: ["ai"] });
    const b = selectHome(events, { ...EMPTY_PREFERENCES, topics: ["housing"] });
    expect(a.forYou.map((e) => e.id)).toEqual(["ai"]);
    expect(b.forYou.map((e) => e.id)).toEqual(["housing"]);
    expect(a.mustKnow.some((e) => e.id === "housing")).toBe(true);
    expect(a.mustKnow.some((e) => e.id === "ai")).toBe(false);
  });
  it("does not fill a weak match or mutate the public Event", () => {
    const before = JSON.stringify(events);
    expect(
      selectHome(events, { ...EMPTY_PREFERENCES, topics: ["research"] }).forYou,
    ).toEqual([]);
    expect(JSON.stringify(events)).toBe(before);
    expect(recommendationReason(events[0], EMPTY_PREFERENCES)).not.toContain(
      "%",
    );
  });
  it("does not match the substring ai inside unrelated words", () => {
    expect(
      matchedTopics(event("x", "OTHER", "Retail market briefing"), ["ai"]),
    ).toEqual([]);
  });
  it("hides explicitly rejected items and excludes unconfirmed live radar notices", () => {
    expect(
      selectHome(events, {
        ...EMPTY_PREFERENCES,
        hidden: ["housing"],
      }).visible.some((e) => e.id === "housing"),
    ).toBe(false);
    const candidate = {
      ...events[0],
      isMock: false,
      analysis: { ...events[0].analysis, isOpportunity: true },
    };
    expect(selectHome([candidate], EMPTY_PREFERENCES).radar).toEqual([]);
    expect(
      selectHome(
        [{ ...candidate, officialSourceAvailable: true }],
        EMPTY_PREFERENCES,
      ).radar,
    ).toHaveLength(1);
  });
  it("sanitizes malformed local preferences and limits declared topics", () => {
    expect(parsePreferences("{invalid")).toEqual(EMPTY_PREFERENCES);
    expect(parsePreferences("null")).toEqual(EMPTY_PREFERENCES);
    expect(
      parsePreferences(
        JSON.stringify({
          topics: ["ai", "ai", "unknown", 2],
          saved: ["x", 5],
          enabled: false,
        }),
      ),
    ).toEqual({ topics: ["ai"], saved: ["x"], hidden: [], enabled: false });
  });
});
