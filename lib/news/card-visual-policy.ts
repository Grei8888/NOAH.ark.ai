import type { OfficialFeedKind } from '@/lib/news/public-official-sources';

/**
 * Thumbnail rights are distinct from article-title attribution.
 * A feed image, og:image, or an HTML <img> is NEVER automatically approved.
 */
export type ImageRightsClass = 'owned' | 'licensed' | 'kogl1' | 'kogl2' | 'kogl3' | 'kogl4' | 'unknown';
export type CardCoverTheme = 'startup' | 'funding' | 'technology' | 'export' | 'policy' | 'announcement';

export interface ReviewedImage {
  url: string;
  alt: string;
  rights: ImageRightsClass;
  attribution: string;
  evidenceUrl: string;
  verified: boolean;
  commercialUsePermitted: boolean;
  modificationsPermitted: boolean;
}

export type CardVisual =
  | { mode: 'noah-cover'; theme: CardCoverTheme; label: string; rights: 'owned' }
  | { mode: 'approved-photo'; image: ReviewedImage; rights: 'owned' | 'licensed' | 'kogl1' };

function safeHttpsUrl(input: string): boolean {
  try {
    const u = new URL(input);
    return u.protocol === 'https:' && !!u.hostname && !u.username && !u.password;
  } catch { return false; }
}

/** Explicit human rights review required; no automated use of RSS media or og:image. */
export function isApprovedCardPhoto(image: ReviewedImage | undefined): image is ReviewedImage & {
  rights: 'owned' | 'licensed' | 'kogl1'
} {
  return !!image &&
    image.verified === true &&
    ['owned', 'licensed', 'kogl1'].includes(image.rights) &&
    image.commercialUsePermitted === true &&
    image.modificationsPermitted === true &&
    !!image.alt.trim() &&
    !!image.attribution.trim() &&
    safeHttpsUrl(image.url) &&
    safeHttpsUrl(image.evidenceUrl);
}

/** Decorative theme hints only; these are NOT factual summaries or AI topic analysis. */
export function classifyVisualTheme(title: string, kind: OfficialFeedKind): CardCoverTheme {
  if (/AI|인공지능|반도체|디지털|기술|R&D|인공지능|연구개발|혁신기술|스마트/i.test(title)) return 'technology';
  if (/금융|자금|투자|융자|보증|펀드|대출|재정/i.test(title)) return 'funding';
  if (/수출|해외|글로벌|무역|국제/i.test(title)) return 'export';
  if (/창업|스타트업|벤처|기업가정신|소상공인/i.test(title)) return 'startup';
  if (/법률|시행|정책|규제|제도|고시|공고|법령/i.test(title)) return 'policy';
  return kind === 'press' ? 'announcement' : 'policy';
}

export function resolveCardVisual(
  title: string,
  kind: OfficialFeedKind,
  candidate?: ReviewedImage,
): CardVisual {
  if (isApprovedCardPhoto(candidate)) {
    return { mode: 'approved-photo', image: candidate, rights: candidate.rights };
  }
  const theme = classifyVisualTheme(title, kind);
  const labels: Record<CardCoverTheme, string> = {
    startup: 'STARTUP',
    funding: 'FUNDING',
    technology: 'TECH',
    export: 'GLOBAL',
    policy: 'POLICY',
    announcement: 'BRIEF',
  };
  return { mode: 'noah-cover', theme, label: labels[theme], rights: 'owned' };
}
