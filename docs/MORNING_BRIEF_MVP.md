# NOAH Morning Brief MVP — Implementation Contract

Status: proposed / implementation in progress. No live mailing is enabled.

## Objective
Weekday 07:00 Asia/Seoul briefing, owner-only pilot followed by five opt-in office recipients. Target recurring operational budget <= KRW 100,000/month, excluding development labor and paid article licenses.

Preserve NOAH's event-first pipeline and existing scoring: importance 0.65, relevance 0.35, minimum 60, at most 10 Events, category cap 4. No quota filling. Public significance and personal relevance remain separate.

## Release gates
- Gate 0: existing Mock demo must not send emails.
- Gate 1: real provider(s) with attributable URL, publication time, fetched time, and provider ID; official primary-source confirmation for legal/policy assertions.
- Gate 2: event clustering and source-backed structured analysis; explicit uncertainty if unconfirmed.
- Gate 3: persistent daily Ark snapshot and idempotency key (date + recipient + edition).
- Gate 4: owner-only preview, manually approved first production send, failure notification, unsubscribe/opt-out.
- Gate 5: opt-in five-person rollout and per-recipient relevance after quality review.

## Architecture
Collect (replaceable RSS/official sources) -> normalize -> dedupe -> event cluster -> analyze -> score -> daily Ark -> persist -> render HTML and PDF -> save to Drive -> email links/attachment -> delivery log.

Separate collection (once daily) from personalization (per recipient). Never independently fetch five copies of the same articles. For personal relevance use explicit user preferences, never infer private traits. Keep email body short and PDF optional if generation fails. Save the report and a source manifest in Drive.

## Scheduling
Weekdays at 07:00 KST is the desired delivery time, not the start of computation. Run ingestion earlier, allowing time for retry and verification. If insufficient verified events, send a truthful 'no confirmed major changes' edition rather than fabricated or Mock events. Use a scheduler with timezone explicitly configured; avoid double sending on retry.

## Integration and credentials
Google Drive folder and Gmail sender are selected by Grei. Use OAuth/service identity with least privilege, no credentials in repository. API keys and recipient addresses belong in deployment secrets. No bulk sends before explicit owner approval. Google plugin can be used by ADDY interactively but does not itself provide unattended runtime.

## First acceptance test
1. Live input includes real links and timestamps.
2. Same Event from multiple articles appears once.
3. Mock items never appear in a production edition.
4. A duplicate scheduler run sends no duplicate email.
5. Email, PDF and Drive archive show the same edition.
6. Unverified official-policy claims are clearly flagged.
7. Recipient preferences and opt-out respected.
8. Daily API/model costs and delivery failures are logged.

## Deferred
Breaking alerts, NotebookLM automatic ingestion, PLAUD integration, full self-service account UI, paid subscriptions. These are separate workstreams and must not delay the mailing MVP.
