# NOAH ARK source-card representative visual policy v0.1

**Default for all live public items: NOAH-owned SVG visual (no publisher photo).**

The public beta currently reads official ministry RSS metadata: title, date, publisher, original hyperlink. RSS metadata, HTML `og:image` and article-body images must **not** be treated as a reusable image license, even on official government websites.

## Visual design
- A-Layout Intelligence Desk unchanged; image slot is a **small subordinate 124×94px desktop, 86×77px mobile** card element.
- No external image requests or AI image calls in normal live source mode.
- Muted navy/cool grey, one gold dot, lightweight geometric motifs designed in source code. Theme detection by deterministic keywords is **decorative**, not a claim of news classification, policy certainty or semantic AI analysis.
- Article headline and publisher original link remain the primary click action. Thumbnail itself links to the same original page. Card remains a factual source-list item, not a synthesized Event.

## Photo authorization
Component's optional `approvedImage` input is **not populated** from the RSS feed. The only accepted photo entries must have:
- `verified: true` after manual review,
- an explicit `owned`, `licensed`, or `kogl1` rights status,
- `commercialUsePermitted: true` and `modificationsPermitted: true`,
- a valid HTTPS image URL and a valid HTTPS rights evidence URL,
- meaningful photo alt text and an attribution string.

Any of: `unknown`, `kogl2`, `kogl3`, `kogl4`, missing proof, no attribution, HTTP URL, unreviewed items → **NOAH cover fallback**. Even with open licenses, review separate photo/portrait/private rights and whether modifications and commercial reuse are truly allowed. A programmatically asserted flag alone is not a legal determination: record proof, author/rights holder, source URL, screenshot/date and notice conditions before wiring this optional prop to live data.

## Legal/operations boundary
- Do not use scraped `og:image`, press image, RSS `enclosure`, or remote image proxies without confirmed permission.
- Publishing just a link to an original article is not itself permission to display the publisher's photo.
- Image attribution and terms must be visible for a reviewed photo in a future version; at present **all source cards use the first-party cover**.
- No new server-side images, third-party tracking, database schema, paid AI, or image-processing pipeline introduced.

## Checks
`tests/card-visual-policy.test.ts` covers the rejection of unreviewed/unknown/restricted images and permitted reviewed entries. `.github/workflows/noah-safe-visuals.yml` checks the existing unit/lint/build/HTTP regression suite plus actual official RSS → server HTML presence of owned covers and absence of external photos.

Initial mobile UX specification: preserve headline readability; cover is secondary, no decorative stock-photo feel, no unnecessary clickbait.
