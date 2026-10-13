import { NextRequest, NextResponse } from "next/server";
import { getNewsSearchOutcome, newsSearchConfigured, type NewsSearchFailureCode } from "@/lib/news/google-news-search";
import { parseNewsSearchTopic } from "@/lib/news/news-search-contract";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

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
  const outcome = await getNewsSearchOutcome(topic);
  if (!outcome.ok) {
    const message: Record<NewsSearchFailureCode, string> = {
      configuration: "뉴스 검색 API 설정이 아직 활성화되지 않았습니다.",
      invalid_key: "검색 API 인증이 거부됐습니다. 관리자가 SerpApi 키를 확인해야 합니다.",
      quota: "검색 API 이용 한도에 도달했습니다. 계정 잔여 검색량을 확인해 주세요.",
      upstream_rejected: "검색 제공업체가 요청을 거부했습니다. 연결 설정을 점검하고 있습니다.",
      provider_unavailable: "검색 제공업체에 일시적인 연결 문제가 있습니다.",
      timeout: "검색 제공업체의 응답 시간이 초과됐습니다. 잠시 뒤 다시 시도해 주세요.",
      unexpected_response: "검색 제공업체에서 예상하지 못한 응답을 받았습니다.",
      no_results: "검색은 완료됐지만 표시할 수 있는 언론사 원문 링크가 없습니다.",
    };
    return NextResponse.json(
      { error: message[outcome.code], code: outcome.code },
      { status: outcome.code === "quota" ? 429 : 503, headers: {
        "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff",
      } },
    );
  }
  return NextResponse.json(outcome.snapshot, { headers: {
    "Cache-Control": "private, max-age=0, no-store",
    "X-Content-Type-Options": "nosniff",
  } });
}
