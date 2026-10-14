import type { Metadata } from "next";
import { AppShell } from "@/components/home/AppShell";
import { HousingIntelligenceTool } from "@/components/tools/HousingIntelligenceTool";

export const metadata: Metadata = {
  title: "주거사업 인텔리전스 | NOAH ARK",
  description: "분양시장·공공보증·사업금융을 하나의 근거중심 검토 화면에서 살펴봅니다.",
};

export default function HousingIntelligencePage() {
  return (
    <AppShell view="startup" compactRail rail={
      <>
        <section className="railPanel">
          <div className="railEyebrow">SPECIALIST WORKSPACE</div>
          <h2>한 사업, 세 가지 검토.</h2>
          <p>시장·공공보증·금융을 연결하되 각각의 요건과 근거는 구분합니다.</p>
        </section>
        <section className="railPanel">
          <div className="railEyebrow">STATUS</div>
          <h2>분석 워크시트 v1</h2>
          <p>외부자료 자동수집 없음 · 입력값 계산만 제공 · 보증 및 대출심사 미실시</p>
        </section>
      </>
    }>
      <div className="topUtility">
        <span>NOAH ARK / ANALYSIS WORKSPACE</span>
        <span>PRELIMINARY REVIEW</span>
      </div>
      <HousingIntelligenceTool />
    </AppShell>
  );
}
