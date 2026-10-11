# NOAH ARK — trusted-contact beta editorial and source policy v0.2

Last reviewed: 2026-10-12. Owner product instructions: start with acquaintances the owner trusts, include balanced reputable mainstream progressive and conservative reporting, avoid outlets that routinely promote extreme/unsupported claims, keep monthly **total** operating cost below KRW 50,000.

## 1. Access and testing scope

- Invite the owner's trusted contacts first through the existing `/beta` guide.
- **Current actual state:** The production root and `/beta` are publicly reachable without login; noindex metadata and sharing to friends **do not constitute access control**. This is a limited-distribution *invitation*, NOT a private-membership area. Do not claim it is technically private.
- Do not collect sensitive personal information, sell data or quietly collect tester feedback. The current share-to-owner feedback flow remains user-initiated and not centrally stored.
- Only add a server-verified invite gate if the owner explicitly wants **enforced** invite-only access. A client-side access code is not security. Such a gate must account for crawler, monitoring, and deployment testing.

## 2. Balanced mainstream source shortlist (NOT yet enabled)

Consider these recognizable editorial voices to cover perspectives. These are **not endorsements of factual quality of any particular article**, and political labels are approximate editorial diversity descriptors, not immutable judgments:

| Intended editorial role | Review candidates | State |
|---|---|---|
| Progressive viewpoints | 한겨레, 경향신문 | Candidate only — usage terms/feeds and reuse permission to verify |
| Conservative viewpoints | 중앙일보, 동아일보, 조선일보 | Candidate only — usage terms/feeds and reuse permission to verify |
| General/neutral-context reference | 연합뉴스, public agencies, potentially public broadcasters | Candidate only — rights/feeds and independence to verify |
| Primary evidence | Actual government notices/statutes/public materials | Existing MSS source-link mode; review per-asset rights |

**Do not assume that having an RSS endpoint allows republication, snapshots, photos, cached excerpts or AI ingestion.** Each source must pass a specific license and technical check before enabling source aggregation. Some press sites expressly prohibit reproduction and AI utilization without separate permission:
- 경향신문 digital news terms: https://www.khan.co.kr/help/help_digital.html
- 연합뉴스 copyright notice: https://www.yna.co.kr/view/AKR20260621023000011
- 동아일보 copyright warning appears on news pages: https://www.donga.com/news/rss/List_0108

No contract, press photo license or broad article use is confirmed for these candidates. The current production news list will **continue to show only verified government links** while reviews proceed. Source-link discovery, quoting, indexing and headline use need legal/terms review independent from body/image use.

## 3. Editorial selection, moderation and multiple perspectives

Selection criteria:
1. Named editorial organization and legal publisher; identifiable ownership and professional editorial/revision process
2. Source transparency, bylines or accountable publisher, prominent correction/report mechanism
3. Evidence-backed factual reporting; repeated deliberate disinformation, dehumanizing hate or advocacy of violence as exclusion factors
4. Diversity of **actual, relevant perspectives on the same factual event**, not an artificial left/right 50:50 quota for every topic
5. Separate **facts**, **attributed claims**, **opinion/editorial framing**, and **NOAH synthesis**; do not label a contested claim as verified fact or a partisan framing as neutral analysis
6. Apply the same evidence, correction and sensationalism standards across ideological orientations; no subjective blanket exclusion or automatic tagging of an outlet as "far left"/"far right" without independent concrete justification

A bare mix of progressive/conservative publishers on a home feed is not yet **one Event, multiple perspectives**. That requires fact-matched cluster IDs, provenance, confidence, view selection and careful validation. Do not label government RSS links as an AI-analyzed Event.

## 4. Rights gates and rollout order

**Today:** two official MSS RSS links, 14-day window, max 40, no article body/photo, 30m cache, no AI.

**Next, before enabling press feeds:** confirm feed owner, HTTPS uptime, Terms and automated access restrictions, commercial/noncommercial reuse rules, headline metadata display rights, AI ingestion/summarization rights, photo rights, link attribution and correction behavior; retain written source-by-source decisions. Where rights disallow use, do not ingest, copy, cache, train or summarize the protected content. Linking to a source does not grant rights to host its content.

**Later:** build event clustering from lawful data and explicit attribution, display contrasting sources where genuinely warranted, then consider a cost-controlled single shared AI analysis per event — not one AI analysis per tester.

## 5. Current product representation

- Public site: **source discovery beta**, not multi-perspective AI journalism.
- Existing "오늘의 관심사": multi-select **title-keyword filtering on the already loaded 40-source max list**, zero model tokens and no server requests per toggle, limited to sources currently connected.
- Visible empty state if selected topics have no match; no fake news backfill.

## 6. Owner acceptance

Owner delegated implementation/release decisions within the agreed noncommercial beta constraints and KRW 50,000/month ceiling. No permission to incur unbounded spend, copy protected journalism, or claim unverified editorial neutrality.
