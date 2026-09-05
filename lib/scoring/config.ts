export const SCORE_CONFIG = {
  final: {
    importanceWeight: 0.65,
    relevanceWeight: 0.35
  },
  grade: {
    aPlus: 85,
    a: 75,
    b: 60,
    c: 45
  },
  ark: {
    minimumFinalScore: 60,
    maxEvents: 10,
    maxPerCategory: 4
  }
} as const;
