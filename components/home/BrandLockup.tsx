import Image from "next/image";
import Link from "next/link";
export function BrandLockup() {
  return (
    <Link href="/" className="brandLockup" aria-label="NOAH ARK 홈">
      <span className="brandIdentity">
        <Image
          className="brandSymbol"
          src="/brand/noah-event-capsule-mark.png"
          width={384}
          height={155}
          alt=""
          aria-hidden="true"
          loading="eager"
          unoptimized
        />
        <span className="brandWordmark">
          NOAH<span>ARK</span>
        </span>
      </span>
      <span className="brandMotto">Only What Matters.</span>
    </Link>
  );
}
