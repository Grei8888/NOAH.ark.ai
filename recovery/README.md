# NOAH WIP recovery — 2026-09-06

This is a preservation checkpoint, not an integration or production release.
The repository root remains the GitHub main baseline at
`6806a9a30199c62074013885eb5e3dada6a788ca`.
Its collaboration documents and other agent changes are preserved unchanged.

## Recovered states

| Directory | State | Provenance |
| --- | --- | --- |
| `deployed-demo/` | Exact source tree for the published investor demo | Sites source commit `c77b8b9dc951a64e78a5491e2e21866e090bd89d`, extracted using `git archive` |
| `local-app/` | Main local Next.js application WIP | Previously uncommitted local workspace; file hashes in `local-file-manifest.json` |
| `local-app/demo-site/` | Unfinished authenticated web workspace prototype plus demo assets | Local working state after the published commit; NOT deployed |

Published URL: https://noah-intelligence-demo.adept-elk-5094.chatgpt.site/

Sites project: `appgprj_6a9c01d4856081919f6318a94b52b3f2`

Saved version (verified using Sites):
`appgprj_6a9c01d4856081919f6318a94b52b3f2~appgver_463804bc927c8191a2553990478042a1`

## What changed

Preserved the deployed Sinsa office investor demo, administrative-work defaults,
the local Event pipeline, Prisma models, structured AI adapter, ranking,
private/admin separation, tests and scripts. Preserved unfinished login, D1,
encrypted-key and report work separately from the deployed snapshot.

## Why

The local application had no commits or GitHub remote. The deployed demo was
committed in a separate Sites repository. Recovery avoids replacing either
state with GitHub main and makes all three states reviewable on GitHub.

## Architecture impact

None to the running root application in this recovery commit. Files are
archived under `recovery/`; no integration, migration, deployment or scoring
change is performed. Local WIP uses Prisma/PostgreSQL with a SQLite mock mode;
the unpublished workspace prototype proposes D1 and requires architecture review.

## Known limitations

- The published demo is static and uses clearly marked synthetic data.
- The web workspace is incomplete and unverified. Its migrations have not been
  generated, its test script references a test file not yet authored, and it has
  not been built or deployed.
- The prototype's manual article-analysis screen is not a replacement for
  NOAH's Event-centered pipeline. Before integration, reuse the existing Event
  analysis, deterministic scoring and Ark selection rather than introducing an
  independent article-summary product.
- The prototype's settings/credentials model requires review before launch.
- No OpenAI API key or live news credentials were configured in the local
  environment. No paid API execution was performed.
- Runtime databases, `.env`, credential values, dependency directories, and
  generated caches are intentionally excluded. They remain in the original
  local workspace. The public `.env.example` is included.
- `local-app/scripts/export-demo.mjs` predates the web conversion and would
  overwrite its package/manifest workflow; do not run it against the prototype
  until the export destination and metadata handling are corrected.
- Previously reported local checks were 26 tests plus typecheck/lint/build on
  the pre-web version. This preservation commit makes no new validation claim
  for the unfinished prototype.

## Next step

1. Review and preserve this recovery branch before functional integration.
2. Create a separate feature branch from current main; reconcile recovered
   local application changes with root code, retaining current governance and
   Codespaces configuration.
3. Continue the user's request for the same account on any PC: authenticated
   MY NOAH, server-persisted personal interests and Event/Ark history.
4. Keep the investor demo public and synthetic; keep personal reports private.
5. Reuse Event clustering, separate Importance/Relevance, 65/35 arithmetic,
   minimum 60, maximum 10 Events and maximum 4 per category.
6. Complete meaningful authorization, persistence, Mock separation and API
   failure tests before a production deployment. Connect GPT only after a key
   is securely configured; distinguish API readiness from a successful call.

## Preflight

Read latest main, five recent commits, active branches and all four required
project documents. Active branch besides main: `chatgpt/collaboration-governance`.
GitHub returned no open pull requests at inspection time. No existing
`codex/recover-deployed-wip` branch was present. The recovery branch is based
on current main and changes no existing root source files.
