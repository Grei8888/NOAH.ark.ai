import type { NoahEvent } from "@/types/news";
import { calculateFinalScore, scoreToGrade } from "@/lib/scoring/scores";

type Seed = Omit<NoahEvent, "finalScore" | "grade">;

const seeds: Seed[] = [
  {
    id: "evt-physical-ai",
    representativeTitle: "정부 피지컬 AI 실증·산업화 지원계획 발표",
    primaryCategory: "AI_TECH",
    secondaryCategories: ["POLICY", "REGIONAL"],
    tags: ["Physical AI", "R&D", "OPPORTUNITY"],
    headlineSummary: "정부 지원정책이 연구 단계를 넘어 실증·사업화와 지역 거점 경쟁으로 이동하고 있습니다.",
    keyPoints: [
      "실증 인프라와 기업 참여 확대가 정책의 핵심 축으로 제시됐습니다.",
      "지역 산업정책과 연계될 경우 지자체·기업·연구기관의 신규 사업 수요가 생길 수 있습니다.",
      "구체적인 참여 조건과 후속 공고는 추가 확인이 필요합니다."
    ],
    whyItMatters: "피지컬 AI가 단순 기술 트렌드가 아니라 정부 사업과 지역산업 정책의 실행 단위로 전환되는 신호이기 때문입니다.",
    userImplication: "AI 디바이스·공공사업·R&D 기획 관점에서 후속 실증사업과 참여기관 모집 공고를 우선 추적할 가치가 있습니다.",
    opportunity: "실증사업, 지역 R&D, 공공 협력 프로젝트 참여 가능성",
    risk: "구체적인 예산·지원대상·신청요건은 공식 공고 전까지 확정된 것으로 보면 안 됩니다.",
    followUp: ["주관 부처 세부 시행계획 확인", "전북특별자치도 후속 대응 확인"],
    importanceScore: 91,
    relevanceScore: 94,
    isOpportunity: true,
    officialSourceAvailable: true,
    sourceCount: 3,
    articleCount: 7,
    sources: [
      { sourceName: "정책브리핑", sourceType: "GOVERNMENT", title: "정부 피지컬 AI 실증·산업화 지원계획", url: "https://example.go.kr/physical-ai", publishedAt: "2026-09-05T00:20:00+09:00" },
      { sourceName: "테크데일리", sourceType: "NEWS_MEDIA", title: "피지컬 AI 실증사업 본격화", url: "https://tech.example.com/physical-ai", publishedAt: "2026-09-05T00:38:00+09:00" },
      { sourceName: "전북경제", sourceType: "NEWS_MEDIA", title: "전북, 피지컬 AI 실증 거점 유치전", url: "https://jb.example.com/physical-ai", publishedAt: "2026-09-05T01:05:00+09:00" }
    ],
    firstSeenAt: "2026-09-05T00:20:00+09:00",
    lastSeenAt: "2026-09-05T05:48:00+09:00"
  },
  {
    id: "evt-lh",
    representativeTitle: "LH 신축매입임대 사업 심사체계 보완 논의",
    primaryCategory: "REAL_ESTATE",
    secondaryCategories: ["POLICY"],
    tags: ["LH", "매입임대", "신축매입약정"],
    headlineSummary: "매입임대 공급 확대와 함께 사업성·품질·입지 심사기준의 정교화가 다시 중요해지고 있습니다.",
    keyPoints: [
      "공급 목표와 실제 사업선정 사이의 심사기준 변화 여부를 확인해야 합니다.",
      "토지·설계·사업비 구조를 제안 초기부터 검토하는 PM 수요와 연결될 수 있습니다."
    ],
    whyItMatters: "LH 매입약정 컨설팅은 작은 기준 변경도 사업계획·설계·수익성에 직접 영향을 줄 수 있습니다.",
    userImplication: "진행 중인 개발 PM 업무에서는 최신 공고문과 지양사항을 기준으로 기존 설계를 재점검할 필요가 있습니다.",
    opportunity: "공고 대응형 사전검토·사업계획 컨설팅",
    risk: "언론 보도만으로 심사기준 변경을 확정해서는 안 됩니다.",
    followUp: ["LH 최신 공고 및 매입기준 원문 대조"],
    importanceScore: 83,
    relevanceScore: 97,
    isOpportunity: true,
    officialSourceAvailable: false,
    sourceCount: 4,
    articleCount: 6,
    sources: [
      { sourceName: "주거정책뉴스", sourceType: "NEWS_MEDIA", title: "LH 매입임대 심사체계 보완 논의", url: "https://housing.example.com/lh", publishedAt: "2026-09-04T16:30:00+09:00" }
    ],
    firstSeenAt: "2026-09-04T16:30:00+09:00",
    lastSeenAt: "2026-09-05T04:10:00+09:00"
  },
  {
    id: "evt-jeonbuk",
    representativeTitle: "전북, AI 중심 지역산업 조직·사업 재편 가속",
    primaryCategory: "REGIONAL",
    secondaryCategories: ["AI_TECH", "POLICY"],
    tags: ["전북", "지역산업", "AI정책"],
    headlineSummary: "전북의 AI 정책이 개별 지원사업을 넘어 조직과 산업전략 수준으로 확대되는 흐름입니다.",
    keyPoints: [
      "지역 행정조직과 산업정책의 AI 중심 재편 움직임이 나타나고 있습니다.",
      "향후 실증·R&D·기업유치 사업의 연속적인 공고 가능성을 볼 필요가 있습니다."
    ],
    whyItMatters: "조직 개편은 일회성 사업보다 중장기 예산과 정책 우선순위 변화의 선행 신호일 수 있습니다.",
    userImplication: "전북 기반 AI·공공협력 사업을 기획한다면 단일 공모보다 정책 로드맵 전체를 추적하는 편이 유리합니다.",
    opportunity: "지자체 AI 정책기획·실증·민관협력",
    risk: "조직 개편 자체가 개별 사업예산 확정을 의미하지는 않습니다.",
    followUp: ["전북 조직개편안 및 예산안 확인", "산업부 연계사업 확인"],
    importanceScore: 79,
    relevanceScore: 93,
    isOpportunity: true,
    officialSourceAvailable: true,
    sourceCount: 5,
    articleCount: 9,
    sources: [
      { sourceName: "전북도", sourceType: "GOVERNMENT", title: "AI 산업 육성 정책자료", url: "https://jeonbuk.example.go.kr/ai", publishedAt: "2026-09-04T11:00:00+09:00" }
    ],
    firstSeenAt: "2026-09-04T11:00:00+09:00",
    lastSeenAt: "2026-09-05T02:40:00+09:00"
  },
  {
    id: "evt-policy-fund",
    representativeTitle: "중소기업 정책자금 하반기 운용방향 조정",
    primaryCategory: "FINANCE",
    secondaryCategories: ["POLICY"],
    tags: ["정책자금", "기업금융", "OPPORTUNITY"],
    headlineSummary: "하반기 정책자금 집행 우선순위 조정이 기업의 자금조달 전략에 영향을 줄 가능성이 있습니다.",
    keyPoints: [
      "정책 목적별 배분과 우선 지원대상 변경 여부가 핵심입니다.",
      "세부 융자 조건은 공식 공고 확인이 필요합니다."
    ],
    whyItMatters: "정책자금은 기업 컨설팅과 실제 자금조달 가능성을 동시에 좌우합니다.",
    userImplication: "기업 컨설팅 고객에게 적용 가능한 자금과 신청시기를 사전에 분류할 필요가 있습니다.",
    opportunity: "정책자금 진단·신청 전략 컨설팅",
    risk: "보도 시점의 방향성과 실제 공고 조건이 달라질 수 있습니다.",
    followUp: ["중진공 정책자금 공고 확인"],
    importanceScore: 76,
    relevanceScore: 87,
    isOpportunity: true,
    officialSourceAvailable: false,
    sourceCount: 3,
    articleCount: 4,
    sources: [
      { sourceName: "기업금융일보", sourceType: "NEWS_MEDIA", title: "정책자금 하반기 운용방향", url: "https://finance.example.com/policy-fund", publishedAt: "2026-09-04T13:10:00+09:00" }
    ],
    firstSeenAt: "2026-09-04T13:10:00+09:00",
    lastSeenAt: "2026-09-04T21:40:00+09:00"
  },
  {
    id: "evt-bif",
    representativeTitle: "경계선지능 청년 직업훈련·고용연계 지원 확대 논의",
    primaryCategory: "NEURO_EDU",
    secondaryCategories: ["POLICY"],
    tags: ["경계선지능", "직업훈련", "고용지원"],
    headlineSummary: "경계선지능 지원이 교육·복지를 넘어 직업훈련과 고용 연결의 정책문제로 확대되고 있습니다.",
    keyPoints: [
      "지원정책의 초점이 성인기 자립과 노동시장 진입으로 확장되는 흐름입니다.",
      "훈련기관의 기능과 기업 연계모델이 향후 핵심 쟁점이 될 수 있습니다."
    ],
    whyItMatters: "교육 이후의 고용 연결은 경계선지능 정책의 구조적 공백 중 하나입니다.",
    userImplication: "기존 직업훈련기관 시스템 연구와 직접 연결해 정책모델과 사업기획으로 발전시킬 수 있습니다.",
    risk: "정책 논의 단계와 실제 제도 시행을 구분해서 봐야 합니다.",
    followUp: ["고용노동부·복지부 후속 정책자료 확인"],
    importanceScore: 72,
    relevanceScore: 91,
    isOpportunity: false,
    officialSourceAvailable: false,
    sourceCount: 2,
    articleCount: 3,
    sources: [
      { sourceName: "복지정책저널", sourceType: "NEWS_MEDIA", title: "경계선지능 청년 고용지원 확대 논의", url: "https://welfare.example.com/bif", publishedAt: "2026-09-04T15:20:00+09:00" }
    ],
    firstSeenAt: "2026-09-04T15:20:00+09:00",
    lastSeenAt: "2026-09-04T20:00:00+09:00"
  },
  {
    id: "evt-admin-rule",
    representativeTitle: "정부, 기업 행정규제 정비 및 시행규칙 개선 추진",
    primaryCategory: "POLICY",
    secondaryCategories: ["FINANCE"],
    tags: ["행정", "규제", "시행규칙"],
    headlineSummary: "상위 법령보다 실제 현장 절차를 좌우하는 하위규정 정비가 추진되고 있습니다.",
    keyPoints: [
      "사업 현장의 행정부담과 연결되는 시행규칙·고시 개정 여부가 중요합니다.",
      "구체적인 업종별 영향은 개정안 원문 검토가 필요합니다."
    ],
    whyItMatters: "행정 전문가에게는 제도 변화 자체보다 실제 시행 절차의 변화가 새로운 업무수요를 만들 수 있습니다.",
    userImplication: "정책을 설명하는 수준을 넘어 시행규칙과 현장 적용 절차를 분석하는 컨설팅 콘텐츠로 연결할 수 있습니다.",
    opportunity: "제도변화 대응 컨설팅",
    risk: "개선 추진 발표와 확정 시행은 구별해야 합니다.",
    followUp: ["입법·행정예고 원문 추적"],
    importanceScore: 75,
    relevanceScore: 89,
    isOpportunity: true,
    officialSourceAvailable: true,
    sourceCount: 4,
    articleCount: 5,
    sources: [
      { sourceName: "정부부처", sourceType: "GOVERNMENT", title: "규제 정비 추진계획", url: "https://gov.example.com/rule", publishedAt: "2026-09-04T09:00:00+09:00" }
    ],
    firstSeenAt: "2026-09-04T09:00:00+09:00",
    lastSeenAt: "2026-09-04T18:00:00+09:00"
  }
];

export const mockEvents: NoahEvent[] = seeds.map((event) => {
  const finalScore = calculateFinalScore(event.importanceScore, event.relevanceScore);
  return {
    ...event,
    finalScore,
    grade: scoreToGrade(finalScore)
  };
});
