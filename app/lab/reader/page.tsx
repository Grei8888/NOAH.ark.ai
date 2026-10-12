import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { readerLabConfigured } from "@/lib/news/reader-lab-access";
import { ReaderLab } from "@/components/lab/ReaderLab";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "AI 독해 실험실 · NOAH ARK",
  robots: { index: false, follow: false, nocache: true },
  description: "NOAH ARK 내부 AI 뉴스 독해 파트너 테스트 전용 페이지",
};

export default function ReaderLabPage() {
  if (!readerLabConfigured()) notFound();
  return <ReaderLab />;
}
