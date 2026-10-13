import { NextRequest, NextResponse } from "next/server";
import { getNewsSearchSnapshot, newsSearchConfigured } from "@/lib/news/google-news-search";
import { parseNewsSearchTopic } from "@/lib/news/news-search-contract";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  if (!newsSearchConfigured()) return NextResponse.json(
    { error: "뉴스 검색 API가 아직 연결되지 않았습니다." },
    { status: 503, headers: { "Cache-Control": "no-store" } },
  );
  const topic = parseNewsSearchTopic(request.nextUrl.searchParams.get("topic"));
  if (!topic) return NextResponse.json(
    { error: "지원하지 않는 검색 주제입니다." },
    { status: 400, headers: { "Cache-Control": "no-store" } },
  );
  const snapshot = await getNewsSearchSnapshot(topic);
  if (!snapshot) return NextResponse.json(
    { error: "검색 제공업체의 응답을 받지 못했습니다. 잠시 후 다시 확인해 주세요." },
    { status: 503, headers: { "Cache-Control": "no-store" } },
  );
  return NextResponse.json(snapshot, { headers: {
    "Cache-Control": "private, max-age=0, no-store",
    "X-Content-Type-Options": "nosniff",
  } });
}
