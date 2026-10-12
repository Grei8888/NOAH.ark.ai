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

## Confirmed media contacts (owner outreach; verified 2026-10-12, not contacted)

Use content partnership/licensing contacts, NOT reporter tipline or editorial journalists. Website changes are possible; reconfirm before sending.

| Publisher | Route | Exact published authority | Stage |
|---|---|---|---|
| YTN | **YTN 디지털서비스팀**, supply contact **02-2160-7411**, **batuhy@ytn.co.kr**; digital business partnership **02-398-7410**; main **02-398-8000** | https://www.ytn.co.kr/business/supply_1.php and https://www.ytn.co.kr/business/partnership_1.php | Direct outreach possible, none sent |
| 경향신문 | contents@khan.co.kr; +82-2-3701-1114 | https://company.khan.co.kr/en and https://company.khan.co.kr/business/partnership and https://www.khan.co.kr/help/help_digital.html | Direct outreach possible, none sent |
| 조선일보 | rss@chosun.com; official RSS inquiry form | https://rssplus.chosun.com/ | Direct outreach possible, none sent |
| 동아일보 | **동아닷컴 콘텐츠사업** 02-360-0367 / cool@donga.com | https://faq.donga.com/ and https://www.donga.com/company?m=termsofuse | Direct outreach possible, none sent |
| 매일경제 | 제휴 02-2000-5433, 저작권 02-2000-5429; 02-2000-2114 general editorial | https://www.mk.co.kr/mypage/service/contact | Direct outreach possible, none sent |
| 한국경제 | **한경닷컴 사업제휴** 02-3277-9960 / cst1211@hankyung.com; content use **copyright@hankyung.com** | https://company.hankyung.com/dotcom/partnership/business/ and https://company.hankyung.com/dotcom/partnership/contents/ | Direct outreach possible, none sent |
| SBS | newsservice@sbs.co.kr | https://news.sbs.co.kr/news/rss.do | Direct outreach possible, none sent |
| 한겨레 | General/customer routing **1566-9595**; ask for 디지털 콘텐츠 제휴·저작권/사업담당; dedicated content license email **not yet verified** | https://notice.hani.co.kr/ | Call transfer needed, none sent |
| 연합뉴스 | **콘텐츠 이용·저작권** 02-398-3804 / hello@yna.co.kr; 프리미엄뉴스 계약/이용 **02-398-3655** | https://www.yna.co.kr/amp/view/AKR20260911000100011 and https://www.premiumnews.co.kr/ | Direct outreach possible, none sent |

**Critical publisher condition:** 한국경제 lists 2026 online article reuse prices as high as KRW 200,000 per article for noncommercial corporate usage and KRW 300,000 for commercial corporate usage, exclusive of VAT (see its content-use page). These are **article-content reuse** rates, not a verified fee for metadata-only RSS outbound linking. Explicitly ask for a separate limited **title/date/source/URL** pilot instead of assuming article-level licenses can fit the <KRW 50,000 monthly operations budget.

## Owner editorial partnership concept — OPEN READING COMPANION (not yet implemented)

**Product owner decision, 2026-10-12:** Reading two source articles is a **recommendation, never a condition for AI access, reading verification, or perspective exploration**. Do not lock the AI companion or request mandatory `읽었음` self-confirmation. The guiding idea is **"read original reporting freely, ask questions any time, get naturally curious about other perspectives."**

NOAH ARK aims to reduce polarizing misinformation and encourage independently reported, trustworthy journalism. Diversity is not a mandatory left/right 50:50 split for every factual question. Separate verified facts, commentary, unsupported claims, and opinion disputes.

1. **Event landing:** show one developing event; official source where available; directly linked reporting with clearly named publishers. No article text or photos reproduced without permission.
2. **AI Reading Companion always discoverable:** optional question chips such as **용어 설명 / 배경 이해 / 비판적 독해 / 다른 관점** and open question input. Never require two opens, completion tracking, quiz, timer, or self-certification.
3. **Soft discovery:** after viewing an original article link, provide a restrained, dismissible nudge: `같은 사건을 다른 시각으로 보도한 기사도 살펴보세요` or `이 주장에는 어떤 근거가 있을까요?`. Alternative links are click-through suggestions, **not compulsory steps or blockers**. No manipulative guilt or indefinite nagging.
4. **Cross-perspective context:** where genuinely independent, responsibly reported perspectives exist, display related original URLs with publisher and any verified explanatory differences. Two syndicated versions count as one independent reporting source. Don't infer individual story ideology or fabricate rival opinions where none exists.
5. **Honest reading signals:** link open does not prove reading; do not claim comprehension or completion. Do not collect dwell time/read confirmation for a mandatory gate.
6. **AI capability rights gates:** metadata-only RSS permission does NOT authorize article body ingestion, AI parsing, retrieval, derivative comparisons or re-summaries. The unrestricted companion may explain **general terms and background knowledge independently of publisher article text**. If the user asks about article-specific claims and there is no separately licensed, user-permitted article context, AI must say the article content has not been examined and offer conceptual questions instead of falsely claiming to have analyzed it.
7. **Publisher proposition:** original-article visits first, clear attribution, optional exploratory related links, no full-body/photo mirroring, easy content takedown/opt-out, aggregate referrer/click analytics only if appropriate and compliant; never promise proven traffic uplift. Ask separately about limited AI article processing permission.
8. **Public beta economics:** noncommercial but publicly accessible; target service operating spend <KRW 50,000/month. No publisher-license budget is preapproved.

An Event may have only one high-quality primary source or exclusive original report. Do not gate reading, generic AI knowledge help or source discovery based on count of reports. Prefer quality and evidence over forced numerical balance.

Suggested first call: '뉴스 콘텐츠/RSS를 담당하시는 디지털 서비스 또는 콘텐츠 제휴 담당자 연결 부탁드립니다. 원문을 읽도록 유도하는 비상업 공개 베타의 기사 제목·원문 링크 한정 시범제휴를 제안드리려 합니다. AI 기사 본문 이용은 별도로 허락을 구할 계획입니다.'

## Owner's approval checklist

- [ ] Review this draft and sender identity before any outbound communication.
- [ ] Select first two publishers to approach, and confirm contact details on official pages.
- [ ] Request written permission specifically for **public, automated indexing**; do not conflate RSS's personal subscription license with redistribution rights.
- [ ] Record reply, effective period, caching limits, AI permission scope, and revocation channel in a separate controlled rights register.
- [ ] Inform owner of cost/contract conditions **before** committing to any expense. Monthly total operating budget target is below KRW 50,000.
- [ ] Only after rights and security review update candidate source activation flags and deploy; first perform branch-based CI/HTTP/smartphone checks.
