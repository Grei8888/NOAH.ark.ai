# NOAH Intelligence v0.1

**Only What Matters.**

NOAH는 정보의 홍수 속에서 사용자가 반드시 알아야 할 변화만 선별하는
Event 중심의 개인 Intelligence 서비스입니다.

## 핵심 흐름

INFORMATION FLOOD → SIGNAL DETECTION → EVENT → SIGNIFICANCE → PERSONAL RELEVANCE → ARK → INTELLIGENCE → ACTION

`Today's Ark`는 하루 동안 수집된 기사 중 중복·유사 기사를 사건(Event) 단위로 묶고,
중요도와 사용자 관련성을 평가해 최종적으로 살아남은 핵심 Event 묶음입니다.

## 현재 v0.1

이 저장소는 **Mock-first Vertical Slice**입니다.

- Mock 뉴스 수집
- 제목/URL 정규화
- Event 단위 데이터 모델
- Importance / Relevance / Final Score
- 등급
- Category diversity를 고려한 Today's Ark
- 메인 페이지
- Event 상세 페이지
- 관련 기사 / 원문 링크
- JSON API
- 향후 News API / RSS / 정부자료 / OpenAI / PostgreSQL 연결을 위한 인터페이스

Mock 데이터만으로 바로 실행됩니다.

## 실행

```bash
npm install
npm run dev
```

브라우저:

```text
http://localhost:3000
```

## 환경변수

`.env.example`을 `.env.local`로 복사합니다.

현재 Mock 모드에서는 API Key가 필요하지 않습니다.

```env
NEWS_PROVIDER=mock
```

## 주요 경로

```text
/
Today's Ark

/event/[id]
Event 상세

/api/ark
Today's Ark JSON
```

## 구조

```text
app/
components/
lib/
  domain/
  news/
  scoring/
  ark/
types/
```

## 다음 구현 단계

1. 실제 한국 뉴스 Provider
2. 정부·공공기관 공식자료 Provider
3. Event clustering
4. OpenAI Structured Output 분석
5. PostgreSQL / Prisma
6. 일별 Ark 영속화
7. Cron
8. 관리자 화면
9. Breaking Intelligence

## 중요한 설계원칙

- Article과 Event를 분리합니다.
- AI는 판단하고 코드는 계산합니다.
- 기사 전문을 재게시하지 않습니다.
- 뉴스 숫자를 늘리기보다 판단 비용을 줄입니다.
- 10개를 억지로 채우지 않습니다.

> 이 기능이 정보의 홍수를 줄이는가, 아니면 다시 늘리는가?
