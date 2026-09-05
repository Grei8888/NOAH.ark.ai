# Next Steps

## 1. Real Provider Layer

한국 뉴스는 단일 API에 의존하지 않는다.

예정:
- 뉴스 검색 API
- RSS
- 정부/공공기관 공식자료

## 2. Event Clustering

v0.1 Mock 이후:
- normalized title
- key entities
- embeddings
- ambiguous pair AI decision

## 3. AI Structured Output

OpenAI Responses API + JSON Schema 기반.
자유형 JSON 파싱 금지.

## 4. Database

PostgreSQL을 연결한 뒤 다음 핵심 테이블을 추가:
- users
- user_profiles
- news_sources
- articles
- events
- event_articles
- event_scores
- daily_arks
- ark_items
- breaking_alerts
- pipeline_logs

## 5. Scheduler

평일 07:00 KST 발행.
시간 계산과 scheduler timezone을 분리해서 관리.

## 6. Breaking Intelligence

매시간 Event의 새로운 사실과 확산속도를 평가.
단순 기사량 증가만으로 긴급 알림을 만들지 않는다.
