import Link from "next/link";

export function Header() {
  return (
    <header className="topbar">
      <div className="shell nav">
        <Link href="/" className="brand">
          <span className="brandMark">NOAH</span>
          <span className="brandSub">Intelligence</span>
        </Link>
        <span className="brandSub">Only What Matters.</span>
      </div>
    </header>
  );
}
