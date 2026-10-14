import { NextResponse } from "next/server";
import { publicBetaConfigured } from "@/lib/news/public-link-budget-policy";
import { publicBudgetStatus } from "@/lib/news/public-link-budget-store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** Preview-only, non-secret verification endpoint. Never authorizes a paid call. */
export async function GET() {
  if (!publicBetaConfigured()) return NextResponse.json({ available: false }, {
    status: 404, headers: { "Cache-Control": "no-store" },
  });
  try {
    const budget = await publicBudgetStatus();
    return NextResponse.json({ operational: true, ...budget,
      note: "보수적 예약 예산입니다. 실제 청구액과 같지 않습니다." }, {
      headers: { "Cache-Control": "public, s-maxage=30", "X-Content-Type-Options": "nosniff" },
    });
  } catch {
    return NextResponse.json({ operational: false, code: "BUDGET_UNAVAILABLE" }, {
      status: 503, headers: { "Cache-Control": "no-store" },
    });
  }
}
