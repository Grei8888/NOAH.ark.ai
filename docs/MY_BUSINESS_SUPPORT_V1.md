# NOAH ARK — My Business Public Support Data v1

**2026-10-13 — owner approved.** Add real eligible *candidates* from official public support-program data below personalized news briefing, before secondary news Discover.

## Evidence / source
Official original: https://www.bizinfo.go.kr/apiDetail.do?id=bizinfoApi
- `GET https://www.bizinfo.go.kr/uss/rss/bizinfoApi.do`
- `crtfcKey` REQUIRED; separate **Bizinfo-issued** key, not automatically interchangeable with data.go.kr service key.
- Request `dataType=json&searchCnt=80&pageUnit=80&pageIndex=1`.
- Documented metadata: `title/link/seq/author/excInsttNm/lcategory/pubDate/reqstDt/trgetNm`, aliases `pblancNm/pblancUrl/pblancId/jrsdInsttNm/pldirSportRealmLclasCodeNm/creatPnttm/reqstBeginEndDe`.
- Reuse raw original title, official HTTPS Bizinfo notice URL, source agency, target text and application period. No announcement body, PDF, thumbnail, image, or document mirroring.
- Data portal alternative https://www.data.go.kr/data/15157820/openapi.do may need a **different** service key. API is free but data is listed as KOGL type 3 (attribution/no modification); do not treat analytical matching as permission to redistribute transformed original text or rights to original attachments.

## Architecture
- `lib/business/support-contract.ts`: shared pure strict contract + source URL validator, date parser and conservative rule-based profile signal matching.
- `lib/business/bizinfo-provider.ts`: server-only, fixed query, HTTPS official provider, 6-hour `unstable_cache` cache; `NOAH_BUSINESS_SUPPORT_ENABLED=true` + `BIZINFO_API_KEY` + active actual official-source mode required. Missing key = no request, never synthetic fallback. Do not log HTTP URL containing the key.
- `GET /api/business/support`: returns only safely normalized limited metadata or actionable provider error; client user profile never sent to this route.
- `components/home/BusinessSupportPanel.tsx`: 4 selections: region (전국 or 17 regions), interest category, stage, business form. Stores only in user's browser; no business identifier, email, company name or tax ID; no personal data to external API.
- Displays at most 5 candidate announcements initially, up to 12 on user request, official provider provenance, source link, received category, original target text, application deadline and rationale.
- Keeps My Focus + Personal News Briefing → **My Business** → secondary Discover → independent government MSS RSS; only Home and Startup opt in to Business Support section.
- Does not modify current production, database schema, SerpApi settings, paid model calls or external feedback pipeline.

## Safety / uncertainty model
**DO NOT claim verified eligibility.** Metadata alone is often incomplete. Region/sector matching uses explicitly named text in title/agency/target, never broad hashtags alone. Stage/form text can be ambiguous; they cause verification warnings rather than authoritative approvals. Only expired date ranges are excluded when dates parse clearly; unknown deadlines remain but are labeled "원문 확인 필요". No artificial opportunities.
Publication metadata, if missing, does not imply newest. User must read original for full eligibility, exclusions, deadlines and documentation.
The "related likely" status means match evidence is present, not that all the conditions hold. Ambiguous notices stay "needs checking".
Caching controls normal traffic but is not a strict monthly quota; check provider terms and rate limits before opening 10-user beta.

## Activation (owner task)
1. Apply for Bizinfo API key at official URL; Bizinfo form asks for operator/application info. Do not paste key in chat/PR.
2. On **dedicated beta Preview only** set `BIZINFO_API_KEY` and `NOAH_BUSINESS_SUPPORT_ENABLED=true`. This must be scoped to the exact deployment branch when configured. Keep production env unchanged.
3. Deploy a preview, open `/api/business/support` to validate actual provider JSON form; if provider's real body differs from documented fields, adjust parser and tests. Then check a few actual Bizinfo original links/date-target metadata.
4. Manually exercise desktop/mobile profile select, refresh, actual news and Google feedback regressions; then invite beta participants.
5. Verify KOGL attribution/no-modification compliance and the API's reuse terms before public beta, never infer permission for stored attachments.

## Limitations
- **No real key/API exchange yet**. CI tests use documented example shapes only, no real provider traffic.
- Data-provider output may change, parser supports documented flat RSS-JSON envelopes; fail honestly instead of fabricating cards if an incompatible response.
- No AI semantic eligibility reasoning. Business classification uses evidence-labeled deterministic hints only; final human review required.
