# NOAH ARK — personalized news briefing, actual-code MVP

**Owner accepted concept on 2026-10-13:** Home must differentiate from ordinary news search. Transform today's interest chips into persistent **MY FOCUS** and show a curated **FOR YOU / PERSONAL BRIEFING** of 3–5 if available before secondary search. Do not fabricate stories or portray title-derived rankings as editorial verification.

## Implemented
- Home: browser-local `noah:personal-focus:v1`, persistent across Korean calendar days, reversible via chips. Previous date-scoped `todayTopics` remains for other views; existing same-day choices seed focus only when no persistent focus is stored.
- News curation shares the same SerpApi results as NEWS Discover; reuses `/api/news/discovery?topic={economy,startup,finance,policy}`, 24h server cache and four **fixed upstream queries**, no arbitrary custom paid searches or duplicate fetch per topic within the same browser component.
- Given selected topics (창업·소상공인, AI·기술, 금융·지원, 정책·제도, 수출·해외), the app retrieves the corresponding fixed query results; selects ONLY relevant title-matching news within the last 30 days (or unknown date flagged, and 14–30-day-old items explicitly marked as not the latest); deduplicates original URLs.
- Very similar headline strings, with up to 72h difference, are conservatively *grouped provisionally*. A block lists all individual publisher originals and explicitly disclaims independent reporting. **No claim of different ideological perspectives**, no forced second-article reading.
- Up to five prioritized articles/issues. Weight based on title match to user's chosen interests, recency where known, number of attributed outlets with similar titles. Show the actual evidence for selection on each row. No AI summarization, no content mirroring and no quality claims.
- Each briefing row offers direct original and “이 이슈 살펴보기”, which selects the actual article title/source in the downstream **3:2 inline AI Reading Companion**. If no API key, AI honestly remains disabled.
- Editorial layout: pale grey MY FOCUS settings panel, prominent white PERSONAL BRIEFING ranked shortlist and reasons, subordinated Discover with explicit separation. Original government-policy search controls moved adjacent to POLICY list rather than above personal briefing. All styled with white/navy/grey and restrained gold accent.
- Privacy: interests stored solely in browser; upstream SerpApi queries are pre-set shared keys, no user choices or questions sent to search provider. The OpenAI model receives only clicked headline+question via existing 10-tester gated backend, if separately activated.

## Limitations / red-team
- No true user's business/company profile, behavior tracking or text-semantics model yet. "Personalized" means explicit preferences and transparent rules, not an AI-personality diagnosis or verified editorial newsworthiness. Never falsely claim a sophisticated AI event clustering system.
- Fixed Google News queries were not designed for full coverage of AI technology or export; candidates may be sparse. Nothing invented if no match. Future improvement: reallocate search topics only after validating user demand and the 250 search/month free plan budget.
- SerpApi indexed dates sometimes omit or differ from article publish dates; undated titles are explicitly labeled "발행일 확인 필요" and receive a lower rank.
- Without at least one interest the page prompts for preferences instead of pretending to know the user.
- Topic selection currently also filters the homepage government RSS list; the document must not imply the policy list is an independently computed recommendation.
- Do not launch to ten users until actual beta Preview article titles, link integrity and mobile layout have been inspected; GitHub mock-only CI is not a paid network QA.

## Release acceptance
- [ ] CI typecheck, test, ESLint, build, existing HTTP regressions.
- [ ] Desktop 1440/1280: distinct visual order Focus → Briefing → Discover → POLICY, AI companion 3:2 below.
- [ ] Mobile 320/390: wrap interest chips and avoid overflow in briefing title, ranking and link chips.
- [ ] Persist selected focus after KST midnight; clearing interests leaves safe explicit empty state, not synthetic recommendations.
- [ ] Verify a real SerpApi article per interest and topic, actual original links, selected article title in inline companion; no extra external search on every selection.
- [ ] If topic endpoint fails, preserve truthful partial results or error; do not invent 3–5.
- [ ] Previous production Vercel alias not changed. PR stacked on existing working #35, which is stacked on #34 and prior feature branches; do not merge directly to stale main.
