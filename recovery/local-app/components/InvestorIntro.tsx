import { MOCK_EVENTS } from '@/lib/news/mock';
export default function InvestorIntro({ count }: { count: number }) {
    return <section className="investor-intro" aria-label="투자자 데모 소개">
        <div className="investor-context"><span>INVESTOR DEMO · SEOUL</span><span>현장 출발점 · 서울 신사역 행정사 사무실</span></div>
        <h2>정보를 읽는 시간에서,<br /><em>고객의 다음 행동을 준비하는 시간으로.</em></h2>
        <p>NOAH는 행정사 업무에 중요한 정책·공고를 하나의 변화로 묶고, 그 의미와 후속 확인사항을 제시하는 업무용 인텔리전스입니다.</p>
        <div className="investor-flow"><div><strong>{MOCK_EVENTS.length * 3 + 2}</strong><span>가상 수집 기사</span></div><b aria-hidden="true">→</b><div><strong>{MOCK_EVENTS.length}</strong><span>중복 통합 Event</span></div><b aria-hidden="true">→</b><div><strong>{count}</strong><span>선별된 변화</span></div><b aria-hidden="true">→</b><div className="flow-action"><strong>다음 확인</strong><span>고객 유형별 검토 항목</span></div></div>
        <p className="investor-note">아래 수치는 가상 자료 처리 결과입니다. 고객 수·매출·시간 절감 성과를 의미하지 않습니다.</p>
        <div className="investor-scope"><span>LH·주거복지</span><span>비자·외국인 고용</span><span>외국인 투자</span><span>의료관광</span><span>스타트업·AI·지원사업</span></div>
        <details className="investor-thesis"><summary>투자 관점: 무엇을 검증할 것인가</summary><div><h3>시작 고객</h3><p>행정사 사무실처럼 여러 고객의 정책·공고를 반복 확인해야 하는 전문서비스 조직을 초기 고객으로 가정합니다. 신사역 사무실의 업무 맥락을 데모에 반영했습니다.</p><h3>사업 모델 가설</h3><p>사무실 단위 구독과 팀별 관심 분야 설정을 검토합니다. 가격·유료 고객·수익성은 아직 검증하지 않았습니다.</p><h3>다음 검증</h3><p>실제 공고의 누락·오분류, 담당자의 검토 시간, 상담 준비 활용도, 지불 의사를 파일럿에서 측정할 계획입니다.</p><h3>현재 구현 범위</h3><p>가상 기사 수집·통합·점수화·보고서·상세 분석을 구현했습니다. 이 공유 페이지는 읽기 전용이며, 실제 뉴스 운영과 다중 사용자·과금 기능은 후속 단계입니다.</p></div></details>
    </section>;
}
