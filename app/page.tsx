import { EventCard } from "@/components/EventCard";
import { Header } from "@/components/Header";
import { getTodaysArk } from "@/lib/ark/today";

export default function Home() {
  const ark = getTodaysArk();
  const opportunities = ark.filter((event) => event.isOpportunity).length;
  const urgent = ark.filter((event) => event.grade === "A+").length;

  return (
    <>
      <Header />

      <main>
        <section className="hero">
          <div className="shell">
            <div className="eyebrow">Today's Ark · Demo Mode</div>
            <h1>Only What Matters.</h1>
            <p>
              정보의 홍수에서 오늘 반드시 알아야 할 변화만 남깁니다.
              기사를 나열하지 않고 사건을 묶어 중요도, 관련성, 다음 행동까지 정리합니다.
            </p>

            <div className="summaryStrip">
              <div className="stat">
                <strong>{ark.length}</strong>
                <span>오늘의 핵심 변화</span>
              </div>
              <div className="stat">
                <strong>{opportunities}</strong>
                <span>기회 신호</span>
              </div>
              <div className="stat">
                <strong>{urgent}</strong>
                <span>즉시 확인 A+</span>
              </div>
            </div>
          </div>
        </section>

        <section className="content">
          <div className="shell">
            <div className="demoNotice">
              현재 화면은 구조 검증용 Mock 데이터입니다. 실제 뉴스·기관 발표로 오해하지 않도록
              Production 전환 시 이 안내가 자동으로 제거되도록 설계해야 합니다.
            </div>

            <div className="sectionHead">
              <div>
                <div className="eyebrow">Selected intelligence</div>
                <h2>Today's Ark</h2>
              </div>
              <p>최대 10건 · 억지로 채우지 않음</p>
            </div>

            <div className="grid">
              {ark.map((event, index) => (
                <EventCard key={event.id} event={event} rank={index + 1} />
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="shell">
          NOAH Intelligence v0.1 · NEWS → EVENT → SIGNIFICANCE → RELEVANCE → ARK → ACTION
        </div>
      </footer>
    </>
  );
}
