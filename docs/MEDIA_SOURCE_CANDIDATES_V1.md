# NOAH ARK — Diverse media & expert-source intake (candidate-only, 2026-10-12)

## Product information architecture (approved concept; NOT deployed)

Use four **source-class** filters: `전체 | 기사 | 정책소식 | 정보원 소식`.
- **기사**: publisher-reported articles, with publisher name and original HTTPS link. Includes broadcasters, newspapers, business press and newswires.
- **정책소식**: official agency announcements, notices and primary records. Government press releases must retain honest metadata; don't relabel them as newsroom reporting.
- **정보원 소식**: opted-in/rights-reviewed domain expert blogs, practitioners, think-tank or researcher posts, each labeled as **commentary/experience** rather than authoritative facts.
- **전체**: combined filtered view. Topic (경제, AI, 창업, 부동산, 법률…) is a second independent dimension; source class is never the topic.

Rationale: allow the **same real-world Event** to connect official evidence, journalistic reporting and expert interpretation without reproducing copyrighted articles. Do not place publisher-level 'progressive'/'conservative' truth labels on individual stories, fabricate viewpoint symmetry, or count syndicated duplicates as independent reporting. Editorial source diversity and accuracy/corrections should be assessed separately.

## Nine Korean publisher intake candidates

| Outlet | Category | RSS source | Endpoint evidence | Public ingestion |
|---|---|---|---|---|
| YTN | broadcast | **Unconfirmed official RSS (NO URL)** | https://www.ytn.co.kr/ ; 2026-03 community probe reported earlier endpoints discontinued: https://gist.github.com/JunsikChoi/fe163df1254b5719caa746c0ebca204b | DISABLED |
| 한겨레 | general newspaper | https://www.hani.co.kr/rss/ | Third-party 2026 feed probe, publisher index not independently verified in this audit: https://github.com/seokhoonj/newswatcher/blob/main/docs/korean-news-rss.md | DISABLED |
| 경향신문 | general newspaper | https://www.khan.co.kr/rss/rssdata/total_news.xml | https://www.khan.co.kr/help/help_rss.html | DISABLED |
| 조선일보 | general newspaper | https://www.chosun.com/arc/outboundfeeds/rss/?outputType=xml | https://rssplus.chosun.com/ | DISABLED |
| 동아일보 | general newspaper | https://rss.donga.com/total.xml | https://rss.donga.com/ | DISABLED |
| 매일경제 | business newspaper | https://www.mk.co.kr/rss/30000001/ | https://www.mk.co.kr/rss | DISABLED |
| 한국경제 | business newspaper | https://www.hankyung.com/feed/all-news | https://www.hankyung.com/feed | DISABLED |
| SBS | broadcast | https://news.sbs.co.kr/news/newsflashRssFeed.do?plink=RSSREADER | https://news.sbs.co.kr/news/rss.do | DISABLED |
| 연합뉴스 | newswire | https://www.yna.co.kr/rss/news.xml | Community probe: https://gist.github.com/JunsikChoi/fe163df1254b5719caa746c0ebca204b ; actual original host and terms pending | DISABLED |

**Discovery is not a live HTTP smoke test** of every feed. Feed availability can differ by network or change over time, and an RSS page does not grant NOAH a redistribution license.

## Rights and journalistic integrity release gates

1. **Explicit allowed use** for each media partner: public headline+outbound-link index; metadata cache duration; excerpt/body/photo; automated processing and AI transformation; traffic restrictions and attribution, with documented rights-owner source. Where missing or restrictive, keep public ingestion **off**.
2. Korean publishers' documented examples: 경향 RSS says **personal subscriptions only** and redistribution requires prior permission; 조선 RSS says RSS personal reader use and directs commercial-use inquiries to rss@chosun.com; 동아 RSS says personal noncommercial use and public/commercial use requires contact at cool@donga.com; SBS RSS is personal noncommercial and points inquiries to newsservice@sbs.co.kr. Never presume a public beta is a private RSS reader.
3. Initial features: no full article scraping or photos; source name, original canonical HTTPS link, publishedAt, legal evidence; fail-closed if upstream errors, content policy unclear or publisher blocks automated requests.
4. **No YTN fake endpoint or unapproved Google News proxy**: find current official feed or seek approved API/licensing alternative. Newspaper coverage from reputable opposing editorial traditions is for independent comparison, not strict partisan quotas.
5. Source ingestion architecture must be additive: current `OfficialFeedKind=notice|press`, `validMinistryLink`, two-feed manual-refresh validation and hard 40-link cap are **government-only**. Do not broaden host checks or reuse government feed labels as media categories without tests.
6. Rights-cleared media and approved expert-source registry can later drive `NEWS_MEDIA` and `EXPERT_COMMENTARY` source classes, independent of topic and the Event model. No paid AI, production RSS enablement, Neon writes, Mock leakage, Vercel deploy or cost upgrade in this candidate-only change.
7. Keep working Home Option A, beta feedback to linked Google Sheet, KST, under KRW 50,000/month, and production pinned until #24 review/owner approval.

See #24 stabilization, #26 media-source planning. Implementation file: `lib/news/media-source-candidates.ts`; all nine entries deliberately have `publicEnabled:false`. `tests/media-source-candidates.test.ts` guards against accidental activation.
