# NOAH Intelligence — Changelog

This file records meaningful product, architecture, and collaboration changes. It is not intended to duplicate every Git commit.

## 2026-09-06 — Multi-agent collaboration governance

### Added

- Root `AGENTS.md` for mandatory coding-agent startup instructions.
- `docs/PRODUCT_PRINCIPLES.md` to define NOAH's Event-centered product philosophy.
- `docs/COLLABORATION_RULES.md` to define Grei / Codex / ChatGPT collaboration, branch ownership, preflight checks, conflict handling, PR rules, and architecture-sensitive areas.
- Documentation structure linking product principles, architecture, collaboration, roadmap, and change history.

### Governance decision

GitHub `main` is the stable integration branch and single source of truth.

Default feature branches:

- Codex: `codex/<feature-name>`
- ChatGPT: `chatgpt/<feature-name>`

Feature work should normally be merged through Pull Requests.

### Product principle reaffirmed

NOAH is an Event-centered intelligence system designed to reduce information overload and decision cost, not maximize article volume.

## 2026-10-11 — Audited recovered runtime (Issue #6, pending review)

Selectively ported provider/normalize/dedupe/cluster/structured analysis/scoring,
Prisma persistence, pipeline lease and admin/cron boundaries. Removed shared owner
profile dependency; isolated live and mock publications. Added mode/read/snapshot
regressions. Kept archived investor and D1 prototypes untouched. Design documents
from draft PR #5 are included as the implementation reference, not merged approval.
