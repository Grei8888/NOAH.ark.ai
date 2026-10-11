# Personalized Home v1 — Issue #6 review implementation

## Implemented

- Brand v3 white/navy/cool-gray tokens, restrained gold details, Korean sans hierarchy.
- Desktop left navigation, Event reading column, data-derived My Signals / Watching rail.
- Mobile single reading column, compact header, five-item bottom navigation.
- FOR YOU uses **explicitly declared topic matching**, capped at five matching Events.
- MUST KNOW uses separate public significance ordering; no forced quota or duplication of For You.
- Cold-start and opt-out show public significant Events and an interest-selection entry.
- Editable interests (up to five), local save/unsave, hide/undo, more/less topic feedback, restore/reset.
- Discover search/category filtering and Startup Radar candidates. No implied deadline/eligibility.
- Recommendation explanation and direct Event detail / source-comparison anchors.
- Event detail separates reported facts, interpretation, coverage, unresolved questions, sources and follow-up.
- Loading skeletons, empty states and failed-data UI; no synthetic fallback in live mode.

## Architecture impact

No additional database schema, auth model or provider interface change in this Home layer.
Mode-separated `noah-home-v1:mock|live` storage contains only declared topic IDs, enabled
flag and saved/hidden Event IDs. A local preference update cannot modify shared analysis.
Home uses public immutable Edition snapshots. Declared-topic matching is a transparent
cold-start filter, **not** semantic AI relevance, a match percentage or cohort inference.
Shared Importance and legacy personal 65/35 arithmetic remain distinct.

## Verification

- Typecheck: pass.
- Unit/integration: **35/35**, four suites (including profile separation, opt-out, weak-match no-fill, hide, radar source gate, malformed local storage).
- Lint: pass, no warnings/errors.
- Optimized Next build: pass. Four generated-Prisma tracing warnings remain.
- Actual Mock setup/pipeline: 32 input documents → 2 duplicates → 10 Events → 8 published items.
- Production-server HTTP suite: **7/7 passed** (mock Home/detail/destinations, admin/origin/cron boundaries and live-mode read isolation). APIRequestContext only, no browser installed.
- The HTTP suite starts test servers in one process tree because individual execution sessions isolate loopback networking.
- Next's streaming not-found response can return HTTP 200 with not-found UI/noindex. This is documented framework behavior; no unpublished data is exposed.

## Known limitations and review gates

1. **Desktop and ~390px screenshots / browser layout checks are pending.** Supported `$control-browser` is absent. Sites SKILL.md requires: “If `$control-browser` is unavailable, skip browser QA: do not start a preview server, install a browser, or improvise another browser-control path.” HTTP test servers are only for request/response validation. No visual acceptance claim is made for above-fold placement, Korean font rendering or tap interactions.
2. Consumer authentication, cross-device preferences/history and server-side per-user scoring remain unimplemented; the screen explicitly identifies browser-only state. Saved view shows saved items in the current edition; earlier saved IDs remain stored but historical library UI is deferred.
3. No verified divergent perspective extraction exists. The affordance shows **source count**, and detail explicitly says source count is not perspective count. Excerpts are attributed; no ideological labels or fabricated disagreement.
4. Approved logo artwork has no production vector master in the repository. A temporary typographic lockup is used; no invented logo master replaces the approved reference.
5. Live-provider API calls, PostgreSQL deployment/migrations and paid AI execution were not performed. Live-mode HTTP tests verify read isolation using the same synthetic local test DB, not a successful live pipeline.
6. People Like You is absent. No peer statistics, fake match scores, unrelated imagery, producer credit, old orange theme, signup simulation or Pro ad.
7. Analytics collection is deferred until privacy/retention are defined; no tracking endpoint is invented.

Runtime branch: `codex/product-runtime-integration`. Home branch: `codex/personalized-home-v1`.
Review and integrate runtime before Home. PR #5 remains a draft documentation dependency;
this request authorizes implementation for review, not merging documentation or code.
