import { getEdition } from "@/lib/data";
import { getOfficialSourceSnapshot, publicSourceMode } from "@/lib/news/public-official-sources";
import { PublicSourceDesk } from "@/components/home/PublicSourceDesk";
import { HomeGatewayPage } from "@/components/home/HomeGatewayPage";
import { newsSearchConfigured } from "@/lib/news/google-news-search";
import { businessSupportEnabled } from "@/lib/business/bizinfo-provider";
import { readerLabConfigured, readerLabModelReady } from "@/lib/news/reader-lab-access";
import { PersonalizedHome } from "@/components/home/PersonalizedHome";
import type { HomeView } from "@/components/home/AppShell";
export const dynamic = "force-dynamic";
export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  const { view } = await searchParams;
  const validView: HomeView = [
    "home",
    "discover",
    "startup",
    "saved",
    "my",
    "settings",
  ].includes(view ?? "")
    ? (view as HomeView)
    : "home";
  if (publicSourceMode()) {
    // Home is a choice between two workspaces, not a merged news/business feed.
    // Avoid touching public feed or paid search APIs on the gateway.
    if (validView === "home") return <HomeGatewayPage privateBeta={readerLabConfigured()} />;
    return <PublicSourceDesk snapshot={await getOfficialSourceSnapshot()} view={validView}
      readerLabAvailable={readerLabConfigured()} readerModelReady={readerLabModelReady()}
      newsSearchEnabled={newsSearchConfigured()} businessSupportEnabled={businessSupportEnabled()} />;
  }
  return (
    <PersonalizedHome
      edition={await getEdition()}
      now={new Date().toISOString()}
      view={validView}
    />
  );
}
