import { SCORE_CONFIG } from "./config";
import type { Grade } from "@/types/news";

export function calculateFinalScore(
  importanceScore: number,
  relevanceScore: number
): number {
  return Number(
    (
      importanceScore * SCORE_CONFIG.final.importanceWeight +
      relevanceScore * SCORE_CONFIG.final.relevanceWeight
    ).toFixed(1)
  );
}

export function scoreToGrade(score: number): Grade {
  if (score >= SCORE_CONFIG.grade.aPlus) return "A+";
  if (score >= SCORE_CONFIG.grade.a) return "A";
  if (score >= SCORE_CONFIG.grade.b) return "B";
  if (score >= SCORE_CONFIG.grade.c) return "C";
  return "D";
}
