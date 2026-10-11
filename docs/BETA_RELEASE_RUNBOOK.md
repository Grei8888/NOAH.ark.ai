# NOAH ARK — Free Public Beta v0.1 Release Runbook

**Status: preparation only / not deployed.** Owner decision: keep **Option A — Intelligence Desk**, official Event Capsule logo, current responsive Home. Do not create alternative layout demos.

## Source and branch boundaries

- Repo: `Grei8888/NOAH.ark.ai`
- `main` is currently an **older design baseline**. Do not import and deploy it by mistake.
- PR #5 contains Brand v3/product docs; PR #7 contains recovered Event pipeline; PR #8 contains the PR #7 runtime, the three shared PR #5 core docs (same blobs), and the full personalized Home with logo. The fourth PR #5 document is an old magazine editorial proposal and is not required for the owner-approved Option A.
- This readiness branch `chatgpt/noah-free-beta-readiness` starts from PR #8 head `2df2c2e997b23d13adafb400139cf1f176182260`. This branch is **not** a production branch. Keep PR #5/#7/#8 draft until reviewed and owner explicitly authorizes merge.
- Read `AGENTS.md`, `docs/PRODUCT_PRINCIPLES.md`, `docs/ARCHITECTURE.md`, and `docs/COLLABORATION_RULES.md` before development.

## Confirmed resources (2026-10-12)

- Vercel Hobby account: `grei3888@gmail.com` / `grei3888-8612`, GitHub namespace `Grei8888` visible. Vercel ChatGPT project/repo-management API returned **403 scope authorization** for this account; Vercel project is **not yet created**, and no deployment was launched.
- Neon Free: organization `Grei`, project `noah-ark-beta` (`polished-dew-88136892`), Singapore, Postgres 17, default database `noah_beta`. Confirmed empty database at audit; **no migrations** have run. Treat all DB URL/password values as secrets; never commit or print them.
- Vercel Hobby use must remain a genuinely personal **noncommercial** beta, subject to provider terms. No ads or payment, and review hosting upgrade or compliant alternative before commercial launch.
- A free hosting plan does **not** imply free AI inference. Current live runtime refuses `AI_PROVIDER=mock` with `NEWS_PROVIDER=rss`; OpenAI usage requires a separate key, budget limit and explicit owner approval.

## Build/test baseline

```bash
pnpm install --frozen-lockfile
pnpm setup:mock
pnpm typecheck
pnpm test
pnpm lint
pnpm build
pnpm test:http
```

The GitHub Actions `beta-readiness.yml` workflow performs these checks on **synthetic isolated SQLite data only**. It has no deployment or migration steps, does not access production secrets, and never calls paid providers. Browser QA at 1440x1000 and 390x844 and physical iPhone Safari remain separate acceptance gates.

## Release checklist (all required before publishing a URL)

- [ ] Product owner reviews and approves the PR integration order, final release candidate and rollout.
- [ ] Vercel account scope/GitHub link is available from correct `grei3888@gmail.com` account and `NOAH.ark.ai` repo.
- [ ] Vercel project created **without deploying outdated `main`**; configure preview branch and production branch deliberately.
- [ ] Neon schema reviewed, applied only to dedicated beta Postgres DB, and migration recorded. Prefer using committed migration files, not ad-hoc schema push against live.
- [ ] Runtime env vars configured only server-side (e.g. `DB_MODE=postgres`, `DATABASE_URL`, `NEWS_PROVIDER=rss` or permitted `government`, `RSS_FEEDS`, `OFFICIAL_RSS_FEEDS` when verified, `AI_PROVIDER=openai` only with explicit authorized key and spending cap). Generate strong, distinct `CRON_SECRET` and `ADMIN_SECRET` if protected routes are enabled. Never send keys in chat, issues or repo files.
- [ ] At least one publisher/official feed whose **collection, display and AI-use conditions** fit the beta has been verified; collect minimal permitted title, original URL, publication time and attribution. News search discoverability or feed access alone does not confer full republication rights.
- [ ] Real data collected into **live-only** DB; `collect → normalize → dedupe → cluster → analyze → rank → publish → Home/Event` verified end-to-end. No mock fallback or stock/demo images for live items.
- [ ] `원문 기사` links open **real publisher URLs** in a new tab (already supported by current Event detail). `NOAH Brief` is clearly separate, source-attributed, and only available when honestly generated with authorized evidence and funded AI; otherwise show an explicit unavailable state, not synthetic summaries.
- [ ] Scheduled import is **not** implemented as an unbounded Vercel Hobby HTTP function. Current `/api/cron/[type]` declares `maxDuration=300`, which may exceed the plan's permitted timeout. Prefer a reviewed GitHub Actions/manual runner where appropriate, verify free-tier quotas and ensure failures do not overwrite the last good edition.
- [ ] Verify authentication/origin boundaries, accidental public admin access, source URL validation, secrets, rate limits, Vercel usage and DB connection pooling.
- [ ] Desktop 1440px and mobile 390px screens verified, five mobile nav links tested, no horizontal overflow; review Safari/iPhone behavior.
- [ ] Publish `*.vercel.app` only after live/source-rights/security checks; verify real HTTPS URL responds from an unauthenticated browser. Record rollback path, incident contact, data freshness and beta notice.

## Deferred for later

- Paid subscriptions, advertisements and commercial monetization.
- Native iOS/Android app, personal login and cross-device state.
- Full publisher-article republication; automatic use of unlicensed editorial photography.
- Invented viewpoint classifications, fake match percentages or synthetic live content.

## Deployment stop conditions

Stop instead of deploying if source rights cannot be verified, no authorized live analysis provider exists, DB migration fails, infrastructure reports chargeable resource requirements, credentials are exposed, or the Owner has not approved the release. A truthful beta with no briefing yet is preferable to presenting fake news or fabricated AI intelligence.
