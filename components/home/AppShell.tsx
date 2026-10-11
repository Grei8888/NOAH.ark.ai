import Link from "next/link";
import type { ReactNode } from "react";
import { BrandLockup } from "./BrandLockup";
import { Icon } from "./Icon";
export type HomeView =
  "home" | "discover" | "startup" | "saved" | "my" | "settings";
const nav: { id: HomeView; label: string; icon: string }[] = [
  { id: "home", label: "Home", icon: "home" },
  { id: "discover", label: "Discover", icon: "discover" },
  { id: "startup", label: "Startup", icon: "startup" },
  { id: "saved", label: "Saved", icon: "saved" },
  { id: "my", label: "My NOAH", icon: "my" },
];
export const viewURL = (id: HomeView) => (id === "home" ? "/" : `/?view=${id}`);
export function AppShell({
  children,
  rail,
  view = "home",
}: {
  children: ReactNode;
  rail?: ReactNode;
  view?: HomeView;
}) {
  return (
    <div className="appShell">
      <a className="skipLink" href="#main-content">
        본문으로 이동
      </a>
      <aside className="desktopNav">
        <BrandLockup />
        <nav aria-label="주 메뉴">
          {nav.map((item) => (
            <Link
              key={item.id}
              href={viewURL(item.id)}
              aria-current={view === item.id ? "page" : undefined}
            >
              <Icon name={item.icon} />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="navSecondary">
          <Link href="/?view=my">
            Profile <Icon name="my" />
          </Link>
          <Link href="/?view=settings">
            Settings <Icon name="settings" />
          </Link>
        </div>
        <div className="navFoot">
          <span className="signalDot" />
          ONE EVENT.
          <br />
          MULTIPLE PERSPECTIVES.
        </div>
      </aside>
      <header className="mobileHeader">
        <BrandLockup />
        <Link
          href="/?view=discover"
          className="iconButton"
          aria-label="Event 검색"
        >
          <Icon name="search" />
        </Link>
        <Link href="/?view=my" className="iconButton" aria-label="내 관심사">
          <Icon name="my" />
        </Link>
      </header>
      <main id="main-content" className="readingColumn">
        {children}
      </main>
      {rail && (
        <aside className="intelligenceRail" aria-label="내 관심 신호">
          {rail}
        </aside>
      )}
      <nav className="mobileNav" aria-label="모바일 주 메뉴">
        {nav.map((item) => (
          <Link
            key={item.id}
            href={viewURL(item.id)}
            aria-current={view === item.id ? "page" : undefined}
          >
            <Icon name={item.icon} />
            <span>{item.id === "my" ? "My" : item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
