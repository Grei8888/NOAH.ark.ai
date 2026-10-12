# NOAH ARK — real AI Reading Companion Lab v1

## Critical product-stage decision — 2026-10-12

**Building and proving a working AI experience comes BEFORE choosing to publish.**
The user considers current development itself to be beta testing. Do not ask for a public launch decision while the fundamental AI News Partner experience exists only as "coming soon."

The production alias stays untouched until a real-model, real-reader test demonstrates what the product does.

## Working preview scope

- Route: `/lab/reader` — isolated server-rendered 404 unless configured, noindex.
- Endpoint: `POST /api/lab/reader` — genuine OpenAI **Responses API**, no fake canned answers when configured.
- Four testable intents: `용어 설명`, `배경 이해`, `비판적 독해`, `다른 관점`.
- Optional news headline context, optional `https://` original link (shown locally in user's browser, **not** passed to AI and **not** fetched by server); free-form question.
- AI is instructed that it **has not read the original article**. It can explain general economics, policy background, questions to challenge claims, and terms to search when considering other viewpoints. It cannot fabricate specific journalistic analysis or original article links. There is **no requirement to read two articles**.
- Text responses, not article summaries or copycat published journalism.
- Models/usage: defaults to `gpt-4.1-mini`, at most `550` response output tokens, timeout 14 seconds, `store:false`.
- No auth login or Neon; one shared *test-only* access code 32+ chars, held only in browser component state and never persisted.

## Enable in LOCAL development only

Use **only** the developer's own OpenAI API key, not a personal ChatGPT login:

```env
NEWS_PROVIDER=mock
AI_PROVIDER=mock
DB_MODE=local
NOAH_LIVE_LINKS_V1=false
NOAH_READER_LAB_ENABLED=true
NOAH_READER_LAB_ACCESS_TOKEN=<strong random 32+ characters>
OPENAI_API_KEY=<api project key, private>
NOAH_READER_LAB_MODEL=gpt-4.1-mini
```

Then `pnpm install --frozen-lockfile`, `pnpm setup:mock`, `pnpm dev`. Visit `http://localhost:3000/lab/reader`. Enter the same code in the on-page password field; choose a mode and ask. **Do not commit local .env** or share API key/password in chat, form feedback or screenshots.

For a Vercel **preview**, use preview-scoped values only, confirm the preview deployment's access restriction/SSO and `VERCEL_ENV=preview`. The lab **explicitly fails closed on production** `VERCEL_ENV=production`, and on self-hosted `NODE_ENV=production` with no preview marker.

**Cost control:** OpenAI API usage is billed separately from ChatGPT subscription. The 8-request per hour per visitor/IP check is **best-effort per server instance** only; it is NOT a hard budget cap, especially with horizontally scaled or restarted serverless. Create a small dedicated API project with explicit restricted budget/project limits and monitor usage *before setting any key*. No paid API was called by code authoring or tests. Production's `AI_PROVIDER=off` remains unchanged.

## Suggested real-model QA before any publication

1. Economic beginner, no headline — "기준금리와 대출금리의 차이를 쉽게 설명해 줘" (terms).
2. Startup founder, official MSS RSS title only — "정책자금 공고를 볼 때 지원조건은 어디서 확인해야 해?" (background).
3. Business owner, media headline only — "이 주장을 검증하려면 어떤 데이터가 필요해?" (critical).
4. Alternate viewpoint — "기사 하나에 없는 다른 해석을 확인하려면 어떤 자료를 읽어야 해?" (perspectives).
5. Repeat in narrow mobile and desktop layouts: question entered, user sees generated reply or honest error, input remains, original link can be opened, and no fake reading-complete gate.
6. Check that AI doesn't invent article facts, fake URLs, numeric rates or official eligibility. Correct through prompt/test iteration if it does.
7. Disclose costs/usage, view responses and collect owner feedback **before choosing** to release.

## Scope and honest limitations

This is a **working AI API code path**, not yet a successful end-to-end live call; OpenAI key and runtime preview are required for that verification. Existing mock CI tests intercept the OpenAI request and **must not** be described as a model quality evaluation.

The prototype does not scrape external news websites, ingest article bodies, import YTN/Hankyung/Maeil RSS, connect Event clustering, or compare licensed proprietary article content. The article's title is contextualized only as an **unverified user input**. Under a future publisher contract, article-specific comparison should be designed separately with permissions and source-grounding.

`/lab/reader` is not linked from public Home until the product owner approves an actual internal preview and confirms secure credential handling. No Vercel production changes, Apps Script/Google Sheet edits or automatic public release.

The review branch is stacked on #28 (voluntary founder/economy user onboarding); #27 covers media-source rights independently. Baseline stabilization #24 is separate.

## Engineering acceptance

- [ ] CI: `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm build`, `pnpm test:http` with mock providers.
- [ ] Read the actual GitHub CI job outcome; a workflow file alone is not test success.
- [ ] Local/preview: real API call and all four modes demonstrated.
- [ ] Unauthorized and production requests fail closed (test and actual HTTP).
- [ ] OpenAI project budget and cost monitoring configured and agreed.
- [ ] No AI-based article summary claimed without article-body permission.
- [ ] Owner explicitly approves any production feature release after seeing working tests.
