import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { mockEvents } from "@/lib/domain/mock-events";

export default async function EventPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const event = mockEvents.find((item) => item.id === id);

  if (!event) notFound();

  return (
    <>
      <Header />
      <main className="detail">
        <div className="shell">
          <Link href="/" className="back">← Today's Ark</Link>

          <div className="cardTop">
            <span className="badge category">{event.primaryCategory}</span>
            <span className="badge grade">{event.grade}</span>
            {event.isOpportunity && <span className="badge opportunity">Opportunity</span>}
          </div>

          <h1>{event.representativeTitle}</h1>
          <p className="detailLead">{event.headlineSummary}</p>

          <section className="detailSection">
            <h2>Fact · 핵심 확인사항</h2>
            <ul>
              {event.keyPoints.map((point) => <li key={point}>{point}</li>)}
            </ul>
          </section>

          <section className="detailSection">
            <h2>Why it matters · 해석</h2>
            <p>{event.whyItMatters}</p>
          </section>

          <section className="detailSection">
            <h2>Grei view · 사용자 시사점</h2>
            <p>{event.userImplication}</p>
          </section>

          {event.opportunity && (
            <section className="detailSection">
              <h2>Opportunity</h2>
              <p>{event.opportunity}</p>
            </section>
          )}

          {event.risk && (
            <section className="detailSection">
              <h2>Risk</h2>
              <p>{event.risk}</p>
            </section>
          )}

          <section className="detailSection">
            <h2>Next action</h2>
            <ul>
              {event.followUp.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </section>

          <section className="detailSection">
            <h2>Sources</h2>
            <div className="sourceList">
              {event.sources.map((source) => (
                <a
                  key={`${source.sourceName}-${source.url}`}
                  href={source.url}
                  target="_blank"
                  rel="noreferrer"
                  className="source"
                >
                  <span>
                    <strong>{source.sourceName}</strong><br />
                    {source.title}
                  </span>
                  <span>원문 보기 ↗</span>
                </a>
              ))}
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
