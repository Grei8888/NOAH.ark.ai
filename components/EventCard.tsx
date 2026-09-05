import Link from "next/link";
import type { NoahEvent } from "@/types/news";

const CATEGORY_LABEL: Record<string, string> = {
  POLICY: "Policy",
  REAL_ESTATE: "Real Estate",
  FINANCE: "Finance",
  AI_TECH: "AI · Tech",
  NEURO_EDU: "Neuro · Edu",
  REGIONAL: "Regional",
  OTHER: "Other"
};

export function EventCard({
  event,
  rank
}: {
  event: NoahEvent;
  rank: number;
}) {
  return (
    <article className="card">
      <div className="cardTop">
        <span className="rank">{String(rank).padStart(2, "0")}</span>
        <span className="badge category">{CATEGORY_LABEL[event.primaryCategory]}</span>
        <span className="badge grade">{event.grade}</span>
        {event.isOpportunity && <span className="badge opportunity">Opportunity</span>}
      </div>

      <Link href={`/event/${event.id}`}>
        <h3>{event.representativeTitle}</h3>
      </Link>

      <div className="headline">{event.headlineSummary}</div>

      <div className="insightGrid">
        <div className="insight">
          <div className="insightLabel">Why it matters</div>
          <p>{event.whyItMatters}</p>
        </div>
        <div className="insight">
          <div className="insightLabel">Grei view</div>
          <p>{event.userImplication}</p>
        </div>
        <div className="insight">
          <div className="insightLabel">Next action</div>
          <p>{event.followUp[0] ?? "추가 확인 없음"}</p>
        </div>
      </div>

      <div className="cardFoot">
        <span>
          독립 출처 {event.sourceCount}곳 · 관련 보도 {event.articleCount}건
          {event.officialSourceAvailable ? " · 공식자료 확인" : ""}
        </span>
        {event.opportunity && <span className="signal">기회 신호 있음</span>}
      </div>
    </article>
  );
}
