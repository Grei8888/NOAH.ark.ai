import { readerLabInstructions, readerLabUserMessage, type ReaderLabInput } from "@/lib/news/reader-companion";
import { outputTextFromOpenAI } from "@/lib/news/reader-lab-access";

/**
 * Single REAL AI adapter for preview and future production Reader routes.
 * No simulated responses, article scraping, body storage or implied source reading.
 */
export type ReadingResult =
  | { ok: true; answer: string }
  | { ok: false; reason: "provider_limit" | "provider_unavailable" | "empty" | "timeout" };

export async function answerReadingQuestion(input: ReaderLabInput): Promise<ReadingResult> {
  if (!process.env.OPENAI_API_KEY?.trim()) return { ok: false, reason: "provider_unavailable" };
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
        input: readerLabUserMessage(input),
        max_output_tokens: 550,
        store: false,
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(14000),
    });
    if (response.status === 429) return { ok: false, reason: "provider_limit" };
    if (!response.ok) return { ok: false, reason: "provider_unavailable" };
    const payload: unknown = await response.json();
    const answer = outputTextFromOpenAI(payload);
    return answer ? { ok: true, answer } : { ok: false, reason: "empty" };
  } catch {
    return { ok: false, reason: "timeout" };
  }
}
