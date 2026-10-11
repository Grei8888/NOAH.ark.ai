# NOAH ARK — Magazine Editorial Pass v1

Status: implementation direction for PR #8  
Purpose: upgrade Personalized Home v1 from "clean SaaS/news utility" to a **premium editorial intelligence product** while preserving speed, trust, and mobile usability.

## 1. Reference mood

Use premium men's/editorial magazines as **layout and hierarchy references**, not as a visual costume.

Reference qualities to borrow:
- **Esquire / GQ**: strong cover-story hierarchy, confident headline scale, image cropping, sharp editorial rhythm
- **The Rake**: restraint, classic luxury, quiet authority, navy/cream/gold compatibility
- **Monocle**: information density, disciplined grids, practical editorial structure, business/world affairs tone

Do not imitate mastheads, proprietary layouts, copyrighted page designs, or publication-specific brand devices.

Target feeling:
**GQ modernity + The Rake restraint + Monocle information discipline**

NOAH should feel like:
> a premium publication for ambitious people who read to make better decisions.

Not:
- fashion e-commerce
- lifestyle moodboard
- fintech dashboard
- AI SaaS card wall
- old-fashioned newspaper

## 2. Core editorial principle

The Home page needs an editorial rhythm:

1. **Lead story / Cover Event**
2. Strong secondary Events
3. Compact intelligence lists
4. Small utility/editorial modules

Do not render every Event with equal visual weight.

Current PR #8 is structurally good, but all Events currently have similar row hierarchy. Upgrade the first FOR YOU item into a lead Event.

## 3. Desktop Home composition

Keep the current 3-zone shell, but tune proportions and rhythm.

- Left navigation: 176–188px
- Main reading column: dominant, ideally 700–820px at large desktop
- Right rail: 280–310px
- Wider whitespace between editorial zones
- Fewer boxed panels; prefer rules, open space, and type hierarchy

### First screen

```text
PERSONAL INTELLIGENCE · 11 OCT 2026

좋은 저녁이에요.

당신에게 중요한
오늘의 변화.

FOR YOU

┌───────────────────────────────────────────────┐
│ 01  POLICY · AI                              │
│                                               │
│ 정부, AI 스타트업 실증 지원 확대              │
│                                               │
│ [lead image if rights-cleared]                │
│                                               │
│ 핵심 요약                                     │
│ 나에게 중요한 이유                            │
│ 출처 4 · 다른 시선 · 저장                     │
└───────────────────────────────────────────────┘

02  Secondary Event
03  Secondary Event
04  Secondary Event
```

The lead Event should feel editorial, not card-heavy.

## 4. Lead Event / Cover Story treatment

Only the first high-confidence FOR YOU Event receives lead treatment.

Requirements:
- 32–40px desktop headline depending available width
- max ~2–3 lines
- generous top/bottom whitespace
- editorial metadata above
- optional 16:9 or 3:2 image **only when rights-cleared and source-relevant**
- concise summary below
- recommendation reason visible without opening a disclosure
- source/perspective/save actions in one quiet footer row
- one restrained gold signal only, e.g. rank marker or tiny rule

If there is no licensed/relevant image:
- do **not** use stock filler
- use a text-led cover story with stronger typographic scale and negative space

Do not put the lead story inside a heavy rounded container. Prefer open layout with 1px rules.

## 5. Secondary Event treatment

Events 02–05:
- 20–22px desktop headline
- 13–14px summary
- optional compact thumbnail only when meaningful
- rank number in serif or editorial numeral style
- metadata in small caps/sans
- recommendation reason shorter and quieter
- border line between rows

A useful hierarchy:
- Event 01: feature
- Event 02–03: medium
- Event 04–05: compact

Avoid making five visually identical rows.

## 6. Typography

### Korean
Primary:
- Pretendard / Noto Sans KR / Apple SD Gothic Neo
- high-quality Korean gothic/sans remains the core

Suggested:
- Home hero title: 34–40px desktop / 28–32px mobile
- Lead Event: 32–40px desktop / 24–28px mobile
- Secondary Event: 20–22px desktop / 18–20px mobile
- Summary: 13–14px desktop / 12–13px mobile
- Metadata: 10–11px desktop / 9–10px mobile

Current PR #8 sizes are too conservative in several places (e.g. 19px Event title, 12px desktop summary). Increase readable hierarchy.

### Serif
Use selectively for:
- rank numbers
- occasional English editorial section marks
- optional large English phrase such as `Only What Matters.`
- not for dense Korean body or controls

Do not turn every English label into serif.

## 7. Section naming and spacing

Keep:
- FOR YOU
- MUST KNOW
- STARTUP RADAR

Potential editorial treatment:
- section label: small uppercase, letterspaced
- section deck: one short Korean line
- rule underneath

Example:
`FOR YOU`
`선택한 관심분야에서 오늘 가장 먼저 볼 변화`

Use 32–48px breathing room between major sections.

## 8. Right rail

Current box-heavy panels should become more editorial.

### MY SIGNALS
Prefer:
- open white background
- thin top/bottom rules
- strong number alignment
- minimal radius
- no large gray cards unless functional grouping needs it

### WATCHING
Keep chips but make them smaller and quieter.

### Editorial statement
Keep:
`하나의 사건, 여러 개의 시선.`

This can be a typographic editorial break, potentially with a serif English kicker.

Do not add a large Pro promo in beta.

## 9. Imagery

Editorial imagery is important, but must remain trustworthy.

Use images only when:
- legally reusable / licensed
- actually related to the Event
- source metadata is retained

Image hierarchy:
- lead Event: one large image
- secondary Events: optional small thumbnail
- Must Know: usually text-only
- Startup Radar: mostly text / official-document icon or source indicator, not decorative photos

Do not use:
- generic skyline
- generic businessman
- random AI hand/robot imagery
- unrelated government building photos
- decorative mountains on live news cards

Missing image should become typography, not stock imagery.

## 10. Color & luxury restraint

Keep Brand v3:
- white
- deep navy
- layered cool gray
- restrained gold

Gold:
- one or two visible focal accents per screen
- small rank marker / signal dot / selected editorial cue
- never body copy
- never broad fill
- never all premium features at once

Premium must come from:
- scale
- whitespace
- proportion
- image crop
- alignment
- source confidence

not from gold decoration.

## 11. Mobile

Mobile should feel like a compact magazine cover, not a shrunken dashboard.

First viewport:
- compact header
- date / greeting
- large personalized headline
- meaningful portion of lead Event

Recommended flow:
1. Header
2. personalized editorial headline
3. lead Event
4. Event 02
5. Event 03
6. MUST KNOW
7. STARTUP RADAR
8. bottom nav

Lead Event mobile:
- image may go full content width
- headline 24–28px
- metadata above, reason/source actions below
- no nested gray card if possible

Keep bottom nav functional and visually quiet.

## 12. Interaction tone

Editorial does not mean static.

Keep:
- save
- less/more topic
- not interested
- source open
- different views/perspectives

But actions should not visually compete with headline.

Default:
- text links + small icons
- save icon
- overflow menu

Avoid button bars and large chips under every story.

## 13. Changes requested for PR #8

### Required visual changes
1. Introduce `LeadEvent` or variant of `EventFeedItem` for first FOR YOU Event.
2. Increase Home title and Event headline typography.
3. Make recommendation reason visible/compact for the lead Event.
4. Reduce box/card feeling in right rail.
5. Create stronger section spacing and editorial rules.
6. Prepare optional image slot controlled by rights/display metadata; **do not invent image URLs**.
7. Preserve text-only premium fallback.
8. Keep mobile first Event visible within the first screen as much as feasible.
9. Keep Brand v3 navy/gray/gold; no orange.
10. Approved Event Capsule logo remains pending until reviewed vector source exists.

### Must remain unchanged
- Mock/live separation
- no fake match percentages
- no fake People Like You
- source attribution
- no fabricated divergent viewpoints
- transparent interest-rule personalization
- save/hide/undo behavior
- accessibility/focus states
- five-item mobile navigation

## 14. Review criteria

A reviewer should be able to answer yes to:

- Does Home look more like a premium editorial product than an admin dashboard?
- Is the first Event obviously the most important personalized story?
- Is Korean typography large and comfortable enough to read?
- Is there visual rhythm rather than repeated cards?
- Does gold remain rare?
- Does imagery increase trust rather than decorate?
- Is the mobile first screen still useful, not just beautiful?
- Are source and recommendation explanations still easy to reach?
- Can the screen still work elegantly with zero images?

## Principle

**Editorial hierarchy, not decoration.  
Premium restraint, not luxury effects.  
Personal intelligence, not dashboard widgets.**
