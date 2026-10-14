# Reader invitation authentication fix

Base: `chatgpt/noah-business-support-data-v1`, commit
`8dc16d2d5433e9080cfd8db4612f34d2f4d6f3d5`.
Work branch: `codex/fix-reader-invite-auth`. PR review only; no main changes,
Vercel configuration changes, manual deployment or merge.

## Findings and failure reproduction

The previous “초대 링크 인식 완료” meant only that the browser had read a
32–128-character fragment/storage candidate. It never compared that candidate
with the server's registered invitation hashes. A well-shaped unregistered code
or a pasted SHA-256 digest could therefore display that success message and then
receive **401** from an AI request.

The localized invitation error originates before input processing, quota checks
and OpenAI. With the lab configured, 401 means the supplied original code did not
authenticate against the active Preview hash allowlist (or the header is absent/
out of bounds). It is distinct from disabled configuration (404), rejected origin
(403), wrong content type (415), usage limits (429) and provider failures (502/503).

A separate concrete browser bug was reproduced with a failing regression test:
after storing code A, opening a malformed new `#join=` removed the fragment but
left A in sessionStorage. On the next workspace mount, A was silently reused.
The fix clears the old candidate before consuming any new invitation. When
sessionStorage is blocked, the current document's memory preserves the candidate
across soft navigation; it is not a persistent login or server authentication.

We did not obtain the reported user's raw invitation or read/modify live Vercel
secrets. Whether that particular code was unregistered, revoked, copied as a hash,
or scoped to another Preview remains an operator-side configuration check. We
do not weaken the allowlist or claim that deployed credentials have been repaired.

## Client and server path

| Step | Behavior |
| --- | --- |
| Home `#join=<original code>` | `HomeInviteCapture` consumes the fragment, removes it from the address and stores a tab-scoped candidate. |
| News / Reader entry | Shared `useReaderInvitation` reads that candidate and calls `POST /api/lab/reader/access`. |
| Access check | Exact same environment/origin/content-type/hash gates as AI. No provider call, token issuance or AI quota use. Response contains only authentication status/error code; private/no-store. |
| Verified state | Only a successful server response displays “초대코드 서버 인증 완료”. Link detection/checking, rejection and unavailable server remain distinct. |
| Manual recovery | Issued original code can be entered and checked. Editing/resetting cancels previous checks; late responses cannot verify a different code. |
| AI or term question | Original code goes only in `x-noah-lab-token`. Server rechecks membership for every question before quota/model handling. |
| 401 after prior verification | Clears saved/in-memory candidate and verified state, restores the code entry, and blocks further AI submissions until verified. |
| Provider failure | Shows an AI connection error while retaining the distinct successful authentication result. |

`verifyReaderLabRequest` shares the pre-existing authentication gates between
both endpoints. `reader-lab-access.ts` and the OpenAI service are unchanged.
Raw codes, digests and API keys are never returned by the access check, and the
code does not enter the question JSON, original-publisher URL or query string.

## Safety and validation

- Preview/local opt-in and Production hard-off remain unchanged.
- At most ten distinct invitation digests; constant-time comparisons unchanged.
- Same per-instance **6/hour, 20/day, one active request per invite**.
- Same 4,000-character request bound, 4–380-character question, 240-character
  headline, 550 output tokens, no article scraping and OpenAI `store: false`.
- API keys remain server-only. Client bundle scan found no OpenAI/invite-hash
  environment access. No real API key or raw deployed invitation was used.
- `pnpm typecheck`, `pnpm test`, `pnpm lint`, `pnpm build` pass:
  **147 tests / 31 suites**. Lint retains two existing warnings; build retains
  five existing Prisma/runtime filesystem-tracing warnings.
- `pnpm test:http`: **10/10** pass.
- `NOAH_CHROMIUM_PATH=/usr/bin/chromium pnpm exec playwright test
  --config=playwright.reader-invitation.config.ts`: **8/8 pass**. Browser regressions exercise
  Home→News→Reader, actual term-bubble requests, wrong-code recovery, blocked
  storage, malformed replacement, rejection after verification, stale responses,
  model failure and 390px mobile. Existing Chromium only; no browser installation.
- Browser tests use local RSS/search/model fixtures and the actual local server
  hash validator. The preload refuses external server requests, publisher frames
  are intercepted, and no live RSS/search/OpenAI/Vercel calls are made.

## Remaining risks and follow-up

- Before any approved beta rollout, the operator must match the **privately held
  original code's digest** to the target deployment's branch-scoped Preview
  allowlist. Do not paste codes/keys/digests into PRs or bypass hash comparison.
- Local fixture tests do not verify live Preview credentials, Vercel SSO/proxy
  behavior, Safari/physical devices or paid model quality. These remain unrun.
- Existing quotas are per-instance, not distributed limits or monetary spend
  caps. Sharing one code shares that invite's allowance; this PR preserves it.
- With storage disabled, in-memory continuity lasts only until a hard reload or
  tab close. Inaccessible verification servers leave AI submissions blocked.
