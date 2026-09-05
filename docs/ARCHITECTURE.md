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
