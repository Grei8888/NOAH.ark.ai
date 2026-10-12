# NOAH ARK — 10-reader production-parity beta v1

Status: implementation branch, **NOT publicly shared, not independently tested with billed OpenAI yet**. Product owner requested that all 10 readers test the **real source collection + real AI inference logic that could later be shipped**, not a mocked demo. Keep the existing Vercel production alias and working /beta Google feedback **unchanged**.

## Real reader journey (same code, no simulation)
1. Opt-in Vercel **preview** runs `NOAH_REAL_SOURCE_PREVIEW=true, NEWS_PROVIDER=government, AI_PROVIDER=off`. The **same** `getOfficialSourceSnapshot` (live MSS RSS, 14-day window, 40-item cap, canonical official https links, shared 30-minute cache) and `PublicSourceDesk` are used. Production still requires its existing `NOAH_LIVE_LINKS_V1=true` switch. No mock backfill on RSS outage.
2. Public-source preview Home shows **AI로 이해하기** beside an actual official source link only when the AI reading lab is configured. Tapping opens `/lab/reader?source=<exact official URL>`.
3. The reader sees actual ministry RSS source cards, visits the **publisher/agency original** in a new tab, optionally picks a source, chooses **용어 설명 / 배경 이해 / 비판적 독해 / 다른 관점**, and asks a question at any point. Two-article reading is **optional**. User can also ask a conceptual question without selecting any source.
4. After entering one personally issued 36-character tester code, the reader calls the **genuine** OpenAI Responses API via `lib/news/reading-companion-service.ts` and existing server-side prompt boundary. There are **no canned answers** in the real preview. AI only sees title/question, not a scraped article body or raw original URL, and admits it did not read the full article.
5. The reader can optionally explore related reporting in an actual **external Google News search** (not an ungrounded in-app left/right or independently verified article recommendation). The user may also give feedback through the **existing verified** https://noah-ark-ai.vercel.app/beta feedback flow.
6. In preview, all 10 testers have distinct cryptographically random codes. Server stores only their **SHA256 hashes** in a Preview environment variable. The API checks the selected invite before processing, with best-effort per-instance 6/hour, 20/day and one active request per invite per instance. It never silently enables paid AI in Vercel **production**.

## Real code reuse vs missing features
- **Same** ministry source provider/cache/frontend logic (preview & prod), **same** OpenAI adapter as future production. Environment gates protect operations, not alternate mock implementations.
- Not yet a genuine Event cluster system, two news-outlet perspectives, approved RSS aggregator for 9 publishers, validated news sentiment, or article-specific full-text understanding. Do not claim otherwise. These require independent news source metadata rights/reliability and source-grounded evaluation.
- No source title/url is invented. Extra reporting discovery is a search **link** rather than misrepresented verified editorial comparison.

## Configuring one private 10-reader preview

Do this **only after product owner explicitly approves API billing and preview access**.

**Step A — Prepare API cost boundaries:** Create a small dedicated OpenAI API project with least-privilege key, monitor spending daily, and understand that budget alarms may be **soft** rather than strict hard cutoffs. ChatGPT subscriptions do not fund OpenAI API requests. External web-search AI calls are not used by the reader model service.

**Step B — Produce 10 codes locally, not in chat:**
```sh
node scripts/generate-reader-invites.mjs
```
The CLI prints ten raw codes for separate one-to-one distribution and a single comma-separated `NOAH_READER_LAB_INVITE_HASHES` environment value. Store the raw codes privately (e.g. secure password manager), **never** paste them in GitHub PRs, ChatGPT, or public forms. Removing one hash + redeploy disables that tester.

**Step C — Vercel preview-scoped environment variables (NEVER Production):**
```env
NEWS_PROVIDER=government
AI_PROVIDER=off
NOAH_REAL_SOURCE_PREVIEW=true
NOAH_READER_LAB_ENABLED=true
NOAH_READER_LAB_INVITE_HASHES=<ten SHA-256 hashes as comma-separated string>
OPENAI_API_KEY=<dedicated secret API key>
NOAH_READER_LAB_MODEL=gpt-4.1-mini
```
Existing Google Form receiver secrets and production `NOAH_LIVE_LINKS_V1` should be left intact. Runtime beta reader URL is `https://<approved-preview-domain>/lab/reader`. Source Home is the Preview root `/`.

**IMPORTANT actual infrastructure audit:** Vercel project `noah-ark-ai`, personal account, has `ssoProtection.enabled=true` for **preview**. This blocks non-team testers *before* our invite-token gate, so even a correct code alone is insufficient. Before handing out 10 links, owner must choose/approve a separate protected test domain or explicitly change preview protection to permit non-team users. Do **not** turn off SSO automatically or modify production. Consider app-level tester gate (already protects paid API), plus Vercel security controls. The Home uses real-public official RSS but the protected API requires a valid code. Link sharing without approved access can cause a 403/SSO screen.

**Step D — Regression and live QA:**
- GitHub CI checks `pnpm typecheck`, `pnpm test`, `pnpm lint`, `pnpm build`, `pnpm test:http` with **mock API responses in CI only** to prevent spending. These validate code but **not real OpenAI quality**.
- Once approved and configured, owner verifies **a single real model answer** with low spend (four modes after initial smoke), clicks original links on mobile, checks source outage behavior, tests unsupported/malicious invites, and confirms existing /beta sheet receipt in separate published workflow.
- Verify the prototype does not imply publisher article text was read or reproduce unlicensed article text.

## 10-tester functional acceptance table

| Scenario | Expected |
|---|---|
| 1. Home loads in preview with real source flags | Official RSS URLs/data only; no mock article |
| 2. RSS provider unavailable | Truthful empty/outage UI; no fabricated fallback |
| 3. Tap original | Agency/publisher original https opens |
| 4. Tap AI로 이해하기 | Same actual source title selected in lab |
| 5. Ask a conceptual question before reading | Allowed; no two-source lock |
| 6. Ask in four modes | Four real model responses, fact vs claim distinctions |
| 7. Try an invalid invite | HTTP 401; no paid API call |
| 8. Try production alias API | HTTP 404; no paid API call |
| 9. Optional other perspective | External relevant News search opens; no false ideological claims |
| 10. Submit feedback | Existing Google Forms-connected /beta receipt, not new data pipeline |
| 11. Test 320px mobile, desktop & assistive labels | Original, ask & alternatives remain usable |
| 12. Monthly expense review | API projects/alerts verified, independent from soft in-process rate limiting |

## Stop/rollback rules
- A cost surprise, source attribution mismatch, forged article claim, severe hallucination, unauthorized input, or broken original link blocks external beta invitation until investigated.
- To stop all paid calls: set **Preview** `NOAH_READER_LAB_ENABLED=false` and redeploy; key revoke for urgent termination. To disable real RSS preview: `NOAH_REAL_SOURCE_PREVIEW=false`; production remains on its existing commit and configuration.
- PR review only; **do not merge #28/#29/#30 directly into stale main**. Issue #24 production baseline review remains separate.
