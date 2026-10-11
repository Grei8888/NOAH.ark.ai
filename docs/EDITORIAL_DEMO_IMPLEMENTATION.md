# Premium editorial photo demo — PR #8

Continues `codex/personalized-home-v1` and the existing Magazine Editorial Pass.
The original structure, runtime and preference/source interactions are reused.
**Official Event Capsule PNG application remains blocked:** no logo attachment
was supplied and no original logo asset exists in the repository/workspace.

## What changed

- Two curated local photographs illustrate known synthetic startup/Physical AI
  scenarios in FOR YOU. The default declared-interest demo shows one lead photo
  and one medium-row thumbnail. Every photo has an explicit demo caption, alt
  text, creator credit and linked source/license; the lead caption also states
  that the picture is not the actual Event location.
- The Home introduction is quieter: 32px desktop, 30px narrower desktop, 26px
  mobile, 24px below 360px, using `#173F73`. The cover headline remains 38px
  desktop / 26px mobile and keeps the stronger editorial emphasis.
- Failed image loads remove the slot, preserving the readable text and controls.
- Header/logo: the existing temporary text lockup remains pending the original
  horizontal PNG. No replacement symbol or modified wordmark was invented.

## Files changed

- `components/home/DemoEventImage.tsx`: responsive photos, visible attribution,
  demo marking and failed-load fallback.
- `lib/home/demo-images.ts`: static scenario mapping and Mock-only display gate.
- `components/home/EventFeedItem.tsx`, `PersonalizedHome.tsx`: reuse existing lead
  and medium treatments with optional demo imagery.
- `app/globals.css`: intro size/color, cover-photo and thumbnail rhythm, mobile
  sizing and clear space before action rows.
- `public/demo/`: two original JPEGs and [source/license record](../public/demo/ATTRIBUTION.md).
- `tests/demo-images.test.ts`, `tests/browser/editorial.spec.ts`: image isolation,
  actual browser loading/fallback and existing interaction checks.
- This report, updated Home/original-pass notes and `docs/review/editorial-demo/*.png`.

## Visual update summary

- **Lead Event:** open ruled layout, large Korean sans headline, one broad photo,
  compact demo/rights caption and the existing visible recommendation reason.
- **Secondary Event:** one selective thumbnail in the 02–03 medium treatment;
  04–05 compact, MUST KNOW and STARTUP RADAR retain their text rhythm.
- **Right rail:** existing whitespace, thin rules and aligned numbers retained.
- **Header/logo:** original Event Capsule PNG still required for both headers.
- **Mobile:** one reading column with the full lead headline and photo visible
  in the 390px first viewport; existing five-item bottom navigation retained.

## Architecture and trust

No DTO/API, database, provider, scoring, auth, admin, cron or PR #7 runtime change.
The new display path requires **both** `edition.mode === "mock"` and
`event.isMock`, a known title, local `/demo/` asset, valid dimensions, alt/credit/
license and safe HTTPS attribution links. There is no random stock selection or
network fetch during rendering. Unmapped scenarios use text-only presentation.

These photos have reusable licenses, but do **not** establish documentary
relevance to a Live Event. They never enter the separate production image path.
`lib/home/editorial-image.ts` and `LeadEventImage.tsx` are unchanged: Live imagery
requires reviewed source-relevant, rights-cleared metadata tied to an actual
Event source. An eventual editorial adapter must supply that metadata.

Mock/Live data separation, declared-interest cold start, source attribution,
source-count honesty, disabled People Like You, save/hide/undo/topic controls
and keyboard focus remain intact. No match percentages, orange UI accents,
producer credit, gradients, Pro banner or invented news analysis were added.

## Validation

- `pnpm typecheck`: passed.
- `pnpm test`: **43/43 passed**, six suites.
- `pnpm lint`: passed, no warnings/errors.
- `pnpm build`: passed; five existing Prisma/runtime filesystem-tracing warnings.
- `pnpm test:http`: **7/7 passed**, including Mock/Live reads and admin/cron/origin boundaries.
- Existing Chromium browser suite: **4/4 passed**, desktop 1440px / mobile 390px.
  Verified photos decode, visible demo captions, hierarchy, intro color/sizes,
  above-fold lead headline, no horizontal overflow, bottom navigation,
  save across reload, hide/undo, more/less with undo, keyboard disclosure,
  source-count honesty, no page errors and failed-photo text/control fallback.
- No browser or dependency was added. Dependency manifests/lockfile are unchanged.

## Screenshots

Captures show **synthetic demo content**, not Live intelligence. The headers in
these captures still show the temporary text lockup, not the official PNG.

- [Desktop 1440 × 1000](review/editorial-demo/home-1440.png)
- [Mobile 390 × 844](review/editorial-demo/home-390.png)
- [Desktop full feed](review/editorial-demo/home-1440-full.png)
- [Mobile full feed](review/editorial-demo/home-390-full.png)

## Remaining limitations

- **Original horizontal Event Capsule PNG is needed** to finish desktop/mobile
  header application and recapture the final branded screens. Favicon is deferred.
- Demo photos are illustrative; real news photos still need a source-specific
  rights review and adapter. There is no automated production acquisition path.
- Browser-only preferences, semantic personalization, consumer auth/cross-device
  sync and verified divergent-perspective extraction remain as before.
- Live-provider execution, PostgreSQL deployment, scheduler activation, Safari
  and physical-device QA remain unverified. PR #7/#5 integration remains pending.
- Original photo assets total about 7.8 MB; Next Image serves responsive local
  derivatives. Future asset compression must preserve attribution and be recorded.
- This branch/PR update is for review; it does not merge or deploy the service.
