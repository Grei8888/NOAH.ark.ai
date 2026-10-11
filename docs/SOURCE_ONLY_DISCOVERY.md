# Source-only discovery — Free beta pre-release

**Release status: implementation in review, feature OFF by default.** Base: approved A / Intelligence Desk layout.

## Purpose

An explicitly labeled `/sources` exploration page can show minimal attributable metadata from genuine collected articles **without** fabricating AI Event analysis. It is **NOT** a NOAH Brief, personalized feed, ranked Event list or license grant. Actual display only after source-specific rights review.

## Guardrails

- Live mode only (`NEWS_PROVIDER=government` or `rss`, `AI_PROVIDER=off`); `NEWS_PROVIDER=mock` is still restricted to `AI_PROVIDER=mock`.
- Collect pipeline is allowed; `full`, `process`, `generate-ark` and `breaking` reject before any DB operations while AI is off. This prevents publishing unevaluated Events or mock-like analysis.
- `SOURCE_LINKS_ENABLED` must be **explicitly** `true` to render live source links. It stays unset/false until feed rights and link tests are approved.
- `/sources` reads at most 40 deduplicated original **HTTPS** links from the last 14 days (source name, title, publication time, original link). No body, snippets, images, analysis, relevance score, or user information.
- Existing Home and mobile five-tab layout remain unchanged. Home in live mode links to the separate exploration page. Demo mock content never appears in the original-source view.
- Official-origin metadata from the RSS parser is not a statement that a policy is legally effective or that material can be reused.
- If the live RSS is empty, display an honest empty state. Do not use fabricated source items.

## Required steps before activating

1. Review official URLs and per-article copyright/KOGL conditions in [LIVE_SOURCE_AUDIT.md](LIVE_SOURCE_AUDIT.md).
2. Run independent unit/HTTP tests and `node --import tsx scripts/rss-smoke.ts` (read-only network) from CI. A `text/xml` fetch without parsed items does not count as success.
3. Run `pnpm pipeline collect` **only in an isolated test database** configured for live RSS with no credentials in source control. Validate timestamp filtering, source attribution, canonical URL, and no publication or AI charges.
4. After approval, set `NEWS_PROVIDER=government`, `AI_PROVIDER=off`, `RSS_FEEDS` to verified URLs, `OFFICIAL_RSS_FEEDS` to separately validated official feed URLs, `SOURCE_LINKS_ENABLED=true` only in server-side Vercel environment. Do not enable daily/breaking cron in source-only mode.
5. Configure a separate reviewed periodic `collect` runner within free limits; Vercel web reads only. Review code and infra before deploying any URL.
6. Never publish NOAH Brief/Event analysis without supported LLM evidence and a separately approved API budget or rights-compliant alternative.

## Next

Check actual RSS feeds in network smoke run; test links and article-specific rights; review impact of manual (non-AI) source browsing on eventual event-first positioning. Paid OpenAI keys **not** required for this feature, but source collection is **not** automated and no public website is deployed.
