import { AppShell } from "@/components/home/AppShell";
import { HomeGateway } from "@/components/home/HomeGateway";
import { HomeDailyBrief } from "@/components/home/HomeDailyBrief";
import { HomeInviteCapture } from "@/components/home/HomeInviteCapture";

/**
 * The landing shell stays fast. The client brief reuses cached news search
 * endpoints after mount and never contacts business / procurement APIs.
 */
export function HomeGatewayPage({ privateBeta }: { privateBeta: boolean }) {
  return (
    <AppShell view="home" compactRail>
      <HomeInviteCapture />
      <div className="topUtility">
        <span>NOAH ARK / {privateBeta ? "PRIVATE BETA" : "PUBLIC BETA"}</span>
        <span>ONLY WHAT MATTERS.</span>
      </div>
      <header className="homeIntro homeGatewayHero">
        <p className="greeting">Your Intelligence Partner.</p>
        <h1>오늘의 변화, 필요한 기회.</h1>
        <p className="homeGatewaySubtitle">오늘 무슨 일이 벌어지고 있는지 먼저 살펴보세요.</p>
      </header>
      <HomeDailyBrief />
      <HomeGateway />
    </AppShell>
  );
}
