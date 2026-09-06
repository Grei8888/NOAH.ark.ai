# NOAH Intelligence v0.1

투자자 시연판: 서울 신사역 행정사 사무실의 업무 맥락을 반영합니다. 공개 Mock 보고서에 수집→통합→선별 흐름, 고객 유형별 상담 준비 예시, 사업 모델 가설과 향후 검증 항목을 표시합니다. 실제 고객·매출·시간 절감 성과를 주장하지 않습니다. 서울권 가상 사례를 사용하며 원문·지원요건을 확인한 실제 뉴스가 아닙니다.

**Only What Matters.** 많은 기사를 실제 세계의 변화(Event)로 통합하고 중요성과 개인 관련성을 평가하여, 하루 최대 10개의 변화만 **Today's Ark**에 담는 애플리케이션입니다.

## 실행 결과와 범위

API 키 없이 실행할 수 있습니다. 기본 Mock 흐름은 **32 Raw Articles → 중복 관계 2건 → 30 유효 기사 → 10 Events → 8 Ark Items**입니다. 가상 자료는 화면에 명시하고 가짜 원문 링크는 클릭할 수 없게 표시합니다. 실제 뉴스로 오해할 수 있는 데모를 제공하지 않습니다.

공개 페이지 `/`, `/ark/YYYY-MM-DD`, `/event/ID`, 비공개 관리자 `/admin`, 수동 파이프라인 API와 Cron 경로가 포함됩니다. 외부 배포, 실제 뉴스 계정 및 OpenAI 키 설정은 별도 운영 환경이 필요합니다.

## Architecture / Stack

- Next.js App Router, React, TypeScript, CSS
- Prisma 6 + PostgreSQL (운영), 동일 모델의 SQLite (키 없는 로컬 실행)
- Luxon: Asia/Seoul 기준 시간 계산
- Zod + OpenAI Responses API Structured Outputs
- Vitest + ESLint + TypeScript

단일 애플리케이션이며 UI와 도메인 로직을 분리합니다. 별도 마이크로서비스가 없습니다. Tailwind는 필수가 아니므로 스타일은 단일 CSS로 유지합니다.

```text
Provider → normalize → exact duplicate relations → cluster → Event
  → schema-validated analysis → code scoring → rank → immutable DailyArk
```

`prisma/schema.prisma`가 PostgreSQL 기준 원본입니다. `scripts/local-schema.mjs`가 공급자와 출력 경로만 바꾼 로컬 스키마를 생성합니다. 배열형 필드는 두 DB에서 공통 지원하는 JSON을 사용합니다. 향후 PostgreSQL pgvector 테이블을 추가할 수 있습니다.

## Install / Mock mode

Node.js 22.12 이상과 pnpm을 사용합니다. Node 24에서 검증했습니다.

```sh
pnpm install
pnpm run setup:mock
pnpm run dev
```

[로컬 앱](http://127.0.0.1:3000)을 엽니다. `setup:mock`은 `.env`가 없으면 생성하고 256-bit 랜덤 관리자·Cron 비밀키를 설정합니다. 기존 `.env`와 기존 레코드는 덮어쓰지 않습니다. 로컬 DB는 `prisma/noah.db`입니다.

평일 07:00 기준 최신 날짜에 Ark를 만듭니다. 주말에는 직전 금요일 보고서가 나타납니다. 예를 들어 2026-09-05 토요일 실행 결과는 `/ark/2026-09-04`입니다.

## Environment

### 기본 관심 분야 (business-v2)

행정사 실무(LH 매입약정·주거복지, 외국인근로자·비자, 외국인투자유치, 외국인환자·의료관광), 스타트업·창업, AI·Physical AI, 정부지원사업·정책자금·R&D를 기본으로 합니다. 연구·교육 카테고리는 유지하지만 기존 뇌과학 검색어는 기본 자동수집에서 제외합니다.

기존 DB에도 적용하려면 `pnpm run defaults:apply`를 실행합니다. 일반 Seed는 개인 수정사항을 보존하므로 이 명시적 명령을 사용합니다. 기존 프로필과 활성 검색어를 `AppConfig`에 백업하고, 운영자 프로필과 활성 검색어를 현재 기본값으로 교체합니다. 과거 Ark는 변경하지 않습니다.

`pnpm run demo:refresh`는 새 로컬 Mock DB에 변경된 시나리오를 생성하고 성공한 뒤 `.env`의 로컬 DB 경로를 전환합니다. 이전 DB와 환경 파일 백업은 보존합니다. 실행 중인 서버는 재시작해야 새 DB 연결을 사용합니다. 실제 뉴스나 법령 변경을 의미하지 않는 가상 시나리오입니다.

`.env.example` 참고. 실제 `.env`, SQLite DB와 생성된 테스트 데이터는 Git에서 제외됩니다.

| 변수 | 용도 |
| --- | --- |
| `DB_MODE` | `local` 또는 `postgres` |
| `DATABASE_URL` | PostgreSQL 연결 URL |
| `LOCAL_DATABASE_URL` | 선택적 SQLite URL. 기본 `file:./noah.db` |
| `NEWS_PROVIDER` | `mock`, `newsapi`, `rss`, `government` |
| `AI_PROVIDER` | `mock` 또는 `openai` |
| `OPENAI_API_KEY` | 실제 AI 분석에 필요 |
| `OPENAI_MODEL` | Structured Outputs 지원 모델, 기본 `gpt-4.1-mini` |
| `NEWS_API_KEY` | NewsAPI 사용 시 필요 |
| `RSS_FEEDS` | 쉼표로 구분한 HTTPS RSS 2.0 피드 URL |
| `ADMIN_SECRET` | 관리자 로그인 키, 최소 24자 |
| `CRON_SECRET` | Cron Bearer 키, 최소 24자 |
| `APP_URL` | 실제 접속 origin. 로컬 기본 `http://127.0.0.1:3000` |

`localhost`와 `127.0.0.1`은 다른 origin입니다. 관리자 로그인은 `APP_URL`과 같은 주소에서 해야 합니다. HTTPS 배포에서는 secure cookie가 적용됩니다. 키는 공개 HTML, 클라이언트 번들, 로그에 기록하지 않습니다.

## Database / Prisma / Seed

로컬:

```sh
pnpm run db:generate
pnpm run db:local
pnpm run db:seed
```

PostgreSQL:

1. `.env`의 `DB_MODE=postgres`, `DATABASE_URL`을 운영 DB에 맞게 설정합니다.
2. 선택적으로 Docker Compose를 사용합니다. `.env`에 `POSTGRES_PASSWORD`를 설정하고 `docker compose up -d`를 실행합니다. 연결 URL의 암호도 동일하게 설정합니다.
3. `pnpm exec prisma migrate deploy`로 제공된 초기 마이그레이션을 적용합니다.
4. `pnpm run db:seed`를 실행합니다.

새 스키마 변경은 `prisma migrate dev`로 마이그레이션을 작성하고 검토한 뒤 배포합니다. 운영 DB에 `db push`를 사용하는 대신 버전 관리된 마이그레이션을 적용합니다.

Seed: Grei OWNER, 비공개 관심 프로필, Mock 출처, 검색어 Registry, Mock 설정. 반복 실행해도 기존 프로필 수정사항은 유지합니다. 출처 분류는 실제 사이트 등록 시 관리자가 검증해야 합니다.

## News Provider

`lib/news/providers.ts`의 `NewsProvider` 인터페이스로 공급원을 교체합니다.

- Mock: 카테고리 7종, 정부자료, 복수 출처, URL·제목 중복, 낮은 중요도 자료 포함.
- NewsAPI: 중앙 검색어 테이블을 순회하며 날짜 범위와 제목·짧은 설명만 저장합니다. 한국어는 제공자 language 필터 제한 때문에 검색어로 검색합니다. 100건 초과 쿼리는 누락된 수집으로 발행하지 않고 오류로 남깁니다. 쿼리나 범위를 좁혀야 합니다.
- RSS: `RSS_FEEDS`의 RSS 2.0 피드. 공개일 없는 항목은 건너뜁니다. HTML을 제거하고 설명을 제한합니다.
- Government: 공식 RSS URL용 어댑터. 피드와 다른 호스트로 연결되는 항목에는 공식 출처 지위를 부여하지 않습니다. 운영자가 공식 피드 여부를 확인해 설정해야 합니다.

원문 전문을 수집하지 않습니다. `rawPayload`에도 전체 공급자 응답을 넣지 않고 최소 출처 정보만 저장합니다. `description` 500자, snippet 700자로 제한합니다. 공급자 조건에 맞는 추가 축약이 필요할 수 있습니다.

## AI / OpenAI

실제 기사에는 `AI_PROVIDER=openai`와 키가 필요합니다. 키가 없거나 분석이 실패하면 Event를 `FAILED`로 남겨 재처리할 수 있고, 가상 분석으로 실제 뉴스를 조용히 대체하지 않습니다.

공식 [Structured Outputs 안내](https://developers.openai.com/api/docs/guides/structured-outputs)에 따라 SDK의 `responses.parse`와 `zodTextFormat`을 사용합니다. 자유형 JSON 파싱이 아닙니다. 숫자 min/max를 Zod로 검증하고 대표 기사·공식 자료 우선 최대 4건만 보냅니다. 타임아웃과 제한된 재시도, 저장 비활성화(`store:false`)를 설정했습니다.

FACT는 핵심 사실, INTERPRETATION은 중요성·위험 해석, USER IMPLICATION은 개인 추론으로 분리합니다. 근거가 없으면 ‘확인 필요’를 반환하도록 지시합니다. 입력 기사는 비신뢰 데이터로 취급합니다. 이 프롬프트는 사실 검증을 보장하지 않으므로 실제 운영에서는 분석 품질을 검토해야 합니다.

근거 해시와 분석 버전·모델·프로필 해시가 같은 Event는 재분석하지 않습니다. 단순 복제 출처의 동일 설명은 새 정보로 보지 않습니다. 구조화된 분석 점수 합산과 등급은 코드에서 처리합니다.

## Pipeline

```sh
pnpm run pipeline
pnpm run pipeline collect
pnpm run pipeline process
pnpm run pipeline generate-ark
pnpm run pipeline full 2026-09-04
pnpm run pipeline breaking
```

Collect는 수집·정규화·완전중복 관계 저장, Process는 Event 통합·분석·점수 갱신, Generate Ark는 분석 완료 Event의 일별 스냅샷 저장, Full은 전체 단계입니다.

일별 기준 시각은 KST 07:00이며 수집 범위는 **[전날 07:00, 당일 07:00)** 입니다. 미래의 미완료 기간은 발행할 수 없습니다. 수집이나 분석 오류가 있으면 새 Ark 발행을 중단하고 기존 발행본을 보존합니다. 단독 Generate Ark도 미완료 분석이 남아 있으면 거부합니다.

`ingestionKey`, Event fingerprint, `arkDate`, Ark rank/Event 제약으로 재실행 중복을 방지합니다. 중복 Article은 `duplicateOfId`를 유지합니다. 수집 후 크래시가 발생해도 저장된 데이터를 다시 처리할 수 있습니다. `PipelineLock`은 모든 수동/Cron 작업을 직렬화하고, 20초마다 갱신하는 2분 lease로 중단된 실행을 복구합니다.

DailyArk는 발행 이후 변경하지 않습니다. ArkItem에 당시 공개 분석을 저장합니다. `/event/ID`는 현재 완료된 분석을 표시하므로 과거 Ark 카드와 이후 갱신된 상세 분석은 다를 수 있습니다.

## Scoring

`lib/scoring/config.ts`에서 최종 가중치(0.65/0.35), 등급 경계, Ark 최소 60점·최대 10개·카테고리 최대 4개, 최근성 최대 2점, 긴급 기준을 관리합니다.

중요도: AI의 5개 판단 + 코드의 출처 신뢰도·실제 출처/기사/시간당 보도수 기반 spread. 관련성: 프로필에 대해 생성한 7개 항목을 합산합니다. Mock에서는 입력 프로필과 키워드를 비교하여 결정론적으로 계산합니다. Mock 점수는 실제 전문가 평가가 아닙니다.

동일 주제라도 ‘발표’와 ‘모집/공고’, ‘시행’ 등 변화 단계를 구분하고, 48시간을 넘긴 유사 기사는 별도 Event로 분리합니다. 관련 Entity와 제목 token 유사도를 함께 사용합니다.

## Cron

`vercel.json`:

- Daily: `0 22 * * 0-4` UTC = 월~금 07:00 KST
- Breaking: `5 * * * *` UTC = 매시간 5분

`GET /api/cron/daily`, `GET /api/cron/breaking`에 `Authorization: Bearer <CRON_SECRET>`이 필요합니다. Daily 경로는 서버에서도 평일 KST 07시 시간대를 검사합니다. 스케줄러의 실행 빈도·최대 실행 시간은 배포 요금제와 설정을 확인해야 합니다. 이 저장소의 설정만으로 로컬 PC에 예약 작업이 설치되지는 않습니다.

Breaking은 최근 24시간을 재검사해 이미 수집된 Event의 새 근거를 평가합니다. 긴급점수 ≥80, 관련성 ≥60, 새 근거를 충족한 후보만 DB에 저장합니다. 근거 해시를 unique 키로 사용하여 중복 후보를 막습니다. 알림 전송은 없습니다.

## Admin / Privacy

`/admin`에서 `.env`의 `ADMIN_SECRET`으로 로그인합니다. 키가 없으면 기본 거부합니다. 8시간 HMAC 서명 HttpOnly 세션, SameSite Strict, origin 검사, timing-safe secret 비교를 사용합니다.

수집·처리·Ark 생성·전체 실행 버튼과 최근 로그, 실패 사유, Event 분석 상태, 점수, 긴급 후보를 확인합니다. Grei 프로필과 `userImplication`, 관련성 세부점수는 공개 DTO에서 제외합니다. 개인 관련성은 관리자에서만 제공합니다. v0.1은 단일 OWNER 로그인 방식이며 다중 사용자 인증은 미구현입니다.

## Testing / Build

```sh
pnpm run verify
# 또는 typecheck / test / lint / build 개별 실행
pnpm run start
```

Unit tests: URL·제목 정규화, 완전중복 관계, Event 통합/분리, 중요도·관련성·최종 점수, 등급 경계, spread, 카테고리 다양성, KST 범위, 공개 DTO, 인증, 근거 해시.

DB 통합 테스트는 `.noah/test-UUID.db`에 별도 SQLite를 만들며 앱 DB를 초기화하지 않습니다. 전체 흐름, 재실행 시 분석 0회, 일별 스냅샷 불변, 동시 실행 거부, 실패 분석 재처리, 공급자 실패 시 기존 Ark 보존을 검증합니다. 테스트 DB는 디버깅용으로 남으며 Git에서는 제외합니다.

## Deploy

Vercel 또는 Node.js 호스팅에 배포할 수 있는 Next.js 서버 앱입니다. 정적 사이트 export로는 관리자·DB·Cron 기능을 제공할 수 없습니다.

1. PostgreSQL 준비 및 `migrate deploy`, Seed 실행.
2. 호스팅 환경에 `.env.example`의 변수를 설정. 운영에서는 `DB_MODE=postgres`로 설정. SQLite 파일은 서버리스 영속 저장소로 사용하지 않습니다.
3. `pnpm install --frozen-lockfile` 및 `pnpm run build`. 서버 환경에서 Prisma Client가 생성됩니다.
4. Vercel에 저장소 연결 또는 Node 호스트에서 `pnpm run start` 실행. 외부 프록시가 같은 호스트에 없으면 start의 hostname 옵션을 호스팅 구성에 맞게 변경합니다.
5. 실제 도메인을 `APP_URL`에 설정하고 Cron Bearer 비밀키·실행 시간 설정.
6. 로그인 차단, 관리자 작업, 실제 공급원 소량 수집·분석을 검증한 후 공개합니다.

현재 환경에서 외부 호스팅 계정과 운영 PostgreSQL 연결은 제공되지 않았으므로 원격 배포는 수행하지 않았습니다. Sites 초기화 도구는 패키지 누락으로 실패했고, Sites의 Worker 런타임은 현재 Prisma Node 엔진/직접 PostgreSQL 구조를 그대로 실행하지 못하므로 불완전한 정적판을 배포하지 않았습니다.

## Known limitations

- 실제 NewsAPI/RSS/OpenAI 네트워크 실행과 운영 PostgreSQL 서버 검증에는 계정·연결 설정이 필요합니다. Mock + SQLite 경로를 검증했습니다.
- 클러스터링은 보수적인 문자열·Entity 규칙이며, 동의어·주제 경계는 오분류할 수 있습니다. Embedding/LLM 병합 판정은 후속 단계입니다.
- 출처 신뢰도는 sourceType 기본값입니다. 독립 출처 수는 호스트명 기준이며 언론사 소유관계까지 판별하지 않습니다.
- RSS 2.0만 지원합니다. Atom·페이지네이션·피드별 cursor는 후속 단계입니다.
- 순차 분석이 많으면 서버리스 시간제한에 도달할 수 있습니다. 이때 Process를 재실행하면 완료된 근거 해시를 건너뛰어 재개합니다. 운영 전 검색어 수와 실행 제한을 맞추어야 합니다.
- 수집원 장애로 실패한 실행은 로그에 남습니다. 다음 정상 실행이나 수동 실행이 필요하며 별도 외부 알림은 없습니다.
- 대형 국가 사건의 카테고리 4건 예외는 자동 적용하지 않습니다.
- Mock 자료는 날짜마다 같은 시나리오를 재사용합니다. 장기 실행 데이터로 뉴스의 신규성을 평가하면 안 됩니다. Live 전환에는 별도 빈 운영 DB를 권장합니다.
- OpenAI를 사용할 때 비공개 프로필이 분석 컨텍스트로 API에 전달됩니다. 공개 화면에는 전달하지 않습니다.
- 프로덕션 빌드에서 Prisma 6 생성 코드에 대한 Turbopack 파일 추적 경고가 날 수 있습니다. `.env`, 테스트 DB, Git과 로컬 DB는 배포 추적에서 제외합니다.

## Roadmap

검증된 공식 공고 피드, 수집 cursor와 pagination, embedding 기반 경계 보완, 출처 신뢰도 편집 UI, 분석 비용·토큰 기록, 다중 사용자 프로필과 MY ARK, 북마크/팔로우, 의미 기반 긴급 업데이트 비교, 사용자 피드백. 결제·댓글·SNS·Push는 v0.1 범위에 포함하지 않습니다.
