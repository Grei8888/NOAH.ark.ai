# Magazine Editorial Pass — PR #8

This records the original typography-only pass. The subsequent
[photo demo update](EDITORIAL_DEMO_IMPLEMENTATION.md) supersedes its Home title
sizes, default Mock imagery and validation counts; the Live image gate is unchanged.

Continues `codex/personalized-home-v1` using PR #5's Brand v3, Home UX v1,
Magazine Editorial Pass v1 and the [ChatGPT review](https://github.com/Grei8888/NOAH.ark.ai/pull/8#issuecomment-6109495777).

## What changed

The existing `EventFeedItem` now supports lead, medium and compact treatments.
Only FOR YOU uses the cover rhythm: 01 lead, 02–03 medium, 04–05 compact.
Other feeds use compact rows. The same save/hide/topic callbacks and source links
serve every variant; selection and recommendation rules are unchanged.

## Visual hierarchy changes

- Home title: 38px desktop, 30px mobile (28px below 360px).
- Lead headline: 38px desktop, 32px narrower desktop, 26px mobile.
- Medium headline: 22px desktop / 20px mobile; compact: 20px / 18px.
- Summary: 14px desktop / 13px mobile; compact rows show one line.
- Lead recommendation reason remains visible, with the existing transparent explanation disclosure.
- Open, ruled lead layout; restrained gold rank rule; 40px desktop / 32px mobile section spacing.
- My Signals and Watching use open backgrounds, rules and aligned tabular numbers.
- Korean remains sans; serif remains limited to rank numbers and the existing English footer mark.
- Headline focus exposes the full title and preserves the visible keyboard outline.

## Files changed

- `components/home/EventFeedItem.tsx`, `PersonalizedHome.tsx`, `app/globals.css`.
- `components/home/LeadEventImage.tsx`, `lib/home/editorial-image.ts`: optional image presentation contract.
- `tests/editorial-image.test.ts`: rejects uncleared, unrelated, misattributed, mock and unsafe images.
- `playwright.editorial.config.ts`, `tests/browser/editorial.spec.ts`: repeatable checks using an existing Chromium executable.
- This report, refreshed Home verification notes, and `docs/review/editorial-pass/*.png`.

## Architecture and imagery

No domain DTO, API, provider, scoring, database, auth, admin or cron changes.
Image metadata is a presentation-only optional prop: Event/source identity,
source relevance, alternative text, credit, cleared rights, license and rights reference.
Display requires a source already present in the live Event and HTTPS URLs without
embedded credentials. A failed image load removes the slot. Rights metadata must
come from a reviewed editorial/rights adapter; a URL or official-source flag alone
does not certify legal reuse. No adapter or image data is fabricated in this pass.
Today's feed therefore uses the deliberate text-only fallback. Mock Events cannot
display documentary imagery through this slot.

## Tests/build result

- `pnpm typecheck`: passed.
- `pnpm test`: 39/39 passed, five suites.
- `pnpm lint`: passed.
- `pnpm build`: passed; five Prisma/runtime dynamic-filesystem tracing warnings remain.
- `pnpm test:http`: 7/7 passed, including mock/live isolation and admin/origin/cron denial.
- `pnpm exec playwright test --config=playwright.editorial.config.ts`: 3/3 passed.
- Local mock setup publishes eight Events. Repeating installation/setup inserts no
  new articles, creates no Events, makes no AI requests and leaves the publication intact.

Browser checks use the existing `/usr/bin/chromium`; no browser was installed.
They exercise profile selection, cold start, opt-out, lead/medium/compact counts,
actual 38px/26px lead typography, above-fold headline placement, no horizontal
overflow, five mobile nav destinations, save across reload, hide/undo, more/less
topic with undo, keyboard disclosure, source-count honesty and absence of page errors.

## Screenshots

Screenshots show explicitly labeled synthetic demo Events, not live intelligence.

- [1440 × 1000 desktop viewport](review/editorial-pass/home-1440.png)
- [390 × 844 mobile viewport](review/editorial-pass/home-390.png)
- [Desktop full feed](review/editorial-pass/home-1440-full.png)
- [Mobile full feed](review/editorial-pass/home-390-full.png)

## Remaining limitations

- Legal image acquisition/rights review is not implemented; no images are shown by default.
- Browser-only preferences, consumer auth/cross-device sync and semantic personalization remain as before.
- Source counts remain coverage counts; verified divergent-perspective extraction is still absent.
- People Like You remains disabled and approved Event Capsule vector artwork remains pending.
- Live API execution, PostgreSQL deployment and scheduler activation are unverified.
- Chromium desktop/mobile viewport checks do not establish Safari or real-device behavior.
- PR #7 runtime and PR #5 design-document review remain integration dependencies.
  This pass is for review; it does not merge or deploy.
