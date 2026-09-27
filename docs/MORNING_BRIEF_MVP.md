# NOAH Morning Brief MVP — Implementation Contract

Status: proposed / implementation in progress. No live mailing is enabled.

## Objective
Weekday 08:15 Asia/Seoul owner preview, 08:40 owner-approved finalization and manual KakaoTalk distribution near 08:55, owner-only production pilot followed by manual KakaoTalk sharing to five office staff. Target recurring operational budget <= KRW 100,000/month, excluding development labor and paid article licenses.

Preserve NOAH's event-first pipeline and existing scoring: importance 0.65, relevance 0.35, minimum 60, at most 10 Events, category cap 4. No quota filling. Public significance and personal relevance remain separate.

## Release gates
- Gate 0: existing Mock demo must not send emails.
- Gate 1: real provider(s) with attributable URL, publication time, fetched time, and provider ID; official primary-source confirmation for legal/policy assertions.
- Gate 2: event clustering and source-backed structured analysis; explicit uncertainty if unconfirmed.
- Gate 3: persistent daily Ark snapshot and idempotency key (date + recipient + edition).
- Gate 4: owner-only preview, manual review before sharing, generation-failure notification; no automated KakaoTalk delivery in MVP.
- Gate 5: owner manually shares approved report with five office staff via KakaoTalk; optional per-recipient relevance after quality review.

## Architecture
Collect (replaceable RSS/official sources) -> normalize -> dedupe -> event cluster -> analyze -> score -> daily Ark -> persist -> render HTML and PDF -> save to Drive -> owner notification and KakaoTalk-ready text -> publication log.

Separate collection (once daily) from personalization (per recipient). Never independently fetch five copies of the same articles. For personal relevance use explicit user preferences, never infer private traits. Produce short KakaoTalk-ready summary text (3 key events) and a PDF. Save both and a source manifest in Drive. Confirm Drive sharing permissions before distributing any links.

## Scheduling
Owner routine: leaves home 08:00–08:10, commutes by subway, arrives at office around 08:55. Proposed weekdays: collect from 06:00, refresh by 08:00, produce owner mobile preview by 08:15, owner reviews on commute around 08:15–08:35, finalize at 08:40 ONLY if approved, and owner manually shares on KakaoTalk around 08:55–09:00. If not approved, remain draft and do not auto-distribute. These are planning targets; publication-time coverage should be measured in pilot. Run ingestion earlier, allowing time for retry and verification. If insufficient verified events, send a truthful 'no confirmed major changes' edition rather than fabricated or Mock events. Use a scheduler with timezone explicitly configured; avoid double sending on retry.

## Integration and credentials
Google Drive folder and Gmail sender are selected by Grei. Use OAuth/service identity with least privilege, no credentials in repository. API keys and recipient addresses belong in deployment secrets. No automated staff delivery in MVP. Owner reviews and manually shares; automated mailing is deferred until explicitly approved. Google plugin can be used by ADDY interactively but does not itself provide unattended runtime.

## First acceptance test
1. Live input includes real links and timestamps.
2. Same Event from multiple articles appears once.
3. Mock items never appear in a production edition.
4. A duplicate scheduler run does not duplicate the daily publication or owner notification.
5. KakaoTalk-ready summary, PDF and Drive archive show the same edition.
6. Unverified official-policy claims are clearly flagged.
7. No staff distribution occurs automatically; future opt-in preferences and opt-out must be respected.
8. Daily API/model costs and delivery failures are logged.

## Deferred
Breaking alerts, NotebookLM automatic ingestion, PLAUD integration, automatic KakaoTalk or email delivery, full self-service account UI, paid subscriptions. These are separate workstreams and must not delay the mailing MVP.

## Implementation checkpoint — live discovery (not publication)
- Added isolated `GET /api/discovery` using three Google News RSS search feeds; timestamps, Google News URLs, source names and fetch errors are returned.
- Added mobile `/discovery` page for reviewing unverified article candidates. Existing `/review` remains clearly labeled Mock demo.
- No event clustering, official-source verification, PDF creation, Drive upload, unattended scheduler or KakaoTalk delivery is active.
- Google News RSS is a discovery source, not official confirmation; article-level deduplication by URL is preliminary.
- Requires build and runtime network validation before merging and before production deployment.
