import { createHash, timingSafeEqual } from "node:crypto";

/** The reading lab is a CLOSED experiment. Never works on the production alias. */
export function readerLabConfigured(): boolean {
  const access = process.env.NOAH_READER_LAB_ACCESS_TOKEN ?? "";
  return process.env.NOAH_READER_LAB_ENABLED === "true" &&
    process.env.VERCEL_ENV !== "production" &&
    access.length >= 32 &&
    !!process.env.OPENAI_API_KEY?.trim();
}

export function validReaderLabAccess(value: string | null): boolean {
  if (!readerLabConfigured() || !value) return false;
  const expected = process.env.NOAH_READER_LAB_ACCESS_TOKEN!;
  // Uniform length, avoid string early-exit comparisons.
  const left = createHash("sha256").update(value).digest();
  const right = createHash("sha256").update(expected).digest();
  return timingSafeEqual(left, right);
}

export function outputTextFromOpenAI(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") return null;
  const o = payload as { output?: unknown };
  if (!Array.isArray(o.output)) return null;
  const parts: string[] = [];
  for (const item of o.output) {
    if (!item || typeof item !== "object") continue;
    const block = item as { type?: unknown; content?: unknown };
    if (block.type !== "message" || !Array.isArray(block.content)) continue;
    for (const bit of block.content) {
      if (!bit || typeof bit !== "object") continue;
      const text = bit as { type?: unknown; text?: unknown };
      if (text.type === "output_text" && typeof text.text === "string") parts.push(text.text);
    }
  }
  return parts.join("\n").trim().slice(0, 4500) || null;
}
