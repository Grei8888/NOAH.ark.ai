import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "@/app/api/lab/reader/route";
import {
  READER_MODES, readerLabInstructions, readerLabUserMessage, validateReaderLabInput,
} from "@/lib/news/reader-companion";
import {
  outputTextFromOpenAI, readerLabConfigured, validReaderLabAccess,
} from "@/lib/news/reader-lab-access";

const keys = ["NOAH_READER_LAB_ENABLED", "NOAH_READER_LAB_ACCESS_TOKEN", "OPENAI_API_KEY", "VERCEL_ENV"];
const originals = Object.fromEntries(keys.map(key => [key, process.env[key]]));
const token = "z".repeat(40);
const request = (access = token, origin = "http://localhost:3000") => new NextRequest(
  "http://localhost:3000/api/lab/reader",
  {
    method: "POST",
    headers: { origin, "Content-Type": "application/json", "x-noah-lab-token": access },
    body: JSON.stringify({ headline: "소상공인 정책자금 지원 확대", mode: "terms", question: "정책자금이란 무엇인가요?" }),
  },
);
beforeEach(() => {
  process.env.NOAH_READER_LAB_ENABLED = "true";
  process.env.NOAH_READER_LAB_ACCESS_TOKEN = token;
  process.env.OPENAI_API_KEY = "sk-test-not-a-real-key";
  process.env.VERCEL_ENV = "preview";
});
afterEach(() => {
  vi.restoreAllMocks();
  for (const k of keys) {
    if (originals[k] === undefined) delete process.env[k]; else process.env[k] = originals[k];
  }
});

describe("actual AI Reader prototype safety gates", () => {
  it("defines four comprehension skills without an article-reading gate", () => {
    expect(READER_MODES.map(x => x.label)).toEqual(["용어 설명","배경 이해","비판적 독해","다른 관점"]);
    expect(readerLabInstructions()).toContain("기사 전문을 조회하거나 보지 않았다");
    expect(readerLabInstructions()).toContain("실제 기사 제목·URL을 창작하지 마라");
  });
  it("rejects malformed or oversized user input", () => {
    expect(validateReaderLabInput({ mode: "terms", headline: "제목", question: "용어 설명해줘" })?.mode).toBe("terms");
    expect(validateReaderLabInput({ mode: "fake", headline: "", question: "질문이에요" })).toBeNull();
    expect(validateReaderLabInput({ mode: "terms", headline: "", question: "x" })).toBeNull();
    expect(validateReaderLabInput({ mode: "terms", headline: "", question: "x".repeat(381) })).toBeNull();
    expect(readerLabUserMessage({ mode: "critical", headline: "제목", question: "어떤 근거가 필요한가요?" })).toContain("contextHeadlineOnly");
  });
  it("fails closed on production even with a real key and test access code", async () => {
    process.env.VERCEL_ENV = "production";
    expect(readerLabConfigured()).toBe(false);
    expect(validReaderLabAccess(token)).toBe(false);
    const remote = vi.spyOn(globalThis, "fetch");
    const response = await POST(request());
    expect(response.status).toBe(404);
    expect(remote).not.toHaveBeenCalled();
  });
  it("requires a long secret, exact origin and per-request authentication", async () => {
    expect(readerLabConfigured()).toBe(true);
    expect(validReaderLabAccess(token)).toBe(true);
    expect(validReaderLabAccess("no")).toBe(false);
    const remote = vi.spyOn(globalThis, "fetch");
    expect((await POST(request("wrong"))).status).toBe(401);
    expect((await POST(request(token, "https://malicious.example"))).status).toBe(403);
    expect(remote).not.toHaveBeenCalled();
    process.env.NOAH_READER_LAB_ACCESS_TOKEN = "123";
    expect(readerLabConfigured()).toBe(false);
  });
  it("parses only real Responses API output and rejects empty responses", () => {
    expect(outputTextFromOpenAI({ output: [{ type: "message", content: [{ type: "output_text", text: "정책자금은 목적이 정해진 자금입니다." }] }] })).toContain("정책자금");
    expect(outputTextFromOpenAI({ output: [] })).toBeNull();
    expect(outputTextFromOpenAI({ output: [{ type: "analysis", content: [] }] })).toBeNull();
  });
  it("makes a real Responses-format call when configured, with no article body or storing", async () => {
    const outbound = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify({
      output: [{ type: "message", content: [{ type: "output_text", text: "정책자금은 정부의 정책 목적에 따른 자금입니다." }] }],
    }), { status: 200, headers: { "content-type": "application/json" } }));
    const response = await POST(request());
    const payload = await response.json();
    expect(response.status).toBe(200);
    expect(payload.answer).toContain("정책자금");
    expect(outbound).toHaveBeenCalledOnce();
    const [url, options] = outbound.mock.calls[0];
    expect(url).toBe("https://api.openai.com/v1/responses");
    const data = JSON.parse(String(options?.body));
    expect(data.store).toBe(false);
    expect(data.max_output_tokens).toBe(550);
    expect(data.input).not.toContain("https://");
    expect(data.instructions).toContain("기사 전문을 조회하거나 보지 않았다");
  });
});
