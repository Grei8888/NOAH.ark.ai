import { describe, expect, it } from 'vitest';
import {
  filterTodaySources, matchesTodayTopic, restoreTodayTopics,
  todayKstDate, validTodayTopics, TODAY_TOPICS,
} from '@/lib/news/daily-interests';

describe('local-only daily topic filter', () => {
  it('uses Korea date, not a device or UTC timezone, for the day boundary', () => {
    expect(todayKstDate(new Date('2026-10-11T14:59:59.000Z'))).toBe('2026-10-11');
    expect(todayKstDate(new Date('2026-10-11T15:00:00.000Z'))).toBe('2026-10-12');
  });

  it('accepts only declared unique topics and refuses malformed storage', () => {
    expect(validTodayTopics(['technology', 'funding', 'technology', 'unknown', 1])).toEqual(['technology', 'funding']);
    expect(validTodayTopics('technology')).toEqual([]);
    expect(validTodayTopics(TODAY_TOPICS.map(t => t.id))).toHaveLength(5);
    expect(restoreTodayTopics('not JSON', '2026-10-12')).toEqual([]);
    expect(restoreTodayTopics('{"date":"2026-10-12","topics":["policy","policy","invalid"]}', '2026-10-12')).toEqual(['policy']);
    expect(restoreTodayTopics('{"date":"2026-10-11","topics":["policy"]}', '2026-10-12')).toEqual([]);
  });

  it('filters already-retrieved titles locally with OR semantics and no request', () => {
    const articles = [
      { title: 'AI 기술 실증과 로봇 지원', url: 'https://mss.go.kr/1' },
      { title: '수출 확대 및 글로벌 시장 진출', url: 'https://mss.go.kr/2' },
      { title: '소상공인 창업 지원 안내', url: 'https://mss.go.kr/3' },
      { title: '정부의 법령 규제 개정', url: 'https://mss.go.kr/4' },
      { title: '정책자금 융자 지원', url: 'https://mss.go.kr/5' },
      { title: '기타 보도자료', url: 'https://mss.go.kr/6' },
    ];
    expect(filterTodaySources(articles, [])).toEqual(articles);
    expect(filterTodaySources(articles, ['technology']).map(a => a.url)).toEqual(['https://mss.go.kr/1']);
    expect(filterTodaySources(articles, ['technology', 'global']).map(a => a.url)).toEqual(['https://mss.go.kr/1', 'https://mss.go.kr/2']);
    expect(filterTodaySources(articles, ['policy']).map(a => a.url)).toEqual(['https://mss.go.kr/4', 'https://mss.go.kr/5']);
    expect(filterTodaySources(articles, ['startup']).map(a => a.url)).toEqual(['https://mss.go.kr/3']);
    expect(filterTodaySources(articles, ['funding']).map(a => a.url)).toEqual(['https://mss.go.kr/5']);
    expect(articles).toHaveLength(6);
  });

  it('does not mistake generic ministry or press release words for topic relevance', () => {
    expect(matchesTodayTopic('중소기업 지원사업 일반 공고', 'startup')).toBe(false);
    expect(matchesTodayTopic('중소기업 지원사업 일반 공고', 'funding')).toBe(false);
    expect(matchesTodayTopic('중소기업 지원사업 일반 공고', 'policy')).toBe(false);
    expect(matchesTodayTopic('AI 실증사업 모집', 'technology')).toBe(true);
  });
});
