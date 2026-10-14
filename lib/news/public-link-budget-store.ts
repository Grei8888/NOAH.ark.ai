import { randomUUID } from "node:crypto";
import {
  koreaBudgetDate, PUBLIC_BETA_DAILY_KRW, PUBLIC_BETA_RESERVATION_KRW,
  PUBLIC_BETA_CACHE_TTL_HOURS,
} from "@/lib/news/public-link-budget-policy";

type Client = InstanceType<typeof import("../../.generated/postgres").PrismaClient>;
let client: Client | undefined;

/** Separate Preview database: do not silently fall back to the app/production DB. */
async function db(): Promise<Client> {
  const url = process.env.NOAH_PUBLIC_BETA_DATABASE_URL;
  if (!url || !/^postgres(ql)?:\/\//.test(url)) throw new Error("Preview budget database not configured");
  if (!client) {
    const { PrismaClient } = await import("../../.generated/postgres");
    client = new PrismaClient({ datasources: { db: { url } } });
  }
  return client;
}
export type Admission =
  | { kind: "reserved"; requestId: string }
  | { kind: "cached"; answer: string }
  | { kind: "duplicate" }
  | { kind: "exhausted" };

/** Read-only health/status check for the Preview ledger. Admission still happens atomically. */
export async function publicBudgetStatus(at: Date = new Date()) {
  const client = await db();
  const dayKey = koreaBudgetDate(at);
  const rows = await client.$queryRaw<Array<{ reserved_krw: number; admitted_count: number }>>`
    SELECT reserved_krw, admitted_count FROM noah_beta_daily_budget
    WHERE day_key = ${dayKey} LIMIT 1
  `;
  const reservedKRW = rows[0]?.reserved_krw ?? 0;
  return { dayKST: dayKey, dailyLimitKRW: PUBLIC_BETA_DAILY_KRW, reservedKRW,
    remainingKRW: Math.max(0, PUBLIC_BETA_DAILY_KRW - reservedKRW),
    requestCount: rows[0]?.admitted_count ?? 0 };
}

/** Database cache is shared across instances; only canned public prompts use it. */
export async function cachedPublicAnswer(cacheKey: string | null): Promise<string | null> {
  const client = await db(); // No DB => fail closed even if there is a cache key.
  if (!cacheKey) return null;
  const rows = await client.$queryRaw<Array<{ answer: string }>>`
    SELECT answer FROM noah_beta_answer_cache
    WHERE cache_key = ${cacheKey} AND expires_at > now() LIMIT 1
  `;
  return rows[0]?.answer ?? null;
}

/**
 * Database transaction makes 1000 KRW shared cap atomic across lambdas.
 * Retry/timeout/crash reservations are NEVER refunded automatically.
 */
export async function reservePublicAi(cacheKey: string | null, at: Date = new Date()): Promise<Admission> {
  const client = await db();
  const dayKey = koreaBudgetDate(at);
  const requestId = randomUUID();
  return client.$transaction(async (tx) => {
    if (cacheKey) {
      const rows = await tx.$queryRaw<Array<{ answer: string }>>`
        SELECT answer FROM noah_beta_answer_cache
        WHERE cache_key = ${cacheKey} AND expires_at > now() LIMIT 1
      `;
      if (rows[0]) return { kind: "cached", answer: rows[0].answer } as const;
    }
    await tx.$executeRaw`
      INSERT INTO noah_beta_daily_budget(day_key) VALUES (${dayKey})
      ON CONFLICT(day_key) DO NOTHING
    `;
    const reservation = await tx.$queryRaw<Array<{ id: string }>>`
      INSERT INTO noah_beta_reservation(id, day_key, cache_key, reserved_krw)
      VALUES (CAST(${requestId} AS uuid), ${dayKey}, ${cacheKey}, ${PUBLIC_BETA_RESERVATION_KRW})
      ON CONFLICT(day_key, cache_key) DO NOTHING RETURNING id
    `;
    if (!reservation.length) return { kind: "duplicate" } as const;

    const allowed = await tx.$queryRaw<Array<{ reserved_krw: number }>>`
      UPDATE noah_beta_daily_budget
      SET reserved_krw = reserved_krw + ${PUBLIC_BETA_RESERVATION_KRW},
          admitted_count = admitted_count + 1
      WHERE day_key = ${dayKey}
        AND reserved_krw + ${PUBLIC_BETA_RESERVATION_KRW} <= ${PUBLIC_BETA_DAILY_KRW}
      RETURNING reserved_krw
    `;
    if (!allowed.length) {
      // PostgreSQL transaction rolls back the inserted reservation.
      throw new PublicBudgetExhausted();
    }
    return { kind: "reserved", requestId } as const;
  }, { timeout: 7000 }).catch((error: unknown) => {
    if (error instanceof PublicBudgetExhausted) return { kind: "exhausted" } as const;
    throw error;
  });
}

export class PublicBudgetExhausted extends Error {
  constructor() { super("NOAH public beta daily budget exhausted"); }
}

export async function finalizePublicAi(
  requestId: string, cacheKey: string | null, answer: string | null,
): Promise<void> {
  const client = await db();
  await client.$transaction(async tx => {
    // No charge is refunded even if the provider timed out or failed.
    await tx.$executeRaw`
      UPDATE noah_beta_reservation
      SET state = ${answer ? "completed" : "uncertain"},
          completed_at = now()
      WHERE id = CAST(${requestId} AS uuid)
    `;
    if (answer && cacheKey) {
      await tx.$executeRaw`
        INSERT INTO noah_beta_answer_cache(cache_key, answer, expires_at)
        VALUES (${cacheKey}, ${answer},
          now() + ${PUBLIC_BETA_CACHE_TTL_HOURS} * interval '1 hour')
        ON CONFLICT(cache_key) DO UPDATE SET
          answer = EXCLUDED.answer,
          expires_at = EXCLUDED.expires_at
      `;
    }
  }, { timeout: 7000 });
}
