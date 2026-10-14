import type { ReaderLabInput } from "@/lib/news/reader-companion";
import {
  publicCacheKey, PUBLIC_BETA_MODEL, PUBLIC_BETA_DAILY_KRW,
} from "@/lib/news/public-link-budget-policy";
import { reservePublicAi, finalizePublicAi } from "@/lib/news/public-link-budget-store";
import { answerReadingQuestion } from "@/lib/news/reading-companion-service";

type PublicReply = { status: number; body: Record<string, unknown> };

export async function answerPublicReadingQuestion(input: ReaderLabInput): Promise<PublicReply> {
  const cacheKey = publicCacheKey(input);
  let reservation;
  try {
    reservation = await reservePublicAi(cacheKey);
  } catch {
    // Database unreachable/unmigrated? Fail closed before the paid provider.
    return { status: 503, body: {
      code: "BUDGET_UNAVAILABLE",
      error: "현재 AI 사용량을 확인할 수 없어 요청을 중단했습니다. 잠시 뒤 다시 시도해 주세요.",
    } };
  }
  if (reservation.kind === "cached") return { status: 200, body: {
    answer: reservation.answer, cached: true, mode: input.mode,
    note: "미리 생성한 기본 독해 도움말입니다. 언론사 원문을 읽거나 요약한 답변은 아닙니다.",
  } };
  if (reservation.kind === "exhausted") return { status: 429, body: {
    code: "DAILY_BUDGET_EXHAUSTED",
    error: `오늘의 공동 AI 예산(${PUBLIC_BETA_DAILY_KRW.toLocaleString("ko-KR")}원)이 소진되었습니다. 한국시간 내일 다시 이용해 주세요. 원문 링크와 기존 자료는 계속 이용할 수 있습니다.`,
  } };
  if (reservation.kind === "duplicate") return { status: 409, body: {
    code: "BRIEFING_IN_PROGRESS",
    error: "이 기사에 대한 기본 설명을 이미 생성하고 있습니다. 잠시 뒤 다시 시도해 주세요.",
  } };

  // The reservation has been permanently charged, even if the provider fails.
  let answer: string | null = null;
  let failure: "provider_limit" | "provider_unavailable" | "empty" | "timeout" | null = null;
  try {
    const result = await answerReadingQuestion(input, PUBLIC_BETA_MODEL);
    if (result.ok) answer = result.answer;
    else failure = result.reason;
  } catch {
    failure = "provider_unavailable";
  }

  // Cache/settlement failure does not trigger a second charge or paid retry.
  try {
    await finalizePublicAi(reservation.requestId, cacheKey, answer);
  } catch {
    // Budget reservation remains. Data store must recover before another paid call.
    // Never print question text or invite secrets to logs.
  }

  if (!answer) return { status: 503, body: {
    code: "AI_PROVIDER_UNAVAILABLE",
    error: failure === "provider_limit"
      ? "AI 서비스 요청 한도에 도달했습니다."
      : "AI 응답을 받지 못했습니다. 기본 예산 예약은 차감되며 자동 재시도하지 않습니다.",
  } };

  return { status: 200, body: {
    answer, cached: false, mode: input.mode,
    note: "기사 본문을 읽지 않은 일반 배경·비판적 독해 보조 답변입니다.",
  } };
}
