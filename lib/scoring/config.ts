export const SCORE_CONFIG = {
    final: { importanceWeight: 0.65, relevanceWeight: 0.35 },
    grade: { aPlus: 85, a: 75, b: 60, c: 45 },
    ark: { minimumFinalScore: 60, maxEvents: 10, maxPerCategory: 4, recencyMax: 2, recencyHours: 24 },
    spread: { max: 15, sourceWeight: 2, articleWeight: 0.5, velocityWeight: 1, officialBonus: 2, velocityCap: 3 },
    reliability: { GOVERNMENT: 10, PUBLIC_AGENCY: 9, RESEARCH: 8, NEWS_MEDIA: 6, CORPORATE: 5, OTHER: 3 },
    breaking: { threshold: 80, minimumRelevance: 60, velocity: 25, sources: 20, official: 15, impact: 15, novelty: 15, relevance: 10, velocitySaturation: 6, sourcesSaturation: 5 },
} as const;
