# NOAH Intelligence — Collaboration Rules

## 1. Purpose

This document defines how Grei, Codex, and ChatGPT collaborate on the same NOAH Intelligence repository without overwriting or confusing each other's work.

GitHub is the single source of truth for the current codebase.

Repository:

`Grei8888/NOAH.ark.ai`

Session memory, deployment screenshots, generated previews, and prior conversations are useful context, but they do not override the latest GitHub state.

## 2. Roles

### Grei — Product Owner

Responsibilities:

- product direction
- priorities
- final product decisions
- business model
- user experience direction
- approval of major architecture changes

### Codex — Developer A

Primary strengths and default responsibilities:

- large code implementations
- multi-file feature development
- backend and database work
- API integrations
- refactoring
- testing
- performance and reliability work

### ChatGPT — Developer B / Architect / Reviewer

Primary responsibilities:

- product and architecture design
- feature definition
- UI/UX changes
- intelligence and scoring logic
- code review
- small and medium implementation work
- GitHub modifications
- integration review of Codex work

These roles are defaults, not hard boundaries. Either coding agent may implement any task when Grei requests it.

## 3. Branch model

`main` is the stable integration branch.

Use the following branch prefixes:

- Codex: `codex/<feature-name>`
- ChatGPT: `chatgpt/<feature-name>`

Examples:

- `codex/real-news-provider`
- `codex/event-clustering`
- `chatgpt/scoring-update`
- `chatgpt/mobile-ui`

Feature development should normally happen on a feature branch and be merged through a Pull Request.

Direct commits to `main` should be limited to:

- trivial documentation-only changes
- emergency fixes
- cases where Grei explicitly requests direct integration

## 4. Mandatory preflight check

Before modifying code, the agent must check:

1. latest `main` commit
2. recent commit history
3. active branches
4. relevant open Pull Requests
5. latest version of every file that will be modified
6. whether another branch is changing the same architecture area

Do not edit a file solely from memory of an earlier session.

If the file changed after the task began, read it again before writing.

## 5. Same-file conflict rule

If Codex and ChatGPT may touch the same file:

1. inspect the newest GitHub version
2. inspect relevant branch or PR changes
3. identify whether the changes are compatible
4. preserve the other agent's valid changes
5. reconcile before committing

Never replace an entire file with an older remembered version.

## 6. Architecture-sensitive areas

Changes in these areas require impact review before implementation:

- `types/news.ts`
- Event data model
- Article/Event relationship
- Event ID rules
- scoring model
- News Provider interface
- API response structure
- Prisma schema / database tables
- persistence model
- scheduler semantics
- authentication or user-profile model

When modifying these areas, identify dependent files and backward-compatibility risks first.

## 7. Engineering change strategy

Prefer the smallest safe change that satisfies the product requirement.

Priority order:

`Reuse → Extend → Refactor → Rewrite`

Avoid unnecessary full-file rewrites or broad restructuring unless the existing design blocks the requested feature.

## 8. AI vs Code boundary

AI should judge semantic properties such as:

- meaning
- classification
- impact
- novelty
- significance
- relevance
- summary
- opportunity
- risk
- follow-up

Code should handle deterministic operations such as:

- date logic
- URL normalization
- exact deduplication
- counts
- score arithmetic
- grade rules
- sorting
- storage
- idempotency
- scheduling

If this boundary changes, document why.

## 9. Mock and production separation

Mock data must be clearly separated from production data.

Rules:

- Mock Events must not silently appear as real intelligence.
- Production pipelines must not mix Mock records into live Ark results.
- Demo notices should be removable automatically when production mode is enabled.
- Source URLs in production must be real and traceable.

## 10. Provider strategy

NOAH should not depend on one news API.

Provider architecture should support multiple source classes, including:

- news search APIs
- RSS
- government sources
- public agencies
- corporate primary sources
- research sources

Provider implementations should remain replaceable behind a stable interface where possible.

## 11. Official-source rule

For policy, regulation, government programs, public projects, and administrative procedures:

- use reporting for signal discovery
- use official sources for factual confirmation whenever available
- distinguish proposals, discussions, announcements, and legally effective changes

Do not present a media report as a finalized rule when the official source has not confirmed it.

## 12. Scoring governance

Current v0.1 scoring baseline:

- Importance weight: 0.65
- Relevance weight: 0.35
- Ark minimum Final Score: 60
- Maximum Ark Events: 10
- Maximum Events per primary category: 4

These are product parameters, not immutable truths.

When changing them:

1. state the product reason
2. note expected behavior change
3. preserve separate Importance and Relevance concepts unless deliberately redesigning the model
4. document any migration or compatibility impact

## 13. Commit conventions

Use purpose-oriented commit messages.

Examples:

- `feat: add real news provider interface`
- `feat: add event clustering pipeline`
- `fix: prevent duplicate event sources`
- `refactor: separate scoring from event analysis`
- `docs: update collaboration workflow`

Avoid vague messages such as `update files` when a more precise message is possible.

## 14. Pull Request requirements

Each feature PR should contain at least:

### What changed

Short summary of the implementation.

### Why

Product or technical reason for the change.

### Files changed

Main files and modules affected.

### Architecture impact

Interfaces, schemas, scoring, persistence, or API impact.

### Known limitations

Anything intentionally incomplete or deferred.

### Next step

Recommended follow-up work.

## 15. Merge and review rule

Before merging:

- compare the branch against current `main`
- confirm no newer conflicting work has landed
- review architecture-sensitive changes
- run available build/tests where practical
- confirm Mock/Production behavior remains explicit

If `main` moved substantially during development, rebase or reconcile before merge rather than forcing stale changes over it.

## 16. Deployment mismatch rule

A deployed preview may not represent the current GitHub `main` branch.

When deployment and repository differ:

1. do not guess which is authoritative
2. identify the source branch or commit behind the deployment when possible
3. treat GitHub `main` as the code baseline unless Grei explicitly designates another version
4. reconcile the desired deployed behavior back into version-controlled code

## 17. Documentation structure

Project knowledge is organized as follows:

- `README.md` — what the repository currently is and how to run it
- `AGENTS.md` — mandatory instructions for coding agents
- `docs/PRODUCT_PRINCIPLES.md` — why NOAH exists and what product decisions should optimize
- `docs/ARCHITECTURE.md` — current technical architecture
- `docs/COLLABORATION_RULES.md` — how multiple coding agents work safely
- `docs/NEXT_STEPS.md` — implementation roadmap
- `docs/CHANGELOG.md` — meaningful project changes and architecture decisions

## 18. Final decision test

Before implementing or approving a feature, ask:

1. Does this reduce information overload or add noise?
2. Are we modeling a real Event rather than just displaying Articles?
3. Does the result help the user decide what matters or what to do next?
4. Is AI doing semantic judgment and Code doing deterministic computation?
5. Does this preserve the work of other agents and the current GitHub truth?

## Core principle

**LESS NEWS. MORE SIGNAL. BETTER DECISIONS.**
