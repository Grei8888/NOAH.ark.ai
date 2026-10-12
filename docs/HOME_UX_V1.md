# NOAH ARK — Home UX Specification v1

Status: implementation-ready draft  
Owner decision: **Home = A. Personalization first**  
Brand source: `docs/BRAND_V3.md`  
Product source: `docs/NOAH_PRODUCT_BLUEPRINT_V1.md`

## 1. Home goal

A signed-in user should understand within the first screen:

1. What matters to me today?
2. Why is it relevant to me?
3. Is there another credible way to see the same Event?
4. What should I read or monitor next?

NOAH Home is not a generic news portal and not a dashboard of widgets. It is a **personalized editorial feed**.

## 2. Content priority

Signed-in Home priority:
1. FOR YOU
2. MUST KNOW
3. STARTUP RADAR
4. PEOPLE LIKE YOU — hidden until real eligible cohort data exists
5. MULTIPLE PERSPECTIVES
6. Saved/following continuation

Visitor Home:
- selective public Today's Ark
- brand value proposition
- representative sourced Event
- CTA to create a personalized edition

Do not show fake peer activity, fake counts, fake recommendation percentages, or mock production stories.

## 3. Desktop information architecture

Target shell:
- Left navigation: 176–192px
- Main reading column: fluid, dominant
- Right intelligence rail: 288–320px
- Page max width: roughly 1440–1520px
- Main canvas: white with cool-gray layered surfaces and thin borders

```text
┌───────────────┬──────────────────────────────────────┬────────────────────────┐
│ Left nav      │ Main personalized feed               │ Intelligence rail      │
│ NOAH ARK      │ Greeting / date                      │ My Signals             │
│ Home          │ FOR YOU                              │ Watching                │
│ Discover      │ Event 01                             │ Startup Radar           │
│ Startup       │ Event 02                             │ Must Know               │
│ Saved         │ Event 03                             │                        │
│               │ MUST KNOW                            │                        │
│ My NOAH       │ STARTUP RADAR                        │                        │
│ Profile       │ PEOPLE LIKE YOU*                     │                        │
│ Settings      │ MULTIPLE PERSPECTIVES                │                        │
└───────────────┴──────────────────────────────────────┴────────────────────────┘
* only when cohort data is real and eligible
```

### Left navigation
Primary:
- Home
- Discover
- Startup
- Saved

Secondary:
- My NOAH
- Profile
- Settings

Requirements:
- Horizontal/compact NOAH ARK logo lockup
- Active item: light cool-gray surface + navy marker
- No oversized logo block
- No separate top-level Risks / Opportunities / Sectors menus; use filters inside Discover
- Collapse to icon rail only if viewport truly needs it, otherwise keep labels

### Desktop top area
No oversized marketing hero.

Recommended:
- eyebrow: `PERSONAL INTELLIGENCE · 2026년 10월 11일`
- greeting: `좋은 저녁이에요.` or time-aware equivalent
- headline: `당신에게 중요한 오늘의 변화 5가지`
- optional compact utility row: search, notifications, profile

Do not personalize greeting with a person's name unless a display name actually exists.

## 4. FOR YOU — primary feed

The first Event must begin above the fold on common laptop heights.

Each Event row:
- rank
- primary category + recency
- headline, ideally max 2 lines
- 1–2 line fact/impact summary
- recommendation reason
- tags (max 3 visible)
- coverage/perspective affordance
- save action
- optional source-relevant thumbnail with valid rights metadata
- grade/importance may exist but must not visually dominate personal relevance

Example structure:

```text
01
정책 · AI · 2시간 전

정부, AI 스타트업 실증 지원 확대 발표
초기기업의 실증사업 참여 범위가 확대될 예정입니다.

나에게 중요한 이유
AI · 창업 · 정부지원 관심분야와 관련

[AI] [창업] [정부지원]     다른 시선 3개 →   저장
```

### Recommendation explanation
Do not use fake precision such as `94% MATCH` in v1.

Use understandable explanations:
- `선택한 AI·창업 관심분야와 관련`
- `저장한 정책 Event와 연관`
- `관심 지역의 지원사업 변화`

If relevance is weak, do not invent reasons.

## 5. MUST KNOW

Purpose: protect users from a narrow preference bubble.

- 1–3 Events
- ranked primarily by significance/evidence rather than personal match
- visually lighter than FOR YOU but clearly distinct
- copy: `관심사 밖이라도 오늘 알아야 할 변화`
- no forced quota

## 6. STARTUP RADAR

For side-business / startup users:
- verified support programs
- tax/regulatory changes
- deadlines
- market openings
- business-enabling policy changes

Each Radar item should distinguish:
- news Event
- official notice/program
- deadline/status
- why it may matter

Never imply eligibility from incomplete information. Prefer `검토 필요` over unsupported `신청 가능`.

## 7. PEOPLE LIKE YOU

Hidden by default at launch.

Show only after:
- real interaction data exists
- cohort eligibility/privacy threshold is satisfied
- ranking quality passes internal review

Cohorts should be based on broad declared interests/stage/behavior, not sensitive traits.

Good copy:
- `AI·B2B 창업 관심 사용자들이 많이 저장한 Event`

Avoid:
- age/sex/political affiliation cohorts
- showing individual identities
- tiny or potentially identifiable group counts
- fabricated popularity

Cold-start replacement:
- `선택한 관심분야에서 주목할 Event`

## 8. MULTIPLE PERSPECTIVES

This is an Event interaction, not a publisher ideology scoreboard.

Home affordance:
- `다른 시선 3개`
- small source/avatar marks only if legally/visually appropriate
- clicking opens Event detail directly at Perspective section or an accessible preview

Event detail structure:
1. 확인된 사실
2. 왜 중요한가
3. 다른 시선
4. 공통점 / 쟁점
5. 아직 확인되지 않은 점
6. 원문 출처
7. 나에게 미치는 영향
8. 다음에 볼 것

Do not hardcode `진보 / 보수`.
Use evidence-supported topical framings such as:
- 시장·기업
- 노동·사회
- 재정·정책
- 산업현장
- 연구·전문가

If there are not multiple meaningful supported perspectives, show available coverage and the gap.

## 9. Right intelligence rail

Desktop only; mobile content is redistributed.

### MY SIGNALS
Examples:
- `AI 정책 변화 3`
- `창업 지원 2`
- `팔로우 Event 업데이트 1`

Counts must come from real current data.

### WATCHING
User-selected topics/entities shown as compact editable chips.

### STARTUP RADAR
At most 2–3 urgent/important items.

### MUST KNOW
Optional small continuation only if not duplicative of main column.

No large decorative Pro ad in the first beta. Monetization surfaces should not compete with core relevance before retention is proven.

## 10. Mobile structure

Mobile is not compressed desktop.

### Header
- compact Event Capsule symbol + NOAH ARK wordmark
- search
- notifications or menu
- height roughly 52–60px

### First viewport
Must show:
- compact greeting/date
- `당신에게 중요한 오늘의 변화`
- first FOR YOU Event, ideally substantial part of second Event

No large scenic hero image.

### Mobile Event card
Content order:
1. rank/category/time
2. headline
3. short summary
4. `나에게 중요한 이유`
5. perspective count
6. save / overflow

Thumbnail:
- optional
- 16:9 or compact 4:3
- hide rather than use fake stock imagery

### Mobile quick actions
Overflow menu:
- 저장
- 이 주제 더 보기
- 이 주제 덜 보기
- 관심 없음
- 원문 보기

Avoid destructive actions without undo where appropriate.

### Bottom navigation
5 destinations maximum:
- Home
- Discover
- Startup
- Saved
- My

Use icon + text. Selected state navy; gold is not the routine nav state.

## 11. Mobile Event quick view

Optional bottom sheet after v1 if it improves speed.

Contents:
- headline
- what happened
- why for me
- coverage/perspective count
- full Event CTA
- save

Do not make a bottom sheet mandatory if it complicates accessibility/navigation in first beta.

## 12. Visual system

From Brand v3:
- white / light cool-gray ~75%
- navy/ink hierarchy ~20%
- gold ~2–3%

Key colors:
- Deep navy: `#0B1F3B`
- Navy: `#12304E`
- Slate: `#64748B`
- Cool gray: `#CBD2DB`
- Surface: `#F2F4F7`, `#F8FAFC`
- Gold brand: `#D4AF37`
- Gold UI: `#B49A60`

Typography:
- Korean/UI/body: Pretendard → Noto Sans KR → Apple SD Gothic Neo → system sans
- Large English editorial display only: Georgia / tested serif
- UI buttons and Korean Event titles remain sans/gothic

Styling:
- border: 1px cool-gray
- radius: 8–12px, not pill-everything
- shadow: near-zero
- no glassmorphism
- no orange
- no broad navy hero
- no decorative gradients as primary UI

## 13. Responsive breakpoints

Implementation may adjust based on real content, but target behavior:
- >= 1280: 3-zone desktop
- 960–1279: compact nav + main + narrower/right rail or collapsible insight drawer
- 768–959: main content + collapsible navigation; right rail moved inline
- < 768: mobile single-column + bottom nav

Do not simply scale font and widths. Reorder content.

## 14. Loading / empty / error states

### Loading
- neutral skeleton matching Event layout
- no fake story content

### No personalized profile
- ask user to select 3–5 interests
- meanwhile show public Must Know/Today's Ark clearly labeled

### Insufficient daily Events
- show fewer Events
- do not fill with weak/noisy items

### Provider/analysis error
- preserve last valid edition if policy allows
- mark freshness
- never silently substitute Mock

### No perspective diversity yet
- show `현재 확인된 출처 1개` or equivalent
- do not manufacture viewpoints

## 15. Accessibility and trust

- Keyboard reachable actions
- visible focus ring
- minimum comfortable mobile tap target
- color is never the only meaning carrier
- adequate text contrast, especially gray metadata
- source/deep-link accessible by text
- perspective sections identify source attribution
- personalized recommendation has `왜 추천했나요?`
- user can turn personalization signals off/edit profile

## 16. Component map

Suggested UI components, names can adapt to codebase:

```text
AppShell
├─ BrandLockup
├─ DesktopNav / MobileHeader / MobileBottomNav
├─ PersonalizedHome
│  ├─ HomeIntro
│  ├─ ForYouSection
│  │  └─ EventFeedItem[]
│  ├─ MustKnowSection
│  ├─ StartupRadarSection
│  ├─ SimilarUsersSection (feature-gated)
│  └─ PerspectiveDiscoverySection
├─ IntelligenceRail
│  ├─ MySignals
│  ├─ WatchingTopics
│  └─ RadarMiniList
└─ EventDetail
   ├─ VerifiedFacts
   ├─ WhyItMatters
   ├─ PerspectiveList
   ├─ RelevanceExplanation
   ├─ SourceList
   └─ FollowUp
```

Shared model/view needs:
- `EventCardViewModel`
- recommendation explanation
- image rights/display state
- perspective/source count
- feature gate for similar users

Do not change architecture-sensitive domain types merely to match these component names. Audit recovered models first.

## 17. Analytics events for beta

Minimum useful events:
- home_view
- event_impression (with placement)
- event_open
- recommendation_reason_open
- perspective_open
- source_open
- event_save
- event_hide
- topic_more
- topic_less
- startup_radar_open

Avoid collecting fields that are not needed. Define retention/privacy separately.

## 18. Implementation acceptance

Desktop:
- personalized FOR YOU dominates first viewport
- first Event is visible without scrolling on standard laptop
- nav is simplified
- right rail uses real data only
- no producer attribution
- brand v3 color system applied

Mobile:
- first Event visible in first viewport
- no desktop rail squeezing
- 5-item bottom nav
- clear recommendation explanation and perspective affordance

Data/trust:
- no fake People Like You
- no mock/production mixing
- no unsupported article thumbnails
- source links retained
- missing data degrades honestly

Engineering:
- preserve recovered WIP archive
- branch from current main/integration baseline
- implement with smallest safe changes
- typecheck/test/lint/build
- screenshots for desktop + 390px-class mobile
- PR before merge

## 19. Codex execution order

Do **not** start by rewriting the UI from old root main.

1. Audit `codex/recover-deployed-wip/recovery/local-app`.
2. Identify the canonical runtime pieces to port.
3. Establish a fresh `codex/product-runtime-integration` branch from current main.
4. Port and validate the recovered event pipeline/runtime selectively; keep recovery archive untouched.
5. Once baseline runs, create `codex/personalized-home-v1`.
6. Implement Brand v3 tokens + responsive shell + Home/Event UI.
7. Use Mock only with explicit DEMO labels until real-source production gates pass.
8. Open PR with verification output and screenshots.
