import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { readerLabConfigured } from "@/lib/news/reader-lab-access";
import { getOfficialSourceSnapshot, publicSourceMode } from "@/lib/news/public-official-sources";
import { ReaderLab } from "@/components/lab/ReaderLab";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "AI 뉴스 파트너 실사용 베타 · NOAH ARK",
  robots: { index: false, follow: false, nocache: true },
  description: "실제 정부 RSS 뉴스와 동일한 AI 독해 기능을 검증하는 내부 베타",
};

export default async function ReaderLabPage({
  searchParams,
}: {
  searchParams: Promise<{ source?: string }>;
}) {
  // Preview uses the same collector as production; no synthetic/mock RSS fallback.
  if (!readerLabConfigured() || !publicSourceMode()) notFound();
  const { source } = await searchParams;
  const snapshot = await getOfficialSourceSnapshot();
  const selected = snapshot.items.find(item => item.url === source);
  return (
    <ReaderLab
      sources={snapshot.items}
      initialSource={selected}
      availableFeeds={snapshot.availableFeeds}
      totalFeeds={snapshot.totalFeeds}
    />
  );
}
