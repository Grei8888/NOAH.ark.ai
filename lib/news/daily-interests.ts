import type { OfficialSourceLink } from '@/lib/news/public-official-sources';

// These are simple title-keyword filters, not AI classifications or recommendations.
// Topic coverage is bounded by the two currently connected MSS RSS feeds.
export const TODAY_TOPICS = [
  { id: 'startup', label: '창업·소상공인' },
  { id: 'technology', label: 'AI·기술' },
  { id: 'funding', label: '금융·지원' },
  { id: 'policy', label: '정책·제도' },
  { id: 'global', label: '수출·해외' },
] as const;

export type TodayTopic = (typeof TODAY_TOPICS)[number]['id'];
const topicIds = new Set<string>(TODAY_TOPICS.map(t => t.id));

const rules: Record<TodayTopic, RegExp> = {
  startup: /창업|스타트업|벤처|소상공인|자영업|청년기업|사업화|예비창업/i,
  technology: /인공지능|(?:^|\W)AI(?:\W|$)|딥테크|데이터|연구개발|(?:^|\W)R&D(?:\W|$)|디지털|반도체|로봇|스마트|기술|실증|혁신/i,
  funding: /지원금|지원자금|정책자금|투자|융자|금융|보증|펀드|자금|예산|재정|보조금|바우처/i,
  policy: /정책|규제|법령|법률|시행령|시행규칙|개정|공청회|제도|고시|조례|행정|입법/i,
  global: /수출|해외|글로벌|수입|통상|국제|무역|FTA|외국|국외|진출/i,
};

export function todayKstDate(date = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(date);
  const get = (type: string) => parts.find(p => p.type === type)?.value ?? '';
  return `${get('year')}-${get('month')}-${get('day')}`;
}

export function validTodayTopics(value: unknown): TodayTopic[] {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.filter((t): t is TodayTopic => typeof t === 'string' && topicIds.has(t)))].slice(0, TODAY_TOPICS.length);
}

export function restoreTodayTopics(stored: string | null, today: string): TodayTopic[] {
  if (!stored) return [];
  try {
    const parsed: unknown = JSON.parse(stored);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return [];
    const value = parsed as { date?: unknown; topics?: unknown };
    if (value.date !== today) return [];
    return validTodayTopics(value.topics);
  } catch {
    return [];
  }
}

export function matchesTodayTopic(title: string, topic: TodayTopic): boolean {
  return rules[topic].test(title);
}

export function filterTodaySources<T extends Pick<OfficialSourceLink, 'title'>>(
  sources: readonly T[],
  topics: readonly TodayTopic[],
): T[] {
  if (topics.length === 0) return [...sources];
  return sources.filter(s => topics.some(t => matchesTodayTopic(s.title, t)));
}
