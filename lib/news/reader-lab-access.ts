import { publicBetaRequested, publicBetaConfigured } from "@/lib/news/public-link-budget-policy";
import { createHash, timingSafeEqual } from "node:crypto";

function inviteDigests(): string[] | null {
  const raw = process.env.NOAH_READER_LAB_INVITE_HASHES?.trim();
  if (!raw) return null;
  const hashes = raw.split(",").map(s => s.trim().toLowerCase());
  if (hashes.length < 1 || hashes.length > 10 ||
      hashes.some(s => !/^[0-9a-f]{64}$/.test(s)) ||
      new Set(hashes).size !== hashes.length) return [];
  return hashes;
}

/** Preview lab opt-in; public-link beta has its own durable shared spend gate. */
export function readerLabConfigured(): boolean {
  const preview = process.env.VERCEL_ENV === "preview";
  const local = process.env.NODE_ENV !== "production" && !process.env.VERCEL_ENV;
  // A malformed requested public beta MUST NOT fall back to the 10-person allowlist.
  if (publicBetaRequested()) return publicBetaConfigured();
  const hashes = inviteDigests();
  const invitationsConfigured = hashes !== null && hashes.length > 0;
  const legacyLocalOnly = local &&
    (process.env.NOAH_READER_LAB_ACCESS_TOKEN ?? "").length >= 32;
  return process.env.NOAH_READER_LAB_ENABLED === "true" &&
    (preview || local) &&
    (invitationsConfigured || legacyLocalOnly);
}

/** UI can be checked with live RSS even before the owner supplies a paid API key. */
export function readerLabModelReady(): boolean {
  return readerLabConfigured() && !!process.env.OPENAI_API_KEY?.trim();
}

/** Returns stable non-identifying invite ID; one revocable shared secret in public mode. */
export function readerLabInviteId(value: string | null): string | null {
  if (!readerLabConfigured() || !value || value.length < 32 || value.length > 256) return null;
  const hash = createHash("sha256").update(value).digest();
  if (publicBetaRequested()) {
    if (!publicBetaConfigured()) return null;
    const expected = process.env.NOAH_SHARED_BETA_LINK_SHA256!;
    return timingSafeEqual(hash, Buffer.from(expected, "hex")) ? hash.toString("hex") : null;
  }
  const hashes = inviteDigests();
  if (hashes !== null) {
    let accepted = false;
    for (const expected of hashes) {
      // Uniform comparison work across all 10 invite slots.
      accepted = timingSafeEqual(hash, Buffer.from(expected, "hex")) || accepted;
    }
    return accepted ? hash.toString("hex") : null;
  }
  const expected = process.env.NOAH_READER_LAB_ACCESS_TOKEN!;
  return timingSafeEqual(hash, createHash("sha256").update(expected).digest())
    ? hash.toString("hex")
    : null;
}

export function validReaderLabAccess(value: string | null): boolean {
  return readerLabInviteId(value) !== null;
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
