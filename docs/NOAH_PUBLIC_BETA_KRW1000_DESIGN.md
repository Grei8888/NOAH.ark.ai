# NOAH ARK: public-link beta with shared daily AI budget

Status: **design / implementation gate only; DO NOT enable public paid AI yet.**

## Product decision
- Remove ten-person / ten-hash-list restriction from **invitation-based admission**, not from abuse protections.
- A single **revocable shared secret link** authorizes entry for anyone holding the link; do not publish the secret or use unauthenticated open access by default.
- The new limit is **KRW 1,000 per Asia/Seoul calendar day for ALL beta users COMBINED**, not per user, per code, or per Vercel instance.
- When exhausted or counter storage is unavailable, reject new paid requests with a clear reset notice; still show cached briefs, external source links, and free official policies.
- Operator may revoke/rotate the shared link. Do not include credentials in source control.

## Existing code gaps (verified 2026-10-15)
1. `app/api/lab/reader/route.ts`: Map/Set are per-instance; 6/hour and 20/day per token are **not global money limits**.
2. `lib/news/reader-lab-access.ts`: allowlist limited to 10 SHA-256 digests; production hard-off.
3. `lib/news/reading-companion-service.ts`: paid Responses API request uses configurable model and 550 max output tokens; no cost guard, no usage settlement.
4. Existing beta Vercel variables do not include DATABASE_URL; a separate Neon database/branch must be connected by a **branch-scoped secret**, never shared with public Production.
5. SerpApi/Google News uses its own quota and billing. AI-only budget does **not** cap all vendor charges.

## Implementation requirements
1. Preview-only opt-in `NOAH_PUBLIC_LINK_BETA_ENABLED=true` and `NOAH_SHARED_INVITE_SHA256=<64 hex>`; use existing #join URL fragment capture, server-side SHA-256 constant-time comparison, no cookies or weak anonymous bypass.
2. Create a separate Neon Preview DB branch. No production migrations. Keep the hard-off for Vercel production and `main`.
3. Add a dedicated durable budget ledger keyed by Seoul-local date, with a **transactional, atomic reservation before ANY paid AI request**. Store reserved KRW and consumed/settled KRW, request ID, expiration, cached answer key, execution state. Use uniqueness for idempotency. Never rely on per-instance Maps.
4. Use a **fixed audited model** (e.g. gpt-4.1-mini, subject to up-to-date vendor pricing check), capped input/output tokens. Use conservative per-call maximum cost including provider charges and safety margin, estimate at fixed conservative USD/KRW rate. Stop **before** provider call when reservation would exceed 1,000 KRW. Guarantee only this application's approved API calls against its own ledger; other OpenAI projects, provider repricing, foreign exchange, retries, externally triggered usage, hosting/SerpApi can still cost money.
5. Charge/reserve request even across timeouts, uncertain provider outcomes, or server crashes until reconciled. **Never automatically refund an unknown outcome**. Release surplus only from confirmed response usage with reliable price version; budget rollovers at midnight Asia/Seoul, no indefinite backlog.
6. Hash a normalized `headline+mode+question+model+prompt-version` to produce a privacy-conscious key, cache answers in shared database with explicit TTL (e.g. 24h), and deduplicate simultaneous identical requests atomically. Verify authorization *before* returning cached answers; cache stores generated explanation, not full newspaper text or invitation token.
7. Guard every paid route, including new related-article issue briefing. Avoid caching personalized or sensitive question content without explicit retention disclosure; instead consider only predefined mode/headline prompts if necessary. News search provider spending needs a separate budget/quota if enabled.
8. Set sane traffic-abuse defenses: per-IP throttling (privacy-preserving short TTL), burst protection, global concurrency limit in database, allowed-origin checks, JSON size constraints, rate-limit and reset messages. The shared link may be forwarded beyond intended group; recommend rotation.
9. Cache-hit and budget-left indicators in UI: “AI 답변은 하루 공동 예산 1,000원 범위에서 제공 · 소진 시 다음 날 다시 이용 가능” and “지난 답변 보기(캐시)” where relevant. No misleading live-cost precision.
10. Add tests: shared counter across distinct invite holders, multi-instance race > budget, cross-midnight KST, stalled requests, retries/idempotency, shared cache hit without spend, unknown provider usage not refunded, malformed database/env fails closed, production disables paid AI, no raw invite secret in logs/client bundles.
11. Separate Preview PR / test branch. Require `pnpm typecheck`, `pnpm test`, `pnpm lint`, `pnpm build`, `pnpm test:http`, plus multi-worker concurrency smoke test. Do **not** merge before a real Preview auth + budget ledger smoke test and explicit release approval.

## Acceptance criteria
- Shared-link testers have **no numeric seat limit**; previously issued *individual* invitation codes may be deprecated after rotation.
- Global paid AI admission conservatively stays <= 1,000 KRW/day according to verified price assumptions. If cost/FX assumptions are unknown, paid requests are disabled.
- Spending stops on cache/budget database failure; never falls back to unmetered requests.
- Existing production untouched. Preview database credentials never reach the client.
- UI wording makes clear the 1,000 KRW is an internal service guard, **not a hard cap on the OpenAI invoice**.
