# NOAH ARK — Product Blueprint v1.0 (Draft for Owner Review)

Date: 2026-10-11  
Status: **PRODUCT DRAFT — NOT A RELEASE OR IMPLEMENTATION APPROVAL**  
Related: `docs/BRAND_V3.md`, `docs/PRODUCT_PRINCIPLES.md`, `docs/ARCHITECTURE.md`, `AGENTS.md`  
Repo: `Grei8888/NOAH.ark.ai`

## 1. Product vision

**NOAH ARK is an AI-personalized NEWS PLATFORM that turns many reports on one real-world change into one Event, explains distinct perspectives and delivers news relevant to each user's work, side business, and entrepreneurial goals.**

External copy:
- **Only What Matters.**
- **하나의 사건, 여러 개의 시선.**

Do not rebrand NOAH as only an enterprise research dashboard, funding notice aggregator, personal knowledge base, or political commentary service. The user explicitly wants a consumer-facing *news platform*.

## 2. First target customer

Working people with ambition and limited reading time:

1. Employed, exploring a side income or side project
2. Employed and operating a side business
3. Employed and preparing to found a company
4. Very early founder, validating a business

Secondary expansion: freelancers, small business owners, managers, specialists. A narrow launch audience does **not** mean the engine permanently excludes other topics.

Jobs to be done:
- Understand important economic/management/policy trends within ~5–10 minutes.
- Recognize viable side-business and startup opportunities without reading every press release.
- Understand how reputable sources frame a single event differently.
- Learn what similar professionals actually pay attention to, without revealing individuals.
- Save, open the source and follow an Event as it changes.

## 3. Core editorial product promise

**One Event → Many Perspectives → Your Relevance → The Next Useful Read.**

- `Article`: independently published source item with canonical URL, publication timestamp, source, and right-to-display metadata.
- `Event`: a real-world change represented by multiple Articles and evidence items.
- `Perspective`: a **source-attributed framing or interpretation of this Event**, with what is claimed, evidence and open questions.
- `My Relevance`: a user's explicit chosen profile + confirmed reading feedback. A model may explain relevance but not invent certainty.
- `Ark`: selected Events for the day. No filler quotas.

### Editorial and political perspectives

- **Do not assign a mandatory progressive/conservative label to publishers or readers.** Categorize the actual framing of an individual article and the arguments around an Event, where supported.
- Do not manufacture "two equal sides." Surface meaningful disagreements, convergences, minority/majority evidence, and unresolved factual disputes fairly.
- Maintain a separate **Verified facts / Viewpoints / What is still unknown / Source articles** presentation.
- Claims about laws, subsidies, deadlines, and official policy should refer to appropriate primary documents and distinguish proposal vs announced vs effective rules.
- Do not present NOAH as a political-neutrality certification service. The goal is independent evaluation and visibility into competing interpretations, not ideological scoring.
- Viewpoint labels are optional and topical, e.g. market impact / labor impact / public budget / industry impact, not hardcoded left/right.
- If only one well-supported perspective is available, do not fabricate another. Show available coverage and source gaps.

## 4. Minimum lovable product — screens

### A. Public entry / landing
- NOAH logo lockup, `Only What Matters.`, `하나의 사건, 여러 개의 시선.`
- 1 representative Event as a demo with 2 distinct source perspectives **when real sourced coverage is available**, or a clearly marked sample.
- Primary CTA: personalized edition signup / start reading.
- Explain why this is different from endlessly scrolling news.

### B. Lightweight onboarding
Required (aim <= 90 seconds):
- Stage: exploring side job / operating side business / preparing startup / early founder
- Industry interests (choose up to 3)
- Business/news topics (choose up to 5)
- Role or work context (broad choice)

Optional:
- Region
- Preferred news depth (quick / practical / deep)
- Organizations or keywords to follow

Do not request income, political affiliation, sensitive personal characteristics, employer name or precise business details to obtain a first useful feed. User can edit profile and opt out of personalization.

### C. Home (mobile-first)
A short first screen containing:
- **FOR YOU** — top 3–5 personally relevant Events
- **MUST KNOW** — 1–3 impactful changes outside the user interest bubble
- **PEOPLE LIKE YOU** — only after real, sufficiently populated aggregate behavior data is available
- **STARTUP RADAR** — verified funding notices, market opportunities, tax/regulatory changes, policy programs
- **MULTIPLE PERSPECTIVES** — access to opposing/different source framings without red-vs-blue labeling

The section names may be localized; they are not all required to be simultaneously above the fold. **For You is the default highest-priority content.**

### D. Event detail (core differentiator)
1. What happened — fact-based brief
2. Why it matters — objective relevance
3. **다른 시선** — multiple article perspectives, attribution, disagreement and shared facts
4. Why it matters to **me** — explain selected profile signals
5. Source list — original headlines, names, timestamps, deep links, correction state
6. What to watch next — qualified change, deadline or follow-up
7. Save / not interested / follow this event

An Event may contain one article temporarily, but confidence and coverage breadth must be visible. If a source is missing or analysis is incomplete, mark it rather than invent content.

### E. Saved & profile
- Bookmarked Events / following topics
- Profile editing and preference controls
- Feedback settings, transparency ("why this was recommended"), deletion/opt-out routes

## 5. Recommendation design

Three independent signals:

**A. Personal Match (day-one)**: declared topics, industries, stage, location if provided + article/event semantics.

**B. Event Significance (day-one)**: magnitude, novelty, source evidence, timing, category diversity. This preserves important news outside preference bubbles.

**C. Similar Users (later after evidence)**: anonymous aggregates of people with overlapping declared interests and behavior, with minimum eligible group sizes and quality checks.

Start with rules + embeddings/structured AI annotations and transparent weights. **Do not pretend "people like you read this" before real behavior exists.** During cold start, use an honest label such as `선택한 관심분야의 추천`, not peer-usage claims.

Existing repository scores (`Importance .65 / Relevance .35`; Ark score minimum 60, max 10 Events, category cap 4) are **legacy starting parameters**, not settled recommendation science. Define separate per-user relevance and cohort signals before changing scoring; benchmark offline and roll out with versioning. Avoid mixing a single owner profile into every user feed.

Use feedback thoughtfully:
- Useful positive signals: saves, explicit helpful rating, meaningful source visits.
- Negative: hide/not relevant.
- Dwell time and clicks are weak/confounded; do not treat them as ground truth.

For Similar Users, enforce user choice, aggregate cohort-size threshold, no personal exposure, anti-manipulation controls, and visible explanation. Exact threshold/privacy design to be agreed before implementation.

## 6. News and rights strategy

Initial source groups:
- Korean economy, management and technology reporting
- Government and public agency originals (including startup support and relevant policy notices)
- Research and corporate primary sources when appropriate

Engineering:
- Use multiple provider adapters; do not anchor the platform to a single portal's unofficial feed.
- Preserve source URL, canonical URL, publication time, fetched time, publisher, source type, article identifier, language and image/license metadata.
- Ingestion → URL dedup → semantic Event clustering → evidence-supported structured analysis → scoring → edition snapshot.
- Provide original-source clickthrough.
- Do not republish full articles or use publisher thumbnails without appropriate permission/license; RSS/API access does not itself settle reuse rights.
- Generated summaries may be wrong: audit prompts, structured output, primary-source checks, citations and error states.
- Explicitly separate Mock/demo and production.

## 7. Product architecture (target; subject to audit)

```text
Multiple News / Official Sources
              ↓
Source adapters & rights metadata
              ↓
Article normalization + dedup
              ↓
Event clustering + evidence links
              ↓
Structured Event analysis + viewpoints
              ↓
Event importance + personal relevance
              ↓
Per-user feed selection / Must Know / Startup Radar
              ↓
Web/PWA and later mobile app over shared API
              ↓
Feedback → profile/ranking learning → cohort aggregates
```

Likely entities: User, UserProfile, Interest, Source, Article, Event, EventArticle, EventPerspective, EvidenceLink, DailyEdition, FeedEntry, UserFeedback, Bookmark, CohortAggregate, RecommendationExplanation, PipelineLog.

Preserve source data, Event data, user data, and ranking snapshots as separate concepts. Do not assume the recovered Prisma schema already supports all entities. Formal migration/schema review is required.

Platform plan: integrate the recovered **Next.js / TypeScript / Prisma/PostgreSQL WIP** instead of replacing it. For mobile, validate responsive web/PWA first; choose a native wrapper or Expo/React Native later based on push, notification and store requirements. Prefer one shared server/API, not two independent backends.

## 8. Launch roadmap (3–6 months, conditional gates)

| Phase | Ship-ready outcome | Release gate |
|---|---|---|
| Weeks 1–2 | Recovery audit, unified baseline, vector brand assets, working preview | Stable build/tests, Mock clearly marked |
| Weeks 3–6 | Real multi-source ingestion, Event clustering, sourced detail screen | Provenance, dedup, no false official-policy claims |
| Weeks 7–10 | Signup, editable profile, personal ranking, mobile-first web | User-level isolation, consent/opt-out, first-value test |
| Weeks 11–12 | Closed Web Beta for working side-business/founder audience | Quality review, traceable sources, reliable daily feed |
| Months 4–5 | Feedback loop, improved perspectives, trustworthy Similar Users pilot where sample exists, app beta | No fabricated cohort metrics; device/notification tests |
| Month 6 | Public web + store launch candidate, staged growth, Pro experiments | Performance/security/legal/content-rights/store gates passed |

Three months is an **ambitious Web Beta** goal, not a guarantee. Six-month public app launch is contingent on production data sources, content rights, reliability and store approval. If these lag, ship a good web product before a rushed app.

## 9. Growth model & monetization

Launch goal: earn habit and trust, not maximize forced registration or paywall the first useful story.

Growth:
- Shareable **one Event, multiple views** landing cards with original-source links.
- Non-sensitive industry/topic interest editions, SEO where permitted.
- Onboarding that yields useful content in minutes.
- Referral and saved-reading flows only after product retention is demonstrated.

Future paid value:
- More precise Alerts and followed Events
- Historical Event context & time-sequence analysis
- Rich personal/industry briefs, advanced filtering and collections
- News-to-business relevance depth, not artificially withheld verified facts

Avoid fixing price before measuring return usage and willingness to pay. Distinguish personal subscription from later organization plans.

## 10. Product measurement and safety/quality

Primary product question: **Did the user discover a relevant, trustworthy Event they otherwise would have missed?**

Track, with clear definitions and privacy-safe collection:
- Activation: first personalized feed + first Event detail
- D1/D7/D30 return rate
- Explicit Event helpfulness / hide feedback
- Saves per qualified session and source clickthrough
- Share of users accessing at least two different supported perspectives
- First meaningful content time and mobile loading/accessibility
- Event clustering precision sample; duplicate rate
- Claim-source traceability, corrections and official-claim accuracy
- Source/provider errors and AI cost per generated Event/active user

Do not claim engagement metrics for synthetic demo data. No unsupported percentages or "similar people" counts.

## 11. Current codebase reality / integration rule

Verified repository on 2026-10-11:
- `main`: initial mock-first app and governance + UI v2 spec (orange-era, now superseded by brand v3 direction)
- `codex/recover-deployed-wip`: preserved `recovery/local-app/` Next.js code (providers, clustering, scoring, Prisma, admin/cron, tests) and separate `recovery/deployed-demo/` static published demo
- `chatgpt/morning-brief-mvp` PR #4: independent newsletter/brief experiment, not the core personalized consumer news platform release.

**Integration task is mandatory before feature development.** The recovery branch is not production and its archived paths are not a deployable root by themselves. Audit/tests first, then port selected code onto a fresh integration branch. Do not overwrite or delete the preserved archive; do not merge `recovery/` wholesale into main and assume functionality.

### Immediate next implementation sprint (Codex, after product owner approval)
1. Establish canonical runtime app branch via recovery review and test report.
2. Convert approved logo into editable/vector production assets (owner verifies fidelity).
3. Implement brand v3 visual tokens, app shell and a production-safe Event list/detail UI using existing models.
4. Preserve real-source attribution and demo separation.
5. Open PR with desktop/mobile screenshots and a working preview; no blind merge.

## Open decisions for product owner

1. Confirm launch identity: **NOAH ARK** (not NOAH Intelligence in primary consumer UI).
2. Confirm first distribution audience: employed side-business explorers/operators and prospective founders; industry examples may broaden over time.
3. Choose whether **Home first** means immediately personalized `For You` or a short public `Today's Ark` before login. Recommendation: `For You` for signed-in users and a selective public Ark for visitors.
4. Confirm launch scope: **web/PWA closed beta first, native app after real usage signals**.
5. Approve conversion of the reference logo to production vector assets.

This draft intentionally changes **documentation only**; no runtime, credentials, deployment, or billing has been modified.
