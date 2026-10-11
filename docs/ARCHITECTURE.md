# NOAH Architecture

## Principle

Article은 문서이고 Event는 현실의 변화다.

사용자 화면의 기본 단위는 Event다.

## Pipeline

1. Collect
2. Normalize
3. Exact Deduplicate
4. Similarity / Event Clustering
5. AI Event Analysis
6. Objective + AI Scoring
7. Final Score
8. Diversity Ranking
9. Today's Ark
10. Persist / Publish

## AI vs Code

AI:
- 의미
- 분류
- 영향
- 신규성
- 사용자 관련성
- 요약
- 기회/위험/후속행동

Code:
- 날짜
- URL 정리
- count
- velocity
- 점수 합산
- grade
- 정렬
- 저장
- idempotency

## Public vs Personalized

향후 공개 홈의 Global Significance와
개인 MY NOAH의 Personal Relevance를 분리한다.

v0.1은 Owner Profile 기반 Personal Relevance 개념을 사용하지만
프로필 자체는 공개하지 않는다.

## Recovered runtime integration — 2026-10-11 (review branch)

Canonical Node/Next runtime ports only audited modules from recovery commit `a700e8b`.
PostgreSQL is the production schema; a generated SQLite schema supports explicitly labeled local mock QA.
No production migration has been applied. Generated clients and runtime DBs are ignored.

Shared analysis uses `PUBLIC_PROFILE` (empty signals), never `grei`. Public discovery uses
Importance as its selection score (minimum 60, max 10, cap 4); 65/35 personal arithmetic
remains available separately and is not redefined as a universal owner score.
Public DTO grades represent significance. Legacy Event relevance/final fields remain for
schema compatibility and are not passed into consumer Home as user relevance.
Consumer-auth and per-user persisted scoring are not part of this integration.

`NEWS_PROVIDER` + `AI_PROVIDER` must explicitly agree. Queries, clustering and published
reads are partitioned by mock/live. Reusing a date already published in another mode
fails; deploy demo and production with separate databases. Live collection failures
preserve existing publication and never silently fall back to mock.

`/api/ark` now returns a public `Edition`: service, mode (`mock`/`live`), date,
publishedAt and source-attributed PublicEvent items. This intentionally replaces the
old nonpersisted NoahEvent response; source consumers must adopt the new DTO.
`/event/[id]` reads immutable publication snapshots, not mutable in-progress analysis.
Admin HMAC sessions are distinct from consumer identity; admin and cron routes fail
closed without strong configured secrets. No scheduler is activated by this PR.

The heuristic clustering baseline is not a claim of semantic precision. An explicitly
configured official feed allows official-source metadata only for same-host links;
this does not certify eligibility, legal effectiveness, content correctness or rights.
