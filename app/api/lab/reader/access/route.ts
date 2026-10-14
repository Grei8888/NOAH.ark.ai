import { NextRequest, NextResponse } from "next/server";
import { verifyReaderLabRequest } from "@/lib/news/reader-lab-request-access";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** No model import, provider call, token issuance or AI quota consumption. */
export async function POST(request: NextRequest) {
  const access = verifyReaderLabRequest(request);
  return NextResponse.json(access.ok ? { authenticated: true } : {
    authenticated: false, code: access.code, error: access.error,
  }, { status: access.ok ? 200 : access.status, headers: {
    "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff",
  } });
}
