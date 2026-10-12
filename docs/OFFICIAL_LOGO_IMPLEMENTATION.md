# Official Event Capsule header — PR #8

Continues `codex/personalized-home-v1` after asset upload commit
`79a6abe7a3344b1b5e7ba51be7bd39acc1999609`. The checkout was clean; an explicit
branch fetch followed by a fast-forward preserved the prior editorial/photo work.
No reset, force push, merge to main or deployment was performed.

## Logo application result

`BrandLockup` now combines the official symbol on the left with the existing
NOAH ARK text wordmark on the right. The shared component serves the desktop
left navigation and mobile top header. Desktop keeps the small slogan below
the wordmark; mobile omits it and keeps the existing 60px header.

Next Image serves the supplied 7,662-byte PNG directly with `unoptimized`:
`/brand/noah-event-capsule-mark.png`, intrinsic **384 × 155**, unchanged bytes,
colors and transparency. CSS changes only display size, with automatic height:
56px symbol width on full desktop, 44px on narrower desktop and 52px on mobile.
No crop, filter, image processing, generated symbol or replacement artwork.

Asset SHA-256:
`e97d27ff6f63fbc78741292ab9e7422631206544c6b600a5661a8bee823bb82d`.
The home link retains `aria-label="NOAH ARK 홈"` and a minimum 44px height;
the redundant symbol is hidden from assistive technology. Keyboard focus and
Enter navigation were checked on both target viewports.

## Files changed

- `components/home/BrandLockup.tsx`: official symbol in the shared lockup.
- `app/globals.css`: symbol/wordmark/slogan alignment, sizing and breakpoint fit.
- `tests/browser/editorial.spec.ts`: logo loading/ratio/fit, brand keyboard focus,
  all five mobile destinations and narrower viewport checks; updated capture path.
- `docs/HOME_V1_IMPLEMENTATION.md`, `docs/EDITORIAL_DEMO_IMPLEMENTATION.md`:
  current verification and resolved logo blocker.
- This report and four captures under `docs/review/official-logo/`.

The uploaded PNG itself is unchanged. `AppShell` already reused `BrandLockup`
for both headers and required no modification.

## Preserved design and architecture

Home title remains **32px desktop / 26px mobile, #173F73**. Lead headlines retain
their 38px / 26px treatment. Existing demo photos, medium/compact rows, open right
rail, white/navy/cool gray and restrained gold remain unchanged.

No changes to Mock/Live separation, declared-interest matching, recommendations,
source attribution/rights gates, save/hide/undo/topic controls, DTO/API, database,
provider, scoring, auth, admin, cron or PR #7 runtime. No dependency or lockfile edits.

## Validation

- `pnpm typecheck`: passed.
- `pnpm test`: **43/43 passed**, six suites.
- `pnpm lint`: passed.
- `pnpm build`: passed; five existing Prisma/runtime filesystem-tracing warnings.
- `pnpm test:http`: **7/7 passed**, including Mock/Live isolation and admin/cron/origin boundaries.
- Existing Chromium browser suite: **5/5 passed**. Target viewports:
  **1440 × 1000 desktop**, **390 × 844 mobile**; additional logo-fit checks at
  320, 768 and 1024px. No browser was installed.
- Verified actual PNG decode, original intrinsic dimensions, undistorted displayed
  ratio, header containment/spacing, mobile slogan hiding, 44px brand link,
  visible keyboard focus and home navigation. Existing first-viewport Lead,
  photos/failed-photo fallback, source-count honesty and preference controls pass.
- Mobile Home/Discover/Startup/Saved/My were each clicked and reached the proper
  URL, active state and visible content. No page errors or horizontal overflow.
- Screenshot inspection confirms compact, legible headers and preserved editorial
  hierarchy. Captures show explicitly labeled synthetic demo content.

## Desktop and mobile screenshots

- [Desktop 1440 × 1000](review/official-logo/home-1440.png)
- [Mobile 390 × 844](review/official-logo/home-390.png)
- [Desktop full feed](review/official-logo/home-1440-full.png)
- [Mobile full feed](review/official-logo/home-390-full.png)

## Remaining issues

- Final design acceptance belongs to the owner; PR #8 remains draft. Nothing is
  merged or deployed by this update.
- Editable vector master, favicon/app icons and reverse/dark brand variants are
  deferred. This pass uses the supplied symbol PNG with a text wordmark.
- Existing build tracing warnings, Safari/physical-device QA, Live-provider and
  PostgreSQL/scheduler checks remain. Chromium viewport checks do not verify those.
- Demo photos remain illustrative Mock-only assets. Production imagery still
  requires source-relevant, rights-cleared metadata through the separate gate.
