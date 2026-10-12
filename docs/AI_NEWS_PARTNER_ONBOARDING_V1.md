# NOAH ARK — AI News Partner onboarding v1 review

**Status:** review-only feature branch (no production merge/deploy). Public beta still uses government RSS original links; the AI Reading Companion, commercial media sources, Event clustering and publisher feed integrations remain future work.

## Positioning
- Brand: **NOAH ARK**
- Principle: **Only What Matters.**
- Service identity: **Your AI News Partner**
- Korean value statement: **경제를 이해하고, 세상을 읽는 AI 뉴스 파트너.**
- Promise: *기사를 대신 읽는 AI가 아니라, 독자가 더 깊이 이해하고 스스로 판단하도록 돕는 AI.*
- Audience: declared needs rather than age/IQ/inferred competence. First-time founders, business operators and readers entering economic/policy news. No presumptions based on age or occupation.

## Implemented on production-source Home review branch
- New optional `ReaderAudiencePanel` on Home and My NOAH with reading goals: `창업을 준비하고 있어요`, `사업을 운영하고 있어요`, `경제를 배우고 싶어요`.
- Selected goal is a voluntary browser-local string in `noah:reader-audience:v1`. No login, analytics, server write, inferred personalization, or AI API use. Existing save/hide and dated Today Interests are untouched.
- Each goal suggests a **currently supported** existing official RSS keyword filter, applied only after explicitly pressing the respective topic button. Changing goal alone does not alter the news list.
- Home copy and metadata use AI News Partner identity, with prominent **AI features coming soon** and precise **currently government-only** labels.
- Intro mobile layout is compact and accessible with focus styles and tap targets. Responsive styling is additive.
- Regression coverage tests known reader IDs and existing topic mapping.

## Not implemented (do not imply it exists)
- Actual AI reading, comprehension, AI questions, opinion classification, full article retrieval, political-diversity matching, or Event grouping in the public source desk.
- Broad licensed media headlines, blog/news Rss, news summarization or copyrighted article body/image.
- Unverified claims of reading-completion detection or two-item gate. Other perspectives and additional original articles must stay **optional**.
- Any paid API, Vercel deployment, database write or migration.

## Rights-safe source-link model (legal-review notes, not blanket clearance)
- Korean Copyright Commission FAQ explains that **original article title + hyperlink only** can be posted without infringement concerns in the described context: https://www.copyright.or.kr/customer-center/faq/list.do?searchcounselfaqno=44187
- Another KCC FAQ states direct/simple links with site and URL do not generally infringe, unlike copyrighted paragraphs: https://www.copyright.or.kr/customer-center/faq/list.do?counselfaqno=41608
- Supreme Court 2021-09-09 2017도19025: liability can arise by knowingly and commercially/continuously linking to infringing copies; do not link pirate mirrors. https://www.scourt.go.kr/portal/news/NewsViewAction.work?gubun=6&pageIndex=1&searchOption=&searchWord=&seqnum=2063
- Publisher RSS **automated extraction and feed re-publication**, UI photo/preview thumbnails, content excerpts, and LLM body processing can have additional contract, access/terms, copyright and competition issues. Plain original-site links are not equivalent to a contract right to fetch and reuse full feed XML. Assess each technical implementation specifically.
- Do not assume publisher title+link use requires a wholesale content license, and do not treat open RSS as blanket AI permission.
- Court trial-level 2025.1.10 2022가합558462 reported by KCC held article links/summaries non-infringing on its facts (not precedent that all AI processing is authorized): https://www.copyright.or.kr/information-materials/trend/precedents/view.do?brdclasscode=&brdclasscodeList=&brdctsno=54458&etc1=&etc2=&nationcode=&nationcodeList=&noticeYn=&pageIndex=28&searchTarget=ALL&searchText=&searchkeyword=

## Release and QA checks
- [ ] `pnpm setup:mock`, `pnpm typecheck`, `pnpm test`, `pnpm lint`, `pnpm build`, `pnpm test:http`.
- [ ] Separate real-source branch manual QA of home/onboarding, search, filter, saved/hidden, 14-day RSS refresh, beta form and mobile keyboard.
- [ ] Type-check that selected source topics are supported in this beta.
- [ ] Avoid changing main or Vercel production without explicit owner approval.
- [ ] Keep `#24` baseline consolidation and `#26` media licensing/technical validation separate; source taxonomy staged in Draft `#27`.

**Marketing guardrail:** describe what NOAH aims to be, not AI features currently in production. Users must be able to browse official sources without picking a goal.
