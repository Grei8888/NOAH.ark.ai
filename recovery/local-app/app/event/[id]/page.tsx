import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPublicEvent } from '@/lib/data';
import { Badges } from '@/components/EventCard';
import { formatKorea } from '@/lib/time/korea';
export const dynamic = 'force-dynamic';
export async function generateMetadata({ params }: {
    params: Promise<{
        id: string;
    }>;
}) { const event = await getPublicEvent((await params).id); return { title: event?.representativeTitle ?? 'Event', description: event?.analysis.headlineSummary }; }
export default async function EventPage({ params }: {
    params: Promise<{
        id: string;
    }>;
}) {
    const event = await getPublicEvent((await params).id);
    if (!event)
        notFound();
    const a = event.analysis;
    return <main id="main" className="detail"><Link className="back" href="/">← Today’s Ark</Link><Badges event={event}/><h1>{event.representativeTitle}</h1><p className="detail-summary">{a.headlineSummary}</p>{event.isMock && <div className="demo-banner">가상 자료 · 실제 정책이나 공고가 아닙니다.</div>}<section><p className="eyebrow">01 / FACT</p><h2>핵심 사실</h2><ul>{a.keyPoints.map(p => <li key={p}>{p}</li>)}</ul></section><section><p className="eyebrow">02 / INTERPRETATION</p><h2>왜 중요한가</h2><p>{a.whyItMatters}</p><div className="detail-columns"><div><h3>기회</h3><p>{a.opportunity || '현재 자료에서 확인된 기회가 없습니다.'}</p></div><div><h3>위험·불확실성</h3><p>{a.risk}</p></div></div></section><section><p className="eyebrow">03 / NEXT CHECK</p><h2>후속 확인</h2><ul>{a.followUp.map(p => <li key={p}>{p}</li>)}</ul><p className="muted">개인 관련성 분석은 관리자 전용 화면에서 제공합니다.</p></section><section><p className="eyebrow">04 / SOURCES & TIMELINE</p><h2>출처와 시간 순 업데이트</h2>{[...event.sources].sort((a, b) => a.publishedAt.localeCompare(b.publishedAt)).map(s => <article className="source" key={s.id}><span>{formatKorea(s.publishedAt)} KST · {['GOVERNMENT', 'PUBLIC_AGENCY'].includes(s.sourceType) ? '공식자료' : '언론기사'} · {s.sourceName}</span>{event.isMock ? <p>{s.title} <small>(가상 원문)</small></p> : <a href={s.url} target="_blank" rel="noopener noreferrer">{s.title} ↗</a>}</article>)}</section></main>;
}
