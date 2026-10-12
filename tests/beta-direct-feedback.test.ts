import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "@/app/api/beta/feedback/route";
import { feedbackScriptUrl, googleFeedbackConfigured } from "@/lib/beta/feedback-settings";

const origin = "https://noah-ark-ai.vercel.app";
const route = origin + "/api/beta/feedback";
const script = "https://script.google.com/macros/s/AKfycbwExampleReceiver12345/exec";
const submissionId = "56be0bfa-6f31-4f73-91c9-92f60ea7fdef";
const payload = {
  submissionId,
  nickname: "노아탐험가",
  score: "4",
  liked: "원문 링크가 보기 좋습니다.",
  problems: "모바일 뉴스 검색 버튼을 확대해 주세요.",
};
const request = (body: unknown, from = origin) => new NextRequest(route,{
  method:"POST",
  headers:{"Origin":from,"Content-Type":"application/json"},
  body:JSON.stringify(body),
});

beforeEach(() => {
  vi.stubEnv("NOAH_FEEDBACK_SCRIPT_URL","");
  vi.stubEnv("NOAH_FEEDBACK_SCRIPT_SECRET","");
});
afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); });

describe("one-tap tester feedback receiver", () => {
  it("stays disabled until Google Sheet receiver is actually configured", async () => {
    expect(googleFeedbackConfigured()).toBe(false);
    expect((await POST(request(payload))).status).toBe(503);
    vi.stubEnv("NOAH_FEEDBACK_SCRIPT_URL","https://evil.example/exec");
    vi.stubEnv("NOAH_FEEDBACK_SCRIPT_SECRET","secret");
    expect(feedbackScriptUrl()).toBeNull();
    expect((await POST(request(payload))).status).toBe(503);
  });
  it("rejects foreign origins, blank responses and oversize fields", async () => {
    vi.stubEnv("NOAH_FEEDBACK_SCRIPT_URL",script);
    vi.stubEnv("NOAH_FEEDBACK_SCRIPT_SECRET","server-only-secret");
    expect((await POST(request(payload,"https://untrusted.test"))).status).toBe(403);
    expect((await POST(request({...payload,score:"",liked:"",problems:""}))).status).toBe(400);
    expect((await POST(request({...payload,problems:"x".repeat(1501)}))).status).toBe(400);
  });
  it("returns success only after the Google script acknowledges the same submission ID", async () => {
    vi.stubEnv("NOAH_FEEDBACK_SCRIPT_URL",script);
    vi.stubEnv("NOAH_FEEDBACK_SCRIPT_SECRET","server-only-secret");
    const sent = vi.fn().mockResolvedValue(new Response(JSON.stringify({ok:true,id:submissionId}),{status:200}));
    vi.stubGlobal("fetch",sent);
    const out = await POST(request(payload));
    expect(out.status).toBe(200);
    const responseBody = await out.json();
    expect(responseBody).toEqual({ok:true});
    const [requestedUrl,init] = sent.mock.calls[0];
    expect(requestedUrl).toBe(script);
    const forwarded = JSON.parse(init.body);
    expect(forwarded.score).toBe("4");
    expect(forwarded.nickname).toBe("노아탐험가");
    expect(forwarded.secret).toBe("server-only-secret");
    expect(forwarded.visitorKey).toHaveLength(24);
    expect(JSON.stringify(responseBody)).not.toContain("server-only-secret");
  });
  it("never reports a write as successful when Google cannot verify storage", async () => {
    vi.stubEnv("NOAH_FEEDBACK_SCRIPT_URL",script);
    vi.stubEnv("NOAH_FEEDBACK_SCRIPT_SECRET","server-only-secret");
    vi.stubGlobal("fetch",vi.fn().mockResolvedValue(new Response("<html>sign in</html>",{status:200})));
    expect((await POST(request(payload))).status).toBe(502);
    vi.stubGlobal("fetch",vi.fn().mockResolvedValue(new Response(JSON.stringify({ok:true,id:"other"}),{status:200})));
    expect((await POST(request(payload))).status).toBe(503);
  });
});
