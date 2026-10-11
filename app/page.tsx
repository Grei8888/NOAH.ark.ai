import { getEdition } from "@/lib/data";
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
  return (
    <PersonalizedHome
      edition={await getEdition()}
      now={new Date().toISOString()}
      view={validView}
    />
  );
}
