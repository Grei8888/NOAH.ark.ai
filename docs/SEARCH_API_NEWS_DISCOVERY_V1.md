# NOAH ARK — Search API News Discovery v1

Status: **Draft feature**, review only. This implements actual SerpApi Google News provider code, and **will not query SerpApi, charge the account, or show fabricated news** until the owner supplies `SERPAPI_KEY` and explicitly enables `NOAH_NEWS_SEARCH_ENABLED=true` in a controlled environment.

## User request (2026-10-13)

- The footer currently says only **중소벤처기업부 공식 RSS**. This was accurate for government policy materials but will become misleading once news articles are integrated.
- Owner explicitly requested **search API instead of individual publishers' RSS** and a visible correct attribution for news titles/links; actual Google-indexed headlines from different outlets are needed for the beta. Codex is an optional implementation assistant, not a prerequisite.

## Implementation

- `lib/news/news-search-contract.ts`: four fixed search topics, publisher attribution, direct HTTPS-only publisher URL validation, feed item normalization, dedupe; accepts SerpApi's top-level `news_results` or grouped `highlight`/`stories`. Excludes Google News middle links, unknown publisher names, untrusted schemes, article body, image, description and AI ingestion.
- `lib/news/google-news-search.ts`: real `https://serpapi.com/search.json?engine=google_news` endpoint (locale `gl=kr, hl=ko`), title+publisher+original link+optional ISO date only, server-side secret API key, 9-second deadline, default OFF, four **fixed** search queries. Uses shared Next `unstable_cache` with 24h revalidate per topic and catch-to-honest-error; no fake fallback. Daily per topic under stable cache ≈ 4 × 30 = 120 upstream searches/month, but cache invalidation, deployments, concurrency and unusual traffic can increase it. **This estimate is not a monetary guardrail.** Check provider account caps and paid overages before activating.
- `GET /api/news/discovery?topic=economy|startup|finance|policy`: only valid enum parameters, no paid arbitrary user-provided queries and no SerpApi credentials exposed to clients; data responses are `no-store` at HTTP layer, server provider cache is shared.
- `NewsDiscoveryPanel`: browser UI with selectable 경제/창업/금융/정책, actual news headline, publisher label per article, optional publish date, click-through original site, and AI-reading deep link. Local title/source filter does **not** cause new API searches. Explicit disconnected and upstream error states.
- `PublicSourceDesk`: source **credit separation**. Articles: original per-publisher label and `SerpApi / Google News` as *discovery path*; government: original `중소벤처기업부 RSS` for actual policy/press materials. No blanket claim all articles originate in MSS RSS.
- `app/lab/reader/page.tsx` + `ReaderLab`: article deep link checks the URL against *actual cached provider results for the selected topic* before accepting article title and URL; avoids arbitrarily provided URL/headline claims. Publishers may block iframe: the external original opens via direct link rather than remote HTML mirroring. AI still only gets title+question, never article body.
- Source-specific attribution is displayed in the respective item and near the footer; separate service classes for public official vs journalist news.

## Security / copyright / product honesty

1. **Google News search results are not a content licence.** Direct title/original-link use is distinct from protected article body/photo extraction or feed syndication. Review SerpApi licence/terms, Google search data use/retention and publisher terms before opening access to ten testers. Don't overclaim ownership or scrape Google's pages directly.
2. No copied article text/images, no news text republishing; never send article bodies to OpenAI. The provider also returns thumbnails but NOAH explicitly discards these fields.
3. Search-provider outlet attribution reflects the indexing API's metadata, not independently verified publisher rights, factual accuracy, ideology or editorial perspective.
4. Existing MSS RSS, public source refresh, Google feedback, save/hide, personalization choices and exact production Vercel alias remain untouched by default.
5. `NOAH_NEWS_SEARCH_ENABLED` and `SERPAPI_KEY` must both be configured and the real official-source mode must be enabled. If absent, the UI says **연결 전** and makes zero paid API calls. Production enablement still needs product-owner review/consent.
6. No arbitrary q from users and no on-demand paid refresh; only 4 static queries with 24h cache. Even so, Vercel serverless caches are not a hard max. Set a low API project ceiling and/or account quota enforcement before opening 10-person preview.

## Owner preview configuration — separate from operating site

Vercel preview environment, scoped to the approved beta branch or dedicated preview project:
```env
NOAH_REAL_SOURCE_PREVIEW=true
NEWS_PROVIDER=government
AI_PROVIDER=off
NOAH_NEWS_SEARCH_ENABLED=true
SERPAPI_KEY=<owner's actual SerpApi key, never post here>
```

Existing AI reader invitation settings are separate. This code will serve **actual API results** only; until the owner provides a key, the page honestly displays disconnected search.

## Acceptance tests / blocked work

- [ ] Automated CI typecheck, Vitest normalization and access-guard tests, ESLint, Next build and existing HTTP regression.
- [ ] Actual SerpApi API key/credit setup by owner and privately stored. No paid search performed during development.
- [ ] Preview actual network validation for all four Korean queries, source attribution, canonical original links and search-result freshness.
- [ ] Desktop/mobile click tests, RSS/feedback regression, verified API usage increments not unexpectedly high.
- [ ] SerpApi terms/Google Search provider reuse and legal review before 10-person invitation.
- [ ] Owner authorizes preview deployment separately; **do not change existing production**, GitHub PR stays Draft.
