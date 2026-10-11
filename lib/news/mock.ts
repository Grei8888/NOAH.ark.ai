import type { Category, RawArticle } from '@/types/domain';
export const MOCK_EVENTS: {
    title: string;
    summary: string;
    category: Category;
    entity: string;
    action: string;
    important: boolean;
}[] = [
    { title: '서울 Physical AI 실증사업 참여기업 모집', summary: '서울에서 Physical AI 실증사업 참여기업을 모집한다. R&D 지원 대상과 신청 요건을 공고에서 확인해야 한다.', category: 'AI_TECH', entity: '전북특별자치도', action: '모집', important: true },
    { title: 'LH 신축매입약정 주거복지 공급계획 발표', summary: 'LH가 신축매입약정 공급계획을 발표했다. 주거복지 사업 참여를 위한 건축 기준과 매입 심사 요건 확인이 필요하다.', category: 'REAL_ESTATE', entity: 'LH', action: '발표', important: true },
    { title: '중소벤처기업부 정책자금 신청 기준 개편', summary: '중소벤처기업부가 정책자금 신청 기준 개편을 발표했다. 기업재무와 자금계획에 미치는 영향은 공고별 적용 시점에 따라 달라진다.', category: 'FINANCE', entity: '중소벤처기업부', action: '개편', important: true },
    { title: '외국인근로자 비자·체류자격 신청 안내 개편', summary: '가상 시나리오: 법무부와 고용노동부의 외국인근로자 비자·체류자격 안내가 개편됐다. 행정사 업무에서는 고용허가, 사업장 변경과 체류 신청에 필요한 서류를 구분해 확인하는 상황을 가정한다.', category: 'POLICY', entity: '법무부', action: '개편', important: true },
    { title: '서울 취약주거 주거복지 지원 기준 개정', summary: '서울의 취약주거 지원 기준 개정안이 공개됐다. 공공주택과 주거복지 지원 대상에 미치는 영향은 원문 확인이 필요하다.', category: 'REAL_ESTATE', entity: '서울', action: '개정', important: true },
    { title: '서울 외국인투자유치 지원사업 참여기업 모집', summary: '가상 시나리오: 서울에서 외국인투자유치 지원사업 참여기업을 모집한다. 외국인직접투자 신고, 투자 인센티브, 투자비자 검토를 서로 구분해 안내하는 상황을 가정한다.', category: 'FINANCE', entity: '전북특별자치도', action: '모집', important: true },
    { title: '외국인환자 유치·의료관광 지원사업 공고', summary: '가상 시나리오: 한국보건산업진흥원이 외국인환자 유치와 의료관광 지원사업을 공고한다. 유치기관 등록 요건, 의료관광 비자와 사업 참여 조건을 각각 확인하는 상황을 가정한다.', category: 'POLICY', entity: '한국보건산업진흥원', action: '공고', important: true },
    { title: '서울 스타트업 정부지원사업 창업기업 모집', summary: '가상 시나리오: 서울의 창업지원기관이 스타트업 정부지원사업 참여 창업기업을 모집한다. 사업화 지원, 보조금 집행, 신청 자격과 중복지원 제한을 확인하는 상황을 가정한다.', category: 'REGIONAL', entity: '전주시', action: '모집', important: true },
    { title: '전남 지역 카페 계절 음료 출시', summary: '전남의 한 카페가 계절 음료를 출시했다.', category: 'OTHER', entity: '카페', action: '출시', important: false },
    { title: '광주 주말 사진 동호회 모임 안내', summary: '광주 사진 동호회가 주말 모임을 안내했다.', category: 'OTHER', entity: '동호회', action: '안내', important: false },
];
export function mockArticles(from: Date, to: Date): RawArticle[] {
    const date = to.toISOString().slice(0, 10);
    const articles = MOCK_EVENTS.flatMap((e, i) => ['공식자료', '독립신문', '지역저널'].map((source, j): RawArticle => ({
        provider: 'mock', sourceName: `${source} (가상)`, sourceDomain: `source${j}.example.com`,
        sourceType: j === 0 && e.important ? 'GOVERNMENT' : 'NEWS_MEDIA',
        title: `${e.title}${j === 1 ? ' — 주요 내용과 적용 대상' : j === 2 ? ' — 현장 영향 분석' : ''}`,
        description: e.summary, contentSnippet: e.summary, url: `https://source${j}.example.com/mock/investor-sinsa-v3/${date}/${i}`,
        publishedAt: new Date(from.getTime() + (2 + i) * 3600000 + j * 600000),
        language: 'ko', country: 'KR', queryGroup: e.category, rawPayload: { mock: true },
    })));
    return [...articles, { ...articles[0], url: `${articles[0].url}?utm_source=duplicate` }, { ...articles[3], url: 'https://source1.example.com/mock/title-copy/' + date }];
}
