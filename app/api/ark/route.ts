import { NextResponse } from "next/server";
import { getTodaysArk } from "@/lib/ark/today";

export async function GET() {
  return NextResponse.json({
    service: "NOAH Intelligence",
    mode: "mock",
    generatedAt: new Date().toISOString(),
    items: getTodaysArk()
  });
}
