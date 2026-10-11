import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPublicEvent } from '@/lib/data';
export const dynamic = 'force-dynamic';
export default async function EventPage({ params }: { params: Promise<{ id: string }> }) {
 const { id } = await params; const event = await getPublicEvent(id); if (!event) notFound();
 return <main className="shell detail"><Link href="/">← Today&apos;s Ark</Link>
 {event.isMock && <p>DEMO · 가상 Event입니다. 실제 뉴스가 아닙니다.</p>}
 <h1>{event.representativeTitle}</h1><p>{event.analysis.headlineSummary}</p>
 <h2>핵심 확인사항</h2><ul>{event.analysis.keyPoints.map(p=><li key={p}>{p}</li>)}</ul>
 <h2>왜 중요한가 · 해석</h2><p>{event.analysis.whyItMatters}</p>
 <h2>확인할 사항</h2><p>{event.analysis.risk}</p><ul>{event.analysis.followUp.map(p=><li key={p}>{p}</li>)}</ul>
 <h2>원문 출처</h2>{event.sources.map(s=><p key={s.id}>{event.isMock ? s.sourceName : <a href={s.url} target="_blank" rel="noopener noreferrer">{s.sourceName} · {s.title} ↗</a>}</p>)}
 </main>;
}
