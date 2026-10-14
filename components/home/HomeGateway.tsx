import Link from "next/link";
import { Icon } from "@/components/home/Icon";

/**
 * The landing page is navigation only. News searches and business API
 * requests are deferred until someone explicitly chooses that workspace.
 */
export function HomeGateway() {
  return (
    <section className="homeGateway" aria-label="NOAH ARK 서비스 선택">
      <p className="homeGatewayIntro">필요한 정보를 선택하세요. 각 영역에서 관련 자료와 도구를 따로 이용할 수 있습니다.</p>
      <div className="homeGatewayGrid">
        <Link href="/?view=discover" className="homeGatewayCard homeGatewayCard--news">
          <span className="homeGatewayTop">
            <span className="homeGatewayEyebrow">01 · NEWS INTELLIGENCE</span>
            <span className="homeGatewaySymbol"><Icon name="discover" /></span>
          </span>
          <strong>뉴스</strong>
          <span className="homeGatewayLead">나에게 중요한 뉴스를 이해합니다.</span>
          <span className="homeGatewayDescription">맞춤 뉴스와 다양한 기사 원문을 살펴보고, 어려운 용어나 배경은 AI에게 질문하세요.</span>
          <span className="homeGatewayTags"><span>맞춤 뉴스</span><span>원문 탐색</span><span>독해 AI</span></span>
          <span className="homeGatewayAction">뉴스 살펴보기 <Icon name="arrow" /></span>
        </Link>
        <Link href="/?view=startup" className="homeGatewayCard homeGatewayCard--business">
          <span className="homeGatewayTop">
            <span className="homeGatewayEyebrow">02 · BUSINESS OPPORTUNITIES</span>
            <span className="homeGatewaySymbol"><Icon name="startup" /></span>
          </span>
          <strong>사업기회</strong>
          <span className="homeGatewayLead">내 사업에 맞는 기회를 찾습니다.</span>
          <span className="homeGatewayDescription">정부 지원사업부터 국가 R&amp;D와 공공입찰까지, 유형별 공고를 구분해 확인하세요.</span>
          <span className="homeGatewayTags"><span>지원사업</span><span>국가 R&amp;D</span><span>공공입찰</span></span>
          <span className="homeGatewayAction">사업기회 살펴보기 <Icon name="arrow" /></span>
        </Link>
      </div>
      <p className="homeGatewayFoot">NOAH ARK · Only What Matters. · 실제 자료는 각 영역에서 확인할 수 있습니다.</p>
    </section>
  );
}
