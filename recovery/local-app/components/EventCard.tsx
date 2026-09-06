import Link from 'next/link';
import type { PublicEvent, Category } from '@/types/domain';
import { demoUseCase } from '@/lib/demo-use-cases';
export const categoryNames: Record<Category, string> = { POLICY: '정책·행정', REAL_ESTATE: '부동산·주거', FINANCE: '금융', AI_TECH: 'AI·기술', NEURO_EDU: '뇌과학·교육', REGIONAL: '지역', OTHER: '기타' };
export function Badges({ event }: {
    event: PublicEvent;
}) { return <div className="badges"><span>{categoryNames[event.primaryCategory]}</span><span className="grade">{event.grade}</span>{event.analysis.isOpportunity && <span className="opportunity">↗ 기회</span>}{event.officialSourceAvailable && <span className="official">공식자료 포함</span>}</div>; }
export default function EventCard({ event, rank }: {
    event: PublicEvent;
    rank: number;
}) { const useCase = event.isMock ? demoUseCase(event.representativeTitle) : undefined; return <article className="event-card"><div className="rank">{String(rank).padStart(2, '0')}</div><div className="event-body"><Badges event={event}/><h2><Link href={`/event/${event.id}`}>{event.representativeTitle}<span aria-hidden="true"> ↗</span></Link></h2><p className="summary">{event.analysis.headlineSummary}</p><div className="insight"><span>왜 중요한가 <small>해석</small></span><p>{event.analysis.whyItMatters}</p></div>{event.analysis.isOpportunity && <div className="opportunity-line">↗ {event.analysis.opportunity}</div>}{useCase && <div className="client-workflow"><span>상담 연결 예시 · {useCase.client}</span><p>{useCase.value}</p><strong>첫 확인: {useCase.checks[0]}</strong></div>}<details><summary>위험과 후속 확인</summary><p>{event.analysis.risk}</p><ul>{event.analysis.followUp.map(item => <li key={item}>{item}</li>)}</ul></details><div className="card-bottom"><span>관련 보도 {event.articleCount}건 <i>·</i> {event.sourceCount}개 출처</span><Link href={`/event/${event.id}`}>분석과 출처 보기 <span aria-hidden="true">→</span></Link></div></div></article>; }
