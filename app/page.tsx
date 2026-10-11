import Link from 'next/link';
import { Header } from '@/components/Header';
import { getEdition } from '@/lib/data';
export const dynamic = 'force-dynamic';
export default async function Home() {
  const edition = await getEdition();
  return <><Header/><main className="shell content"><h1>Today&apos;s Ark</h1>
    <p>{edition.mode === 'mock' ? 'DEMO · 가상 Event입니다. 실제 뉴스가 아닙니다.' : '공개 주요 변화'}</p>
    <p>발행 기준: {edition.date ?? '아직 발행되지 않았습니다.'}</p>
    {edition.items.map(event => <article className="card" key={event.id}><h2><Link href={`/event/${event.id}`}>{event.representativeTitle}</Link></h2><p>{event.analysis.headlineSummary}</p><p>확인된 출처 {event.sourceCount}개</p></article>)}
  </main></>;
}
