import { z } from 'zod';
import { CATEGORIES } from '@/types/domain';
const points = (max: number) => z.number().min(0).max(max);
export const AnalysisSchema = z.object({
    primaryCategory: z.enum(CATEGORIES), secondaryCategories: z.array(z.enum(CATEGORIES)).max(3), tags: z.array(z.string()).max(12),
    importance: z.object({ socialImportance: points(15), policyImpact: points(20), industryImpact: points(15), novelty: points(15), actionability: points(10) }),
    userRelevance: z.object({ interestMatch: points(25), businessMatch: points(20), careerMatch: points(15), researchMatch: points(15), regionMatch: points(10), entityMatch: points(10), actionability: points(5) }),
    headlineSummary: z.string(), keyPoints: z.array(z.string()).max(5), whyItMatters: z.string(), userImplication: z.string(),
    isOpportunity: z.boolean(), opportunity: z.string(), risk: z.string(), followUp: z.array(z.string()).max(5), confidence: points(1),
});
export type Analysis = z.infer<typeof AnalysisSchema>;
