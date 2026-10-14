import Link from "next/link";
import type { ReactNode } from "react";
import { BrandLockup } from "./BrandLockup";
import { Icon } from "./Icon";
export type HomeView =
  "home" | "discover" | "startup" | "saved" | "my" | "settings";
// One shared label for both desktop and mobile navigation.
const nav: { id: HomeView; label: string; icon: string }[] = [
  { id: "home", label: "홈", icon: "home" },
  { id: "discover", label: "뉴스", icon: "discover" },
  { id: "startup", label: "사업기회", icon: "startup" },
  { id: "saved", label: "저장", icon: "saved" },
  { id: "my", label: "마이", icon: "my" },
];
export const viewURL = (id: HomeView) => (id === "home" ? "/" : `/?view=${id}`);
export function AppShell({
  children,
  rail,
  view = "home",
  compactRail = false,
}: {
  children: ReactNode;
  rail?: ReactNode;
  view?: HomeView;
  compactRail?: boolean;
}) {
  return (
    <div className={compactRail ? "appShell appShell--compactRail" : "appShell"}>
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
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
