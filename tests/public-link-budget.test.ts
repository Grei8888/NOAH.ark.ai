import { createHash } from "node:crypto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  publicBetaConfigured, publicCacheKey, koreaBudgetDate,
  PUBLIC_BETA_RESERVATION_KRW, PUBLIC_BETA_DAILY_KRW,
} from "@/lib/news/public-link-budget-policy";
import { readerLabInviteId, readerLabConfigured } from "@/lib/news/reader-lab-access";
import { READER_MODES } from "@/lib/news/reader-companion";

vi.mock("@/lib/news/public-link-budget-store", () => ({
  reservePublicAi: vi.fn(),
  finalizePublicAi: vi.fn(),
}));
vi.mock("@/lib/news/reading-companion-service", () => ({
  answerReadingQuestion: vi.fn(),
}));
import { reservePublicAi, finalizePublicAi } from "@/lib/news/public-link-budget-store";
import { answerReadingQuestion } from "@/lib/news/reading-companion-service";
import { answerPublicReadingQuestion } from "@/lib/news/public-link-answer";

const sharedCode = "shared-beta-link-" + "S".repeat(38);
const headline = "정부 정책자금 지원 제도";
const sample = { headline, mode: "terms" as const, question: READER_MODES[0].hint };
const digest = (s: string) => createHash("sha256").update(s).digest("hex");

beforeEach(() => {
  vi.resetAllMocks();
  vi.stubEnv("VERCEL_ENV", "preview");
  vi.stubEnv("NOAH_READER_LAB_ENABLED", "true");
  vi.stubEnv("NOAH_SHARED_BETA_ENABLED", "true");
  vi.stubEnv("NOAH_SHARED_BETA_LINK_SHA256", digest(sharedCode));
  vi.stubEnv("NOAH_PUBLIC_BETA_DATABASE_URL", "postgresql://test.invalid/noah_preview");
  vi.stubEnv("NOAH_READER_LAB_INVITE_HASHES", digest("obsolete-" + "X".repeat(40)));
});
afterEach(() => { vi.unstubAllEnvs(); vi.restoreAllMocks(); });

describe("unlimited-seat shared-link Preview admission", () => {
  it("authorizes the shared link independently of the former 10-slot hashes", () => {
    expect(publicBetaConfigured()).toBe(true);
    expect(readerLabConfigured()).toBe(true);
    expect(readerLabInviteId(sharedCode)).toBe(digest(sharedCode));
    expect(readerLabInviteId("unregistered-" + "Z".repeat(38))).toBeNull();
  });
  it("never enables shared beta in Vercel Production or with missing DB", () => {
    vi.stubEnv("VERCEL_ENV", "production");
    expect(readerLabConfigured()).toBe(false);
    expect(readerLabInviteId(sharedCode)).toBeNull();
    vi.stubEnv("VERCEL_ENV", "preview");
    vi.stubEnv("NOAH_PUBLIC_BETA_DATABASE_URL", "");
    expect(publicBetaConfigured()).toBe(false);
    expect(readerLabConfigured()).toBe(false);
  });
  it("has a KST calendar-day reset and a fixed conservative reservation", () => {
    expect(koreaBudgetDate(new Date("2026-10-14T14:59:59Z"))).toBe("2026-10-14");
    expect(koreaBudgetDate(new Date("2026-10-14T15:00:00Z"))).toBe("2026-10-15");
    expect(PUBLIC_BETA_DAILY_KRW).toBe(1000);
    expect(PUBLIC_BETA_RESERVATION_KRW).toBeGreaterThan(0);
    expect(PUBLIC_BETA_DAILY_KRW % PUBLIC_BETA_RESERVATION_KRW).toBe(0);
  });
  it("caches canned education prompts, NEVER arbitrary potentially sensitive questions", () => {
    expect(publicCacheKey(sample)).toMatch(/^[0-9a-f]{64}$/);
    expect(publicCacheKey({ ...sample, question: "우리 회사의 대출 상황을 평가해줘" })).toBeNull();
    expect(publicCacheKey({ ...sample, headline: "" })).toBeNull();
  });
});

describe("paid calls are denied unless the shared reservation succeeds", () => {
  it("fails closed on missing database without requesting OpenAI", async () => {
    vi.mocked(reservePublicAi).mockRejectedValueOnce(new Error("db down"));
    const reply = await answerPublicReadingQuestion(sample);
    expect(reply.status).toBe(503);
    expect(reply.body.code).toBe("BUDGET_UNAVAILABLE");
    expect(answerReadingQuestion).not.toHaveBeenCalled();
  });
  it("honors all-users daily cap and duplicate in-flight requests", async () => {
    vi.mocked(reservePublicAi).mockResolvedValueOnce({ kind: "exhausted" })
      .mockResolvedValueOnce({ kind: "duplicate" });
    expect((await answerPublicReadingQuestion(sample)).status).toBe(429);
    expect((await answerPublicReadingQuestion(sample)).status).toBe(409);
    expect(answerReadingQuestion).not.toHaveBeenCalled();
  });
  it("serves shared cached answers without another provider request", async () => {
    vi.mocked(reservePublicAi).mockResolvedValueOnce({ kind: "cached", answer: "이미 생성된 설명" });
    const reply = await answerPublicReadingQuestion(sample);
    expect(reply.status).toBe(200);
    expect(reply.body.cached).toBe(true);
    expect(answerReadingQuestion).not.toHaveBeenCalled();
  });
  it("reserves before invoking only the pinned cheap model", async () => {
    vi.mocked(reservePublicAi).mockResolvedValueOnce({ kind: "reserved", requestId: "reservation-test" });
    vi.mocked(answerReadingQuestion).mockResolvedValueOnce({ ok: true, answer: "정책자금 설명" });
    vi.mocked(finalizePublicAi).mockResolvedValueOnce();
    const reply = await answerPublicReadingQuestion(sample);
    expect(reply.status).toBe(200);
    expect(reservePublicAi).toHaveBeenCalledOnce();
    expect(answerReadingQuestion).toHaveBeenCalledWith(sample, "gpt-4.1-mini");
    expect(finalizePublicAi).toHaveBeenCalledWith("reservation-test", publicCacheKey(sample), "정책자금 설명");
  });
  it("never refunds provider failures or retries AI automatically", async () => {
    vi.mocked(reservePublicAi).mockResolvedValueOnce({ kind: "reserved", requestId: "reservation-test" });
    vi.mocked(answerReadingQuestion).mockResolvedValueOnce({ ok: false, reason: "timeout" });
    const reply = await answerPublicReadingQuestion(sample);
    expect(reply.status).toBe(503);
    expect(answerReadingQuestion).toHaveBeenCalledTimes(1);
    expect(finalizePublicAi).toHaveBeenCalledWith("reservation-test", publicCacheKey(sample), null);
  });
});
