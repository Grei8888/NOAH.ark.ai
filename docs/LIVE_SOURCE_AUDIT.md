# NOAH ARK Free Beta — Primary Source Feed Audit

Date: 2026-10-12. **Discovery and design review only; no RSS was fetched into production DB or enabled on Vercel.**

## Why this exists

NOAH requires authentic news/article evidence and a separate event-level interpretation. Official RSS distribution does **not** grant blanket article-body republication rights, image licensing, or permission for every AI workflow. Initial beta must preserve publisher attribution, link directly to originals, and exclude unverified rights.

## Candidate Korean official source feeds

| Priority | Source | Topic | Published RSS URL | Current verification |
|---|---|---|---|---|
| 1 | 중소벤처기업부 | 사업공고 | https://mss.go.kr/rss/smba/board/310.do | Official RSS 2.0 endpoint parsed successfully in read-only GitHub Actions smoke: 20 dated entries; links return `www.mss.go.kr`. Not ingested. |
| 1 | 중소벤처기업부 | 보도자료 | https://mss.go.kr/rss/smba/board/86.do | Official RSS 2.0 endpoint parsed successfully in read-only GitHub Actions smoke: 20 dated entries; links return `www.mss.go.kr`. Not ingested. |
| 2 | 중소벤처기업부 | 법령공고 | https://mss.go.kr/rss/smba/board/126.do | Listed on official RSS page; endpoint data/entry dates unverified. |
| 2 | 과학기술정보통신부 | 보도자료 | https://www.msit.go.kr/user/rss/rss.do?bbsSeqNo=94 | Listed on ministry's official RSS page; fetch timed out during read-only research, no functioning feed claimed. |
| 2 | 과학기술정보통신부 | 사업공고 | https://www.msit.go.kr/user/rss/rss.do?bbsSeqNo=100 | Listed on official RSS page; endpoint data/entry dates unverified. |

Official documentation:
- MSS RSS page: https://www.mss.go.kr/site/smba/contents/view.do?menuCd=20905000000002024122902&siteCd=smba
- MSIT RSS instructions: https://www.msit.go.kr/contents/cont.do?mId=173&mPid=147&sCode=user
- MSS copyright guidance: https://mss.go.kr/site/smba/contents/view.do?menuCd=20903030000002024122906&siteCd=smba

**Rights gate:** MSS instructs users to verify **공공누리 제1유형** label on each source asset and provide proper attribution; for unmarked works seek prior agreement. RSS metadata availability alone is not a declaration that every item is KOGL1 or that photo/AI use is authorized. Review MSIT content-specific KOGL/AI marks separately. Until cleared, use original URLs and minimal factual metadata rather than copying article bodies/images.

## Explicitly excluded feed

**대한민국 정책브리핑 `korea.kr` RSS** — official announcement says it was **discontinued on 2026-07-01** for content copyright/right-protection reasons. Do not attempt to use legacy URLs, mirrors or scraping to bypass. Official notice:
https://www.korea.kr/etc/noticeView.do?newsId=132038885&pWise=main&pWiseSub=O1

Note: `korea.net` is a **different** website from `korea.kr`, with its own RSS service; do not conflate them.

## Engineering requirements before ingestion

1. Verify HTTPS GET, acceptable response Content-Type, actual RSS 2.0 `channel.item` structure, `title`, `link`, `pubDate` and real original article links using a disposable local test. Existing RSS parser does **not** support Atom.
2. Check each source's rights terms and actual article-specific notices; **don't copy article text/photographs** when reuse is not cleared. Prevent imported `description` snippets from exceeding permitted scope.
3. The RSS Provider accepts only exact feed hostname and literal `www.` alias for `GOVERNMENT` attribution. Unrelated subdomains/hosts remain unverified; unit tests guard this boundary.
4. Current `runtimeMode()` **rejects `NEWS_PROVIDER=rss` with `AI_PROVIDER=mock`**. Current pipeline requires OpenAI for live Event analysis. It must not fall back to mock AI content. No paid API calls are authorized. An explicit **un-analyzed source-link-only discovery UI** would be a different clearly labeled feature, **not** published NOAH Event intelligence, requiring product-owner approval and independent review.
5. Validate publisher URL normalization, dedupe, feed freshness/date windows, 2 MB XML cap and 20 s timeout. Fail closed; don't turn prior mock editions into real published content.
6. First real end-to-end test should be on a non-public preview or reviewed temporary DB branch, **not** on the already-initialized production beta DB.
7. Only after URL/rights and AI budget gates pass should set `NEWS_PROVIDER=government`, `RSS_FEEDS` and exact permitted `OFFICIAL_RSS_FEEDS` in server-side secret/config — never in repo history.

## Status

**Read-only XML parsing verified in GitHub Actions** (https://github.com/Grei8888/NOAH.ark.ai/actions/runs/38178352005): MSS 사업공고 20 and 보도자료 20 dated records. Their `pubDate` values use 14-digit KST (`YYYYMMDDHHmmss`), and original links use `www.mss.go.kr`. A later run encountered a transient fetch failure; the smoke script retries once without suppressing persistent errors. **Nothing ingested; rights not cleared.** Neon beta DB has the Prisma init schema but no Articles/Events/Arks, and Vercel has no deployments.
