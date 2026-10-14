import { createHash } from "node:crypto";
import { READER_MODES, type ReaderLabInput } from "@/lib/news/reader-companion";

/**
 * All-users-together beta budget; counts conservative reserved charges,
 * not actual vendor invoice amounts. Vendor/model/FX changes need review.
 */
export const PUBLIC_BETA_MODEL = "gpt-4.1-mini";
export const PUBLIC_BETA_DAILY_KRW = 1000;
export const PUBLIC_BETA_RESERVATION_KRW = 20;
export const PUBLIC_BETA_MAX_OUTPUT_TOKENS = 550;
export const PUBLIC_BETA_CACHE_TTL_HOURS = 24;
export const PUBLIC_BETA_PROMPT_VERSION = "noah-reader-v1";

export function publicBetaRequested(): boolean {
  return process.env.NOAH_SHARED_BETA_ENABLED === "true";
}
export function publicBetaConfigured(): boolean {
  const preview = process.env.VERCEL_ENV === "preview";
  const local = !process.env.VERCEL_ENV && process.env.NODE_ENV !== "production";
  return publicBetaRequested() && (preview || local) &&
    /^[0-9a-f]{64}$/i.test(process.env.NOAH_SHARED_BETA_LINK_SHA256 ?? "") &&
    !!process.env.NOAH_PUBLIC_BETA_DATABASE_URL?.startsWith("postgres") &&
    process.env.NOAH_READER_LAB_ENABLED === "true";
}
export function koreaBudgetDate(at: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul", year: "numeric", month: "2-digit", day: "2-digit",
  }).format(at);
}

/** Cache only public canned education prompts; never cache arbitrary client questions. */
export function publicCacheKey(input: ReaderLabInput): string | null {
  const hint = READER_MODES.find(m => m.id === input.mode)?.hint;
  if (!hint || input.question !== hint || !input.headline.trim()) return null;
  return createHash("sha256").update(JSON.stringify({
    model: PUBLIC_BETA_MODEL, prompt: PUBLIC_BETA_PROMPT_VERSION,
    headline: input.headline.normalize("NFKC"), mode: input.mode, hint,
  })).digest("hex");
}
