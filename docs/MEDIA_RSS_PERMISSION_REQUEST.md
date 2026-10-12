# NOAH ARK — media RSS metadata-use permission request (DRAFT; NOT SENT)

2026-10-12. Owner review and publisher authorization required. This draft **does not** assert that any outlet has approved automated indexing or AI reuse.

## Why this request is necessary

NOAH ARK currently runs a noncommercial public beta at https://noah-ark-ai.vercel.app/ using original official government announcement links. It is a publicly accessible website, even though testers are primarily trusted acquaintances; it must **not** be described to publishers as a private RSS reader.

Proposed media integration in the free beta:
- Fetch only publisher-authorized RSS **metadata** (article title, publisher name, publication datetime, original canonical HTTPS URL) under an agreed rate/cache policy.
- Show a short attributed title and direct users to the publisher's original URL, in a distinct **기사** source-class area.
- **Do not** republish full text, feed excerpts, third-party photos, or site snapshots.
- **Do not** input RSS titles/body into AI analysis, cluster as Event, or create a generated NOAH Brief **without separate express permission** covering that processing.
- Clarify whether limited beta indexing (noncommercial but publicly visible) can be authorized without commercial licensing fees. If not, leave publisher disabled.

## Korean outreach template (human must verify/add actual contact)

제목: [NOAH ARK] 뉴스 RSS 제목·원문 링크 노출 범위 및 비상업 베타 이용허락 문의

안녕하세요. NOAH ARK 개발팀입니다.

NOAH ARK는 정부 정책자료와 언론사의 원문 정보를 분리해 보여주는 뉴스 탐색 서비스로, 현재 소규모 비상업 공개 베타를 운영하고 있습니다.

귀사의 RSS를 다음 조건으로 이용할 수 있는지 서면 확인을 부탁드립니다.

1. 수집 대상: 기사 제목, 출처, 발행일시, 원문 URL만 사용하며 본문·사진·발췌문은 저장·복제·게시하지 않음
2. 이용 목적: 출처가 표시된 원문 링크 목록을 NOAH ARK 공개 웹페이지에서 제공해 원 발행사 페이지로 이용자를 안내
3. 수집 방식: 귀사가 허용하는 RSS 주소 및 요청 주기·캐시 정책·사용량을 준수하고, 허가가 철회되면 즉시 중단
4. AI 활용: 현재 미실시. 향후 사건 분석·기사 요약·학습 등의 사용은 **추가로 별도 승인받을 때만** 진행
5. 현재 운영 형태: 광고·구독료 없는 비상업 베타이지만, 인터넷에서 누구나 URL로 접속 가능한 페이지

위의 메타데이터 중심 이용이 가능한지, 이용허락이나 별도 계약·유료 제휴가 필요한지 안내 부탁드립니다. 허용 범위와 필수 출처 표기 방식을 알려주시면 그대로 준수하겠습니다.

감사합니다.
NOAH ARK 개발팀
https://noah-ark-ai.vercel.app/

## Confirmed publisher contact channels and evidence

| Outlet | Contact | Official source |
|---|---|---|
| 조선일보 | rss@chosun.com | https://rssplus.chosun.com/ |
| 동아일보 | cool@donga.com | https://rss.donga.com/ |
| SBS | newsservice@sbs.co.kr | https://news.sbs.co.kr/news/rss.do |
| 경향신문 | contents@khan.co.kr (AI/data usage inquiry), publisher service form | https://www.khan.co.kr/help/help_digital.html and https://www.khan.co.kr/help/help_email.html |
| 매일경제 | moon.chaerin@mkinternet.com (copyright/content license inquiry listed in FAQ; verify recipient before sending) | https://www.mk.co.kr/mypage/service/faq/all?pageIndex=2 |
| 한국경제 | publisher's 제휴 / 콘텐츠구입 links; email unverified | https://www.hankyung.com/feed |
| YTN | publisher's 사업 제휴 / 뉴스·프로그램 공급 links; email unverified | https://www.ytn.co.kr/ |
| 한겨레 | rights contact unverified | https://www.hani.co.kr/ |
| 연합뉴스 | rights contact unverified | https://www.yna.co.kr/ |

## Owner's approval checklist

- [ ] Review this draft and sender identity before any outbound communication.
- [ ] Select first two publishers to approach, and confirm contact details on official pages.
- [ ] Request written permission specifically for **public, automated indexing**; do not conflate RSS's personal subscription license with redistribution rights.
- [ ] Record reply, effective period, caching limits, AI permission scope, and revocation channel in a separate controlled rights register.
- [ ] Inform owner of cost/contract conditions **before** committing to any expense. Monthly total operating budget target is below KRW 50,000.
- [ ] Only after rights and security review update candidate source activation flags and deploy; first perform branch-based CI/HTTP/smartphone checks.
