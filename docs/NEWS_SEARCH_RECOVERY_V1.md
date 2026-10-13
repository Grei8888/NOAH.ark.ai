# NOAH Search API failed beta — investigation & repair

Date: 2026-10-13. Owner screen showed `SEARCH API` present but no publisher articles: `뉴스 검색 결과를 불러오지 못했습니다`. The lower `0 LINKS` is a separate **government topic-filter zero-match** state, NOT proof that ministry RSS returned zero articles.

## Verified
- `NOAH_NEWS_SEARCH_ENABLED` and `SERPAPI_KEY` present on beta10 Preview (sensitive values not disclosed).
- Vercel Preview branch-scoped env values inspected (not guessed): `NEWS_PROVIDER=government`, `AI_PROVIDER=off`, `NOAH_REAL_SOURCE_PREVIEW=true`.
- `noah-ark-beta10` preview deployment was READY, but that confirms BUILD success **not HTTP API success**.
- Vercel runtime log read denied 403 by observability permissions. Original code masked **all** HTTP/auth/quota/timeout exceptions as identical generic 503, preventing diagnosis.
- SerpApi official API status notes recent Google News service degradation on 2026-10-07 to 10-12. This is a potential cause, **not** proof of the current request's failure.

## Changes
1. Classify safe SerpApi failures as `invalid_key`, `quota`, `upstream_rejected`, `provider_unavailable`, `timeout`, `unexpected_response`, `no_results`. Never return API key, actual provider error content, input URL or internal stack.
2. Increase provider timeout 9 -> 18 seconds and browser timeout 15 -> 25 seconds. No extra automatic retry or duplicate paid query. A 90-second per-server failure cooldown reduces request storms (not a distributed spend limit).
3. News UI shows exact safe reason (key rejection, account usage exhausted, slow provider, empty article result). Still offers genuine outbound Google News search rather than fabricated story cards.
4. Government-policy UI: distinguish `전체 19건 중 필터 일치 0건` from upstream zero and offer one-click interest/keyword reset. Do not reset hidden/saved state.
5. Pure unit tests for provider error classification and existing RSS/search/auth/feedback regression.
6. No paid AI activated or production environment modified.

## Before beta approval
- GitHub CI all green on exact commit.
- New **preview** deployment with existing owner SerpApi env settings; real user checks news and error reason.
- If invalid_key: owner recheck SerpApi dashboard key, Vercel Preview variable and redeploy.
- If quota: owner inspect SerpApi remaining credits; do not upgrade without owner approval.
- If timeout/provider_unavailable: check SerpApi status and wait/retry after cooldown. Consider switching to Google News Light only after explicit budget/quality check (no automatic costly fallback).
- If no_results: verify actual provider response parsing / source field and direct originals, not synthetic results.
- Site must display real clickable publisher headlines, not error banner, before inviting 10 testers.
