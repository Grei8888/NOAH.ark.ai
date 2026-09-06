# Codex Handoff — NOAH Intelligence

Use this file as the short operational brief when starting or resuming work in Codex.

## Read first

1. `AGENTS.md`
2. `docs/PRODUCT_PRINCIPLES.md`
3. `docs/ARCHITECTURE.md`
4. `docs/COLLABORATION_RULES.md`
5. `docs/NEXT_STEPS.md`

## Current collaboration model

- Grei is Product Owner.
- GitHub `main` is the stable integration branch and single source of truth.
- Codex works on `codex/<feature-name>` branches.
- ChatGPT works on `chatgpt/<feature-name>` branches.
- Feature work should normally enter `main` through Pull Requests.

## Mandatory Codex preflight

Before editing:

- fetch latest `main`
- inspect recent commits
- inspect active branches / PRs
- re-read the exact files you will change
- check whether another branch is modifying the same area

Never overwrite a file from stale session memory.

## Product orientation

NOAH is not a news feed. It converts noisy source material into a small set of meaningful Events and actionable intelligence.

`ARTICLE → EVENT → SIGNIFICANCE → RELEVANCE → ARK → ACTION`

The default product objective is to reduce decision cost, not increase content volume.

## Current architecture-sensitive areas

Treat these as high-impact and review dependencies before changing them:

- `types/news.ts`
- `lib/news/*`
- `lib/scoring/*`
- `lib/ark/*`
- Prisma schema
- API response shapes
- Event IDs and Article/Event relationships

## Current near-term roadmap

1. Real Korean news Provider
2. Government / public-agency Provider
3. Event clustering
4. AI Structured Output
5. PostgreSQL / Prisma
6. Daily Ark persistence
7. Scheduler
8. Daily Intelligence Report
9. Breaking Intelligence
10. Personal Intelligence

If Grei gives a newer explicit instruction, follow that instruction and update the relevant project documentation when the change is durable.
