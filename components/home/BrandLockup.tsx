import Link from "next/link";
export function BrandLockup() {
  // Temporary typographic lockup; approved artwork has no vector master in the repo.
  return (
    <Link href="/" className="brandLockup" aria-label="NOAH ARK 홈">
      <span className="brandWordmark">
        NOAH<span>ARK</span>
      </span>
      <span className="brandMotto">Only What Matters.</span>
    </Link>
  );
}
