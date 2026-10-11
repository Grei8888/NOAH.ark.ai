# NOAH ARK — monthly operating cost ceiling v0.1

Owner's hard requirement: **TOTAL monthly cost < KRW 50,000**, including hosting, data sources, AI and related infrastructure. Until spending controls and monitoring are verified, **disable the paid feature** instead of risking cost overruns.

## Current actual deployment / committed spending

| Component | Actual enabled | Expected incremental metered spend | Constraints |
|---|---|---|---|
| Vercel personal Hobby | Yes | 0 KRW while remaining within free quota | Personal/noncommercial only; quotas may suspend service, do not automatically upgrade |
| Government RSS reading | Yes, two MSS feeds and server-side 30-minute cache | 0 API licensing fee based on current open feed | Source rights and site access terms still apply |
| User filters | Yes, browser-local title keywords | 0 AI tokens, 0 new HTTP requests per toggle | Only currently retrieved sources |
| Local Save/Hide and beta checklist | Yes | 0 database costs | Browser-only, no sync |
| Neon Free project | Exists, **unused** by current public source-only reader | Free plan subject to quota | Never enable paid compute/storage without review |
| OpenAI API | **Disabled** (`AI_PROVIDER=off`) | 0 | Owner's ~KRW100 single experiment allowance is NOT a recurring spending authorization |
| Paid publisher/licensed news provider | Not enabled | 0 | No subscriptions/feeds may be bought implicitly |

Current zero incremental cost is conditional on free-plan quota/terms and excludes network/device costs borne by visitors. This is a **configuration and usage expectation**, not proof from billing invoices. Check provider dashboards regularly.

## Future budget allocation (planning envelope, NOT permission to start spend)

| Pool | Target monthly reservation |
|---|---:|
| Optional centrally computed AI event summaries | KRW 25,000 |
| Hosting/database/new lawful feed sources | KRW 10,000 |
| Contingency for exchange rates, VAT and unexpected usage | KRW 14,000 |
| **Maximum internal planned envelope** | **KRW 49,000** |

If even one required subscription exceeds its reservation, block the rollout; do not silently reallocate beyond KRW 49,000. Keep API disabled until real pricing, exchange-rate/VAT margin, model and monthly projected event volumes are reviewed.

## Mandatory controls before first centrally billed AI call

1. Separate API project for NOAH; use a dedicated restricted server-side API key (never in `NEXT_PUBLIC_*`, public scripts, logs or git).
2. Set enforced provider **hard** spend limits where available and confirm hard/soft mode. Do not rely solely on monthly project *notifications*. OpenAI documents both notification thresholds and configurable hard limits; hard enforcement might not be instantaneous. Provider docs:
   - https://help.openai.com/en/articles/6614457-troubleshooting-api-usage-and-spend-limits
   - https://help.openai.com/en/articles/9186755-managing-projects-in-the-api-platform
3. Implement project-owned request gate **before API call**: per-month KRW or USD maximum including FX/VAT reserve, cost estimate, max input/output tokens, maximum requests, rate limiting, and atomic reservation/concurrency. Fail closed on missing billing data, concurrency uncertainty or unexpected errors.
4. Run at most **one shared analysis per canonical event**, cache by event/version and reuse among beta testers. No AI reruns when a user changes their interests; personal filtering should be local over precomputed lawful metadata.
5. Add daily + monthly owner-visible cost reports/alerts and manual kill-switch. A feature must be disabled as budget nears the configured threshold rather than continue processing uncertain costs.
6. When provider usage controls reach a hard limit, allow the application to degrade gracefully to link-only service without repeated retries. Log costs carefully without storing third-party article body content.

## Access and scale

Distribution is primarily to trusted contacts using `/beta`. This is **not** enforced access control; anyone can visit the existing publicly accessible URL. If traffic rises, conserve server usage through edge caching and fixed feed query refresh; never run an LLM on every page view or per-user preference change.

Before any commercial launch, review Vercel's personal/noncommercial Hobby restrictions:
https://vercel.com/legal/terms

**Key idea:** AI is eventually used once per issue/event *before* display and only with lawful source inputs. Everyone browsing uses cached results. BYOK (bring your own key), investment or upgraded hosting are separate future decisions requiring safe key storage, billing/UI privacy and legal review.
