import type { NoahEvent } from "@/types/news";
import { SCORE_CONFIG } from "@/lib/scoring/config";

export function selectArkEvents(events: NoahEvent[]): NoahEvent[] {
  const eligible = events
    .filter((event) => event.finalScore >= SCORE_CONFIG.ark.minimumFinalScore)
    .sort((a, b) => b.finalScore - a.finalScore);

  const categoryCounts = new Map<string, number>();
  const selected: NoahEvent[] = [];

  for (const event of eligible) {
    const count = categoryCounts.get(event.primaryCategory) ?? 0;

    if (count >= SCORE_CONFIG.ark.maxPerCategory) {
      continue;
    }

    selected.push(event);
    categoryCounts.set(event.primaryCategory, count + 1);

    if (selected.length >= SCORE_CONFIG.ark.maxEvents) {
      break;
    }
  }

  return selected;
}
