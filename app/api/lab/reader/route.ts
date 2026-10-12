import { NextRequest, NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { readerLabConfigured, validReaderLabAccess, outputTextFromOpenAI } from "@/lib/news/reader-lab-access";
import { readerLabInstructions, readerLabUserMessage, validateReaderLabInput } from "@/lib/news/reader-companion";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 20;

const limits = new Map<string, { start: number; count: number }>();
function throttle(key: string): boolean {
  // Best-effort per-instance gate only; not a distributed billing safeguard.
  const now = Date.now();
  if (limits.size > 200) {
    for (const [id, entry] of limits) if (now - entry.start > 3600000) limits.delete(id);
  }
  const current = limits.get(key);
  if (!current || now - current.start >= 3600000) {
    limits.set(key, { start: now, count: 1 });
    return false;
  }
  current.count += 1;
  return current.count > 8;
}
function result(data: object, status: number) {
  return NextResponse.json(data, { status, headers: {
    "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff",
  } });
}

export async function POST(request: NextRequest) {
  // Never enable payable AI queries on the real production alias.
  if (!readerLabConfigured()) return result({ error: "독해 실험실이 비활성화되어 있습니다." }, 404);

  const origin = request.headers.get("origin");
  if (!origin || origin !== new URL(request.url).origin) return result({ error: "요청 출처를 확인할 수 없습니다." }, 403);
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) return result({ error: "요청 형식이 잘못됐습니다." }, 415);
  if (!validReaderLabAccess(request.headers.get("x-noah-lab-token"))) {
    return result({ error: "테스트 접속 코드를 확인해 주세요." }, 401);
  }
  if (Number(request.headers.get("content-length") || "0") > 4000) return result({ error: "입력이 너무 깁니다." }, 413);
  let body: unknown;
  try {
    const raw = await request.text();
    if (raw.length > 4000) return result({ error: "입력이 너무 깁니다." }, 413);
    body = JSON.parse(raw);
  } catch { return result({ error: "요청 내용을 확인해 주세요." }, 400); }
  const data = validateReaderLabInput(body);
  if (!data) return result({ error: "질문은 4~380자로 입력해 주세요." }, 400);
  const ip = request.headers.get("x-real-ip") || request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const key = createHash("sha256").update(ip + ":" + process.env.NOAH_READER_LAB_ACCESS_TOKEN).digest("hex");
  if (throttle(key)) return result({ error: "테스트 요청 한도에 도달했습니다. 한 시간 후 다시 시도해 주세요." }, 429);

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.NOAH_READER_LAB_MODEL || "gpt-4.1-mini",
        instructions: readerLabInstructions(),
        input: readerLabUserMessage(data),
        max_output_tokens: 550,
        store: false,
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(14000),
    });
    if (!response.ok) {
      // Do not leak provider headers/errors, keys or user input.
      return result({ error: response.status === 429
        ? "AI 서비스 요청 한도에 도달했습니다."
        : "AI 연결에 문제가 있습니다. 테스트 API 설정을 확인해 주세요." }, 503);
    }
    const payload: unknown = await response.json();
    const answer = outputTextFromOpenAI(payload);
    if (!answer) return result({ error: "AI가 답변을 반환하지 않았습니다. 다시 시도해 주세요." }, 502);
    return result({ answer, mode: data.mode, note: "기사 본문을 읽지 않은 일반 배경·비판적 독해 보조 답변입니다." }, 200);
  } catch {
    return result({ error: "AI 응답이 지연되고 있습니다. 잠시 뒤 다시 시도해 주세요." }, 503);
  }
}
