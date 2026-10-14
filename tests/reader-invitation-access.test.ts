import { createHash } from "node:crypto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { POST as checkAccess } from "@/app/api/lab/reader/access/route";
import { POST as ask } from "@/app/api/lab/reader/route";

let serial = 0;
let token: string;
const origin = "http://localhost:3000";
const digest = (value: string) => createHash("sha256").update(value).digest("hex");
function request(path: "access" | "ask", code: string | null = token, extra: Record<string, string> = {}) {
  return new NextRequest(origin + "/api/lab/reader" + (path === "access" ? "/access" : ""), {
    method: "POST", headers: { origin, "Content-Type": "application/json", ...(code === null ? {} : { "x-noah-lab-token": code }), ...extra },
    body: JSON.stringify(path === "access" ? {} : { headline: "정책자금 지원", mode: "terms", question: "정책자금이란 무엇인가요?" }),
  });
}

beforeEach(() => {
  token = "test-only-invitation-" + "A".repeat(36) + serial++;
  vi.stubEnv("VERCEL_ENV", "preview");
  vi.stubEnv("NOAH_READER_LAB_ENABLED", "true");
  vi.stubEnv("NOAH_READER_LAB_INVITE_HASHES", digest(token));
  vi.stubEnv("OPENAI_API_KEY", "sk-test-not-a-real-key");
  vi.spyOn(globalThis, "fetch").mockImplementation(async () => new Response(JSON.stringify({
    output: [{ type: "message", content: [{ type: "output_text", text: "테스트용 모델 응답입니다." }] }],
  }), { status: 200 }));
});
afterEach(() => { vi.restoreAllMocks(); vi.unstubAllEnvs(); vi.useRealTimers(); });

describe("reader invitation check uses the same per-request authentication", () => {
  it("confirms a registered original code without exposing codes, hashes or API keys, even without a model key", async () => {
    vi.stubEnv("OPENAI_API_KEY", "");
    const response = await checkAccess(request("access"));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ authenticated: true });
    expect(response.headers.get("cache-control")).toContain("no-store");
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });
  it("reproduces the failure: well-shaped unregistered/revoked codes and pasted hashes are not authenticated", async () => {
    for (const value of [null, "B".repeat(36), digest(token), "short"]) {
      const response = await checkAccess(request("access", value));
      expect(response.status).toBe(401);
      expect(await response.json()).toMatchObject({ authenticated: false, code: "INVITE_REJECTED" });
      expect((await ask(request("ask", value))).status).toBe(401);
    }
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });
  it("rechecks revocation on AI requests even after a successful access check", async () => {
    expect((await checkAccess(request("access"))).status).toBe(200);
    vi.stubEnv("NOAH_READER_LAB_INVITE_HASHES", digest("replacement-test-code-" + "R".repeat(36)));
    const response = await ask(request("ask"));
    expect(response.status).toBe(401);
    expect(await response.json()).toMatchObject({ code: "INVITE_REJECTED" });
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });
  it("fails closed for production, disabled/malformed invite settings, wrong/missing origin and wrong content type", async () => {
    for (const fn of [checkAccess, ask]) {
      expect((await fn(request("access", token, { origin: "https://other.example" }))).status).toBe(403);
      expect((await fn(request("access", token, { origin: "" }))).status).toBe(403);
      expect((await fn(request("access", token, { "Content-Type": "text/plain" }))).status).toBe(415);
    }
    vi.stubEnv("VERCEL_ENV", "production");
    expect((await checkAccess(request("access"))).status).toBe(404);
    expect((await ask(request("ask"))).status).toBe(404);
    vi.stubEnv("VERCEL_ENV", "preview");
    for (const hashes of ["", "not-a-hash", Array(11).fill(digest(token)).join(",")]) {
      vi.stubEnv("NOAH_READER_LAB_INVITE_HASHES", hashes);
      expect((await checkAccess(request("access"))).status).toBe(404);
    }
    vi.stubEnv("NOAH_READER_LAB_INVITE_HASHES", digest(token));
    vi.stubEnv("NOAH_READER_LAB_ENABLED", "false");
    expect((await checkAccess(request("access"))).status).toBe(404);
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });
  it("does not spend the 6/hour AI allowance on access checks; still rejects the seventh AI call", async () => {
    for (let i = 0; i < 8; i++) expect((await checkAccess(request("access"))).status).toBe(200);
    expect(globalThis.fetch).not.toHaveBeenCalled();
    for (let i = 0; i < 6; i++) expect((await ask(request("ask"))).status).toBe(200);
    expect((await ask(request("ask"))).status).toBe(429);
    expect(globalThis.fetch).toHaveBeenCalledTimes(6);
  });
  it("preserves the 20/day allowance across hourly windows", async () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    const start = Date.now();
    for (let i = 0; i < 20; i++) {
      vi.setSystemTime(start + Math.floor(i / 6) * 3600001);
      expect((await ask(request("ask"))).status).toBe(200);
    }
    vi.setSystemTime(start + 4 * 3600001);
    expect((await ask(request("ask"))).status).toBe(429);
    expect(globalThis.fetch).toHaveBeenCalledTimes(20);
  });
  it("keeps one in-flight AI request per invite and releases the slot after completion", async () => {
    let complete!: (response: Response) => void;
    vi.mocked(globalThis.fetch).mockImplementationOnce(() => new Promise(resolve => { complete = resolve; }));
    const first = ask(request("ask"));
    await vi.waitFor(() => expect(globalThis.fetch).toHaveBeenCalledOnce());
    expect((await ask(request("ask"))).status).toBe(429);
    complete(new Response(JSON.stringify({ output: [{ type: "message", content: [{ type: "output_text", text: "테스트 응답" }] }] }), { status: 200 }));
    expect((await first).status).toBe(200);
    expect((await ask(request("ask"))).status).toBe(200);
  });
});
