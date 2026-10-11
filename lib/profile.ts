import type { UserProfile } from '@/types/domain';
// Shared Event analysis has no consumer or owner preferences.
export const PUBLIC_PROFILE: UserProfile = {
  id: 'public-significance-v1', interests: [], regions: [], entities: [],
  businessInterests: [], researchInterests: [], careerInterests: [],
};
