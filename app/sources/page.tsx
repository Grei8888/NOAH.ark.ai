import type { Metadata } from 'next';
import Link from 'next/link';
import { AppShell } from '@/components/home/AppShell';
import { getSourceLinks, sourceDiscoveryEnabled } from '@/lib/source-links';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  title: '원문 탐색 | NOAH ARK',
  description: '검증 중인 공식 뉴스·공고의 원문 링크를 출처별로 확인하세요. AI 분석이나 추천이 아닙니다.',
  robots: { index: false, follow: true },
};

export default async function SourcesPage() {
  const enabled = sourceDiscoveryEnabled();
  const sources = enabled ? await getSourceLinks() : [];
  const formatted = new Intl.DateTimeFormat('ko-KR', {
    timeZone: 'Asia/Seoul',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  });
  return (
    <AppShell view="discover" rail={
      <section className="railPanel">
        <div className="railEyebrow">EVIDENCE FIRST</div>
        <h2>원문이 우선입니다.</h2>
        <p>여기에 표시된 링크는 수집된 자료의 목록입니다. 사건의 중요도, 정책 확정 여부, 사용자 관련성을 평가하지 않습니다.</p>
        <Link className="textLink" href="/">Intelligence Desk로 돌아가기 →</Link>
      </section>
    }>
      <div className="topUtility">
        <span>SOURCE DISCOVERY</span>
        <Link href="/">홈으로 돌아가기 →</Link>
      </div>
      <header className="homeIntro">
        <div className="dateLine">NOAH ARK <span>ORIGINAL SOURCES</span></div>
        <p className="greeting">Evidence before interpretation.</p>
        <h1>원문을 먼저 확인하세요.</h1>
        <div className="editionLine"><span className="signalDot" /><span>{sources.length}개 수집 자료 · 최근 14일</span></div>
      </header>
      <div className="trustNotice" role="note">
        <strong>원문 탐색</strong>
        <span>AI 브리핑·Event 분석·추천이 아닙니다. 원문 내용과 적용 요건은 해당 기관에서 확인하세요.</span>
      </div>
      <section className="feedSection" aria-label="수집된 공식 자료">
        <div className="sectionHeading">
          <div><h2>ORIGINAL SOURCES</h2><p>확인된 출처와 원문 링크만 제공합니다.</p></div>
          <span>{sources.length} LINKS</span>
        </div>
        {!enabled ? (
          <p className="emptyState">원문 탐색 기능은 아직 공개되지 않았습니다. 출처별 이용 조건을 확인한 뒤 활성화합니다.</p>
        ) : sources.length === 0 ? (
          <p className="emptyState">최근 14일간 수집된 원문 링크가 없습니다. 실제 뉴스 수집이 완료되면 표시됩니다.</p>
        ) : (
          sources.map((source) => (
            <article className="sourcePerspective" key={source.id}>
              <div className="eventMeta">
                <span>{source.sourceName}</span>
                <span><time dateTime={source.publishedAt}>{formatted.format(new Date(source.publishedAt))} KST</time></span>
              </div>
              <h3>{source.title}</h3>
              <a href={source.url} target="_blank" rel="noopener noreferrer">
                원문 기사·공고 열기 ↗
              </a>
            </article>
          ))
        )}
      </section>
    </AppShell>
  );
}
