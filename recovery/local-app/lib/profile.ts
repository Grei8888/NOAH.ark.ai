import type { UserProfile } from '@/types/domain';
// Server-side only: never pass this profile or personalized analysis to a public page.
export const OWNER_PROFILE: UserProfile = {
    id: 'grei-profile',
    interests: ['행정사', 'LH 매입약정', '신축매입약정', '매입임대', '주거', '주거복지', '외국인근로자', '외국인 근로자', '비자', '체류자격', '고용허가', '외국인투자', '외국인 투자', '외국인환자', '의료관광', '스타트업', '창업', 'AI', 'Physical AI', '정부지원사업', '정책자금', 'R&D'],
    regions: ['서울', '신사역', '강남', '서초', '수도권', '전북', '전주', '광주', '전남'],
    entities: ['국토교통부', 'LH', '법무부', '출입국', '산업통상자원부', '중소벤처기업부', '고용노동부', '보건복지부', '과학기술정보통신부', '창업진흥원', 'KOTRA', '한국보건산업진흥원', '전북특별자치도', '전주시'],
    businessInterests: ['행정사', '인허가', '행정컨설팅', '매입약정', '주거복지', '외국인근로자', '외국인 근로자', '비자', '체류', '외국인투자', '외국인 투자', '의료관광', '외국인환자', '스타트업', '창업', '정부지원사업', '보조금', '정책자금', 'AI', 'Physical AI', 'R&D'],
    researchInterests: ['주거복지', '취약주거', '외국인', '출입국', '창업', '스타트업', 'AI', '정부지원사업', 'R&D'],
    careerInterests: ['행정사', '행정', '인허가', '비자', '투자유치', '환자 유치', '컨설팅', '정책', '사업', 'R&D'],
};
