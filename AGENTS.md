# NOAH Intelligence — Agent Instructions

This repository is developed collaboratively by Grei, Codex, and ChatGPT.

## Mandatory startup sequence

Before changing code, every coding agent must:

1. Read the latest `main` state and recent commits.
2. Check active branches and pull requests that may touch the same area.
3. Re-read every file it plans to modify from GitHub. Do not rely on stale session memory.
4. Read:
   - `docs/PRODUCT_PRINCIPLES.md`
   - `docs/ARCHITECTURE.md`
   - `docs/COLLABORATION_RULES.md`
   - `docs/NEXT_STEPS.md`
5. Work on an agent-specific feature branch unless Grei explicitly requests a direct `main` change.

## Branch ownership

- Codex: `codex/<feature-name>`
- ChatGPT: `chatgpt/<feature-name>`
- `main`: stable integration branch and single source of truth

Do not overwrite another agent's work. If the same file has changed since the task began, re-read it and reconcile the changes before writing.

## Product rule

NOAH is not a news feed. It is an Event-centered intelligence system that reduces decision cost.

Core flow:

`INFORMATION FLOOD → SIGNAL DETECTION → EVENT → SIGNIFICANCE → PERSONAL RELEVANCE → ARK → INTELLIGENCE → ACTION`

The default question for every feature is:

> Does this reduce the user's information burden and improve decisions, or does it create more noise?

## Engineering rule

- AI judges meaning, significance, novelty, relevance, summary, opportunity, risk, and follow-up.
- Code handles deterministic operations such as dates, URL normalization, counts, scoring arithmetic, sorting, persistence, idempotency, and scheduling.
- Prefer `Reuse → Extend → Refactor → Rewrite`.
- Treat changes to event types, provider interfaces, scoring models, database schema, IDs, and API response shapes as architecture-sensitive changes.
- Mock data must never be presented as real production intelligence.

## Pull requests

Feature work should be merged through a PR. Each PR should explain:

- What changed
- Why
- Files changed
- Architecture impact
- Known limitations
- Next step

When instructions conflict, Grei's explicit current request has highest priority, followed by this file and the linked project documents.
