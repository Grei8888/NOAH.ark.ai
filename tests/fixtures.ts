import type { UserProfile } from '@/types/domain';
const terms = ['AI', '지원', '주거', '매입약정', '외국인', '정책자금', '스타트업'];
export const DEMO_PROFILE: UserProfile = { id: 'test-reader', interests: terms, businessInterests: terms, careerInterests: terms, researchInterests: terms, regions: ['전북', '서울'], entities: ['LH', '정부', '중소벤처기업부', '법무부'] };
