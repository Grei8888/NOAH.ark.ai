# NOAH ARK · 기존 /beta 피드백을 Google 시트로 바로 수집하기

**목표:** 기존 '전반적인 사용 경험 / 좋았던 점 / 불편하거나 개선할 점' 입력창에서 **한 번만** '피드백 보내기'를 누르면 Google Sheets에 실제 행으로 저장된다. 테스터에게 다른 폼을 보여주거나 카카오톡 수신자를 선택하게 하지 않는다.

## 현재 준비된 파일
- Google Sheets (소유 계정: grei3888@gmail.com): https://docs.google.com/spreadsheets/d/17xpdwM6loH6A_a9lFIerjMFZqWVQjqcwa5g-AA5FUgM/edit
  - '개선 관리' 및 '운영 안내'는 이미 만들어 둔 관리자 탭.
  - '피드백 원본'은 **첫 실제 접수 시 스크립트가 자동 생성**한다.
- Apps Script 코드: `scripts/feedback/NOAH_Beta_Receiver.gs` (이 저장소)
- 서버 접수 API: `app/api/beta/feedback/route.ts`
- 기존 UI: `components/beta/BetaTesterKit.tsx`

## 최초 1회, 소유자 설정 (5~10분)
1. 위 **Google Sheets**를 grei3888@gmail.com 계정으로 연다.
2. 상단 **확장 프로그램 → Apps Script**. 자동으로 생성된 `Code.gs` 내용을 지우고 저장소의 `scripts/feedback/NOAH_Beta_Receiver.gs`를 붙여 넣고 **저장**한다. 코드에 시트 ID가 이미 설정되어 있다.
3. Apps Script **프로젝트 설정 → 스크립트 속성**에 `NOAH_FEEDBACK_SECRET`를 추가하고, 추측하기 어려운 무작위 문자열(32자 이상)을 입력한다. **값을 채팅이나 GitHub에 붙여 넣지 않는다.**
4. **배포 → 새 배포 → 유형: 웹 앱**. '실행 사용자: 나', '액세스 권한: 모든 사용자'를 선택하고 Google의 권한 승인을 완료한다. URL은 `https://script.google.com/macros/s/.../exec` 형태여야 한다.
5. Vercel 프로젝트 `noah-ark-ai`의 **Settings → Environment Variables**, **Production**에 아래 두 개를 등록한다.
   - `NOAH_FEEDBACK_SCRIPT_URL`: 4단계에서 복사한 `.../exec` URL
   - `NOAH_FEEDBACK_SCRIPT_SECRET`: 3단계에서 만든 **같은** 무작위 문자열
   두 값은 서버 전용 환경변수이며 `NEXT_PUBLIC_` 접두어를 사용하지 않는다.
6. 연결된 새 버전을 운영 환경에 **재배포**한다. 환경변수를 저장하는 것만으로 기존 배포의 코드/환경이 자동 갱신되지는 않는다.
7. `https://noah-ark-ai.vercel.app/beta`에서 시험: 닉네임(선택), 점수/의견 입력 → '피드백 보내기' 한 번 클릭 → **실제 Google 시트의 '피드백 원본' 탭에 1개 행이 기록되었는지 직접 확인**한다. 테스트 접수는 시트에서 제거해도 된다.
8. 성공한 경우에만 테스터 초대. 같은 테스터가 언제든 다시 제출할 수 있다.

## 정상 화면
- 자동 저장 연결 *전*: 기존 '피드백 공유하기', '내용 복사'가 보존되므로 가짜 저장 완료를 표시하지 않는다.
- 연결 *후*: '피드백 보내기'로 변경. 별도 Google Form, 새 페이지, Google 로그인, 파일 업로드, 이메일 입력 **없음**.
- 접수가 확인되면 '의견이 접수됐습니다...'가 나온다. 저장/연결 실패 시에는 적어 둔 의견을 지우지 않는다.
- 닉네임만 테스터 기기의 localStorage에 선택적으로 보관한다. Google 시트에는 접수일시/닉네임/점수/좋았던 점/개선 의견/제출 ID가 누적된다.

## 중요한 운영상 사실
- 이 구조는 **Google Forms 설문 페이지를 사용하는 것이 아니라 Google Sheets를 직접 접수함**. 기존 NOAH 화면 자체가 의견 입력 양식이므로 별도 Forms를 만들 필요가 없다.
- **관리 시트를 테스터와 공유하지 마세요.** 공개는 `/beta` 링크 하나만.
- 익명 접수, 별도 계정 생성 불필요. 닉네임은 사용자 스스로 작성한 별칭이며 실제 신원 증명이 아니다.
- Google Apps Script의 무료 실행 한도와 Vercel Hobby 비상업적 이용 제한을 준수해야 한다.
- 서버에만 둔 secret으로 익명 요청이 스프레드시트로 무단 직접 전송되는 것을 막되, Vercel 엔드포인트는 **공개**이므로 스팸 가능성이 0은 아니다. Apps Script의 10분당 제출 수, 하루 총량, 동시 실행 잠금과 중복 제출 ID를 제한한다. 대규모 공개 전에는 추가 봇 방어가 필요하다.
- 독립적인 상시 백업이 아니라 해당 시트에 누적한다. 개인정보·의료 정보·비밀번호·정부기사 전문을 입력받지 않는다. 운영자가 필요 없어진 의견을 삭제할 수 있게 데이터 최소화 원칙을 지킨다.
- 비용: 별도 유료 AI / DB / 서드파티 폼 구독 없음. 기존 사용자 월 총예산 5만원 미만 유지.

## 고장 확인
- 계속 '피드백 공유하기'로 보이면 Vercel 환경변수가 누락됐거나 새 Production 배포가 적용되지 않은 것.
- 클릭했는데 오류면 Script Web App의 권한/URL/배포판/secret이 일치하는지 확인한다. **프런트엔드 성공 표시만으로 접수를 증명하지 말고 실제 시트 행 확인까지** 한다.
- Apps Script 수정 시에는 업데이트한 코드가 반영되도록 **배포 관리 → 편집 → 새 버전**으로 배포한다.
- 위 URL이나 보안키는 public GitHub, Next.js 번들, 클라이언트 로그에 절대 포함하지 않는다.
