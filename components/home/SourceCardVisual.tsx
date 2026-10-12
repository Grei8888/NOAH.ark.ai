import Image from 'next/image';
import { resolveCardVisual, type ReviewedImage } from '@/lib/news/card-visual-policy';
import type { OfficialFeedKind } from '@/lib/news/public-official-sources';

/**
 * Restrained, in-house SVG editorial motif. Not a photograph or illustration
 * of a reported event. The photo branch is dormant until image rights are verified.
 */
export function SourceCardVisual({
  title,
  kind,
  approvedImage,
}: {
  title: string;
  kind: OfficialFeedKind;
  approvedImage?: ReviewedImage;
}) {
  const visual = resolveCardVisual(title, kind, approvedImage);
  if (visual.mode === 'approved-photo') {
    return (
      <span className="noahCardImage noahCardImage--photo">
        <Image
          src={visual.image.url}
          alt={visual.image.alt}
          fill
          sizes="(max-width: 767px) 84px, 124px"
          unoptimized
        />
        <span className="noahCardImageCredit" title={visual.image.attribution}>
          LICENSED
        </span>
      </span>
    );
  }

  return (
    <span className="noahCardImage noahCardImage--cover" data-theme={visual.theme} aria-hidden="true">
      <span className="noahCardImageEyebrow">NOAH / ARK</span>
      <svg className="noahCardImageArt" viewBox="0 0 160 106" focusable="false">
        <path className="noahCoverFrame" d="M17 17H143V89H17Z" />
        <path className="noahCoverWaveBack" d="M15 68Q42 40 70 59T147 48" />
        <path className="noahCoverWave" d="M13 80Q44 47 77 66T148 45" />
        {visual.theme === 'funding' ? (
          <path className="noahCoverDetail" d="M51 46V30M66 46V23M81 46V34" />
        ) : visual.theme === 'technology' ? (
          <path className="noahCoverDetail" d="M48 25h23v14h25M71 39v12" />
        ) : visual.theme === 'startup' ? (
          <path className="noahCoverDetail" d="M54 45V26H80V45M63 26V20H72" />
        ) : visual.theme === 'export' ? (
          <path className="noahCoverDetail" d="M40 35h49m-25-18c-12 10-12 28 0 35m11-35c12 10 12 28 0 35" />
        ) : (
          <path className="noahCoverDetail" d="M50 24h35M50 34h35M50 44h22" />
        )}
        <circle className="noahCoverGold" cx="129" cy="24" r="5" />
      </svg>
      <span className="noahCardImageTag">{visual.label}</span>
    </span>
  );
}
