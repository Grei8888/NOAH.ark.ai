import { createHmac } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { feedbackScriptUrl } from "@/lib/beta/feedback-settings";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function json(data: object, status: number) {
  return NextResponse.json(data, {status, headers:{"Cache-Control":"no-store"}});
}
type Feedback = { submissionId:string; nickname:string; score:string; liked:string; problems:string; website?:string };

function validate(body: unknown): Feedback | null {
  if (!body || typeof body !== "object" || Array.isArray(body)) return null;
  const x = body as Record<string,unknown>;
  for(const field of ["submissionId","nickname","score","liked","problems"]) {
    if(typeof x[field] !== "string") return null;
  }
  if(typeof x.website !== "undefined" && typeof x.website !== "string") return null;
  const data = x as Feedback;
  if (!/^[0-9a-f-]{36}$/i.test(data.submissionId) ||
      data.nickname.length > 40 || data.liked.length > 1500 || data.problems.length > 1500 ||
      !["","1","2","3","4","5"].includes(data.score)) return null;
  if (!data.score && !data.liked.trim() && !data.problems.trim()) return null;
  return {
    submissionId: data.submissionId,
    nickname: data.nickname.trim(),
    score: data.score,
    liked: data.liked.trim(),
    problems: data.problems.trim(),
    website: typeof data.website === "string" ? data.website.slice(0, 100) : "",
  };
}

export async function POST(req: NextRequest) {
  // Never attempt public collection without an owner-deployed receiver and secret.
  const url = feedbackScriptUrl();
  const secret = process.env.NOAH_FEEDBACK_SCRIPT_SECRET?.trim();
  if (!url || !secret) return json({ok:false,error:"접수 기능을 준비 중입니다."}, 503);

  // Browser-origin guard; not a substitute for script-side authentication and quotas.
  const origin = req.headers.get("origin");
  if (origin !== new URL(req.url).origin) return json({ok:false,error:"요청을 처리할 수 없습니다."},403);
  if (!req.headers.get("content-type")?.startsWith("application/json")) return json({ok:false,error:"잘못된 요청입니다."},415);
  const bodyLength = Number(req.headers.get("content-length") || 0);
  if (bodyLength > 10000) return json({ok:false,error:"의견이 너무 깁니다."},413);

  let raw: unknown;
  try { raw = await req.json(); } catch { return json({ok:false,error:"잘못된 요청입니다."},400); }
  const data = validate(raw);
  if (!data) return json({ok:false,error:"점수 또는 의견을 입력해 주세요."},400);
  // Trivial honeypot: ignore automated submissions without writing to the sheet.
  if (data.website) return json({ok:true},200);

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
  const visitorKey = createHmac("sha256",secret).update(ip).digest("hex").slice(0,24);

  try {
    const result = await fetch(url,{
      method:"POST",
      headers:{"Content-Type":"text/plain;charset=utf-8"},
      body:JSON.stringify({...data,secret,visitorKey}),
      redirect:"follow",
      cache:"no-store",
      signal:AbortSignal.timeout(8500),
    });
    if (!result.ok) return json({ok:false,error:"접수가 지연되고 있습니다. 잠시 후 다시 시도해 주세요."},502);
    const text = await result.text();
    let response: {ok?:unknown; id?:unknown; error?:unknown};
    try { response = JSON.parse(text); }
    catch { return json({ok:false,error:"저장 결과를 확인할 수 없습니다. 다시 확인해 주세요."},502); }
    if (response.ok !== true || response.id !== data.submissionId) {
      // Distinguish safe failure classes without revealing Script URL or credentials.
      const reason = typeof response.error === "string" ? response.error : "";
      if (reason === "unauthorized_or_not_setup")
        return json({ok:false,error:"Google 의견 수집 연결 설정을 확인해 주세요.",code:"SETUP_MISMATCH"},503);
      if (reason === "storage_unavailable")
        return json({ok:false,error:"Google 설문 저장 단계에서 오류가 발생했습니다.",code:"GOOGLE_SAVE_FAILED"},503);
      if (reason === "rate_limit")
        return json({ok:false,error:"잠시 후 다시 제출해 주세요.",code:"RATE_LIMIT"},429);
      return json({ok:false,error:"접수가 지연되고 있습니다. 잠시 후 다시 시도해 주세요.",code:"RECEIPT_FAILED"},503);
    }
    return json({ok:true},200);
  } catch {
    return json({ok:false,error:"연결에 문제가 있습니다. 의견은 화면에 남겨두었습니다."},503);
  }
}
