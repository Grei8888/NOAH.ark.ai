# Recovered runtime audit — Issue #6

Audit date: 2026-10-11. Main: `08abd3a57710d779b7d8ad4f3b53124c83546a71`.
Archive: `a700e8b293d32b27101c5fe5d55c643749cdc547`, `recovery/local-app`.
This report precedes runtime porting. The archive branch is unchanged.

## Inventory and disposition

| Piece | Decision | Evidence / required adaptation |
| --- | --- | --- |
| URL/title normalization, exact dedupe | Reuse | Tracking removal, unsafe URL rejection, duplicate relationships covered by tests |
| NewsAPI / HTTPS RSS / government adapter | Adapt | Provider interface reusable; official-source feed config needs explicit source classification, no blanket trust from provider name |
| Event clustering | Reuse as conservative baseline | Stable article-derived IDs and 48h/action checks; heuristic, no embedding/semantic precision claim |
| Structured AI analysis | Adapt | Responses structured output + Zod; remove investor use cases and owner implication from shared analysis |
| Importance/Relevance arithmetic, ranking | Reuse / extend | Preserve 65/35, min 60, max 10, cap 4 for personal scoring; public discovery must use significance, not owner relevance |
| Prisma / publication snapshots / pipeline lease | Adapt | Fresh canonical schema, no deployed DB migration; neutral shared profile, mode partition, immutable publication guard |
| Admin cookie / origin checks / cron | Adapt | Admin-only operations, strict token parsing; do not treat admin session as consumer auth; no scheduler activation |
| Tests | Port and strengthen | 26 recovered tests pass; add mode-isolation, owner-independence, publication-failure tests |
| Owner defaults / profile / business settings | Archive only | `grei` hardcoded in pipeline; private interests must not become all users' preferences |
| Investor UI / demo export / D1 web workspace | Archive only | Separate unfinished experiment; not canonical runtime, no wholesale merge |

## Reproduction

An isolated copy outside the repository was installed with the recovered frozen pnpm lockfile.
- `pnpm test`: **26/26 passed** (3 suites).
- `pnpm typecheck`: **failed**: `demo-site` pulls uninstalled Drizzle, Vite and Sites plugin types into Next's TypeScript scope.
- `pnpm lint`: **0 errors, 1 warning** in archived `demo-site/src/worker.ts`.
- `pnpm build`: **failed** at TypeScript for the same demo-site dependencies; Prisma bundling also produced 4 tracing warnings.

## Architecture review before implementation

The shared pipeline currently requires `userId: grei`, persists owner relevance in global Event rows, and queries Articles/Events without a mock/live partition. These are release blockers. Port the smallest Node/Next + Prisma slice, exclude archived prototypes from compilation, use a neutral public analysis profile, and preserve source attribution. A public significance-ranked Ark is a discovery pool; personal 65/35 arithmetic remains separate. No consumer authentication, cohort metrics, personal DB schema or production deployment is approved by this audit.

The current user explicitly requested audit followed by Home implementation. PR #5 remains Draft; its design files may guide the review branch, but this task will not merge #5 or any implementation into main. PR #4's morning brief experiment is independent and will not be overwritten.

## Home scope after runtime passes

Responsive personalized Home with explicit locally declared interests, editable/disabled signals, local saves/hide/undo and sourced Event detail. Local preferences are clearly identified as browser-only; authenticated cross-device personalization and AI-generated per-user relevance remain future gates. No owner-profile fallback, invented viewpoints, peer metrics, unsupported thumbnails or silent live-to-mock fallback.

## Canonical runtime checkpoint

After selective port and adaptation:
- `pnpm typecheck`: pass.
- `pnpm test`: **29/29 passed** (3 suites).
- `pnpm lint`: pass, no warnings/errors.
- `pnpm build`: pass; 4 generated-Prisma tracing warnings remain.
- No recovered archive paths were copied into canonical `recovery/`, overwritten or deleted.
- No owner profile is seeded or required; publication mode isolation and immutable detail snapshots are tested.
- Consumer authentication, live API success and production database deployment remain unverified.

Local setup follow-up: Prisma CLI and runtime now share one absolute SQLite path;
setup only creates a missing file and never truncates a database. Node's `--import tsx`
avoids the CLI's blocked IPC socket. Actual mock run: 32 documents, 2 duplicates,
10 Events, 10 successful analyses, 8 selected publication items. Admin login returns
JSON instead of redirecting to an archived admin panel that was not ported.
