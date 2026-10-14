import { AppShell } from "@/components/home/AppShell";
import { HomeGateway } from "@/components/home/HomeGateway";

/**
 * The Preview landing page is deliberately lightweight: it does not request
 * RSS feeds, news APIs, or business API data until a workspace is opened.
 */
export function HomeGatewayPage({ privateBeta }: { privateBeta: boolean }) {
  return (
    <AppShell view="home" compactRail>
      <div className="topUtility">
        <span>NOAH ARK / {privateBeta ? "PRIVATE BETA" : "PUBLIC BETA"}</span>
        <span>ONLY WHAT MATTERS.</span>
      </div>
      <header className="homeIntro homeGatewayHero">
        <p className="greeting">Your Intelligence Partner.</p>
        <h1>무엇을 살펴볼까요?</h1>
        <p className="homeGatewaySubtitle">중요한 뉴스를 이해하거나, 새로운 사업기회를 찾거나.</p>
      </header>
      <HomeGateway />
    </AppShell>
  );
}
