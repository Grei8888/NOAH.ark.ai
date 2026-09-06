# NOAH Intelligence — UI/UX v2 Specification

## 1. Purpose

This document is the implementation specification for the next NOAH main dashboard redesign.

The redesign should make NOAH feel like a modern public-policy / administrative intelligence product rather than a generic AI dashboard.

Design identity:

`Public Administration × Intelligence × Modern SaaS`

Keywords:

- Clean
- Calm
- Editorial
- Intelligent
- Premium
- Restrained

NOAH should feel credible and familiar to users in administration, policy, public institutions, consulting, and professional services.

---

## 2. Core visual direction

### Base composition

- White first.
- Cool navy is the primary structural color.
- Most secondary text, metadata, tags, dividers, icons and inactive navigation should be desaturated gray / blue-gray.
- Orange is a signal color only.
- Avoid broad dark backgrounds.
- Avoid gradients except where explicitly used for a contained promotional panel.
- Avoid colorful dashboard-card styling.
- Avoid unnecessary shadows.

Recommended visual ratio:

- White / very light gray: 70%
- Cool navy: 15%
- Gray / blue-gray: 12%
- Orange accent: 3%

---

## 3. Color tokens

Use design tokens instead of scattering hex values through components.

```css
:root {
  --canvas: #ffffff;
  --surface: #ffffff;
  --surface-soft: #f6f8fb;
  --surface-muted: #f1f4f8;

  --navy-950: #08233f;
  --navy-900: #0b2a4a;
  --navy-800: #123b6d;
  --navy-700: #1b4f83;

  --text-primary: #18324d;
  --text-secondary: #617286;
  --text-muted: #8a98a8;

  --border: #dce4ec;
  --border-soft: #e9eef3;

  --orange: #f47a1f;
  --orange-soft: #fff3e9;

  --danger: #b95555;
  --danger-soft: #fff1f1;
}
```

Notes:

- Main brand, H1/H2 and critical labels may use `--navy-900` or `--navy-950`.
- Normal body copy should not all be navy. Use `--text-primary`, `--text-secondary`, and `--text-muted` generously.
- Orange must be visually rare.
- Do not color grades A/B/C like a traffic light.

---

## 4. Typography

The visual reference uses a strong editorial serif for the NOAH identity and major headings, paired with a neutral Korean sans-serif for UI copy.

### Serif

Use for:

- NOAH logotype if no dedicated logo asset exists
- `Only What Matters.`
- `Today's Ark`
- ranking numerals if appropriate
- occasional editorial quotations

Preferred stack:

```css
font-family: Georgia, "Times New Roman", serif;
```

Do not overuse serif in dense UI text.

### Sans-serif

Use for:

- Korean article titles
- summaries
- navigation
- metadata
- tags
- buttons
- side panels

Preferred stack should prioritize clean Korean rendering, for example:

```css
font-family: Inter, Pretendard, "Noto Sans KR", "Apple SD Gothic Neo", sans-serif;
```

If external font loading is not already configured, do not add a fragile dependency just for this redesign.

---

## 5. Page architecture

Desktop target should use a three-zone layout.

```text
┌──────────────┬───────────────────────────────────┬──────────────────────┐
│ Left rail    │ Main intelligence feed            │ Insight rail         │
│ ~170–200px   │ flexible                          │ ~280–320px           │
└──────────────┴───────────────────────────────────┴──────────────────────┘
```

Recommended max width: approximately 1440–1520px.

The main reading column should remain dominant.

### Left navigation rail

Contents:

- NOAH logo / wordmark
- short tagline
- Home
- Today's Ark
- Previous Ark
- Sectors
- Opportunities
- Risks
- Bookmarks
- About NOAH
- Settings

Visual behavior:

- white or barely tinted background
- subtle right divider
- inactive items gray / blue-gray
- active item gets a slim navy indicator and very light blue-gray background
- no strong filled navy menu blocks

Bottom area:

- subtle brand phrase such as `Less Noise / More Insight / A More Certain Tomorrow`
- very light decorative graphic is optional
- attribution: `기획 · 행정사법인 코리아`

The attribution must be visible but understated. It should not compete with the NOAH brand.

---

## 6. Top header / hero

The hero should be compact and editorial, not a marketing landing-page hero.

Top line:

`DAILY INTELLIGENCE · YYYY년 M월 D일 (요일)`

Main title:

`Only What Matters.`

Subtitle:

`복잡한 변화 속에서, 당신에게 필요한 것만.`

Optional right-side quote:

`더 나은 내일을 위한 오늘의 인텔리전스.`

Search may sit in the upper-right area with notification/profile controls.

Do not use a large navy hero background.

---

## 7. Summary metrics

Directly under the hero, show 3 concise summary modules.

Suggested metrics:

1. 오늘의 주요 Ark
2. 기회 이벤트
3. 주의 이벤트

Treatment:

- white cards or flat modules
- 1px soft border
- 8–10px radius
- very little or no shadow
- metric number in navy
- orange only for opportunity / newly detected signal

Example:

```text
오늘의 주요 Ark    6
기회 이벤트        3
주의 이벤트        1
```

Avoid oversized KPI-dashboard styling.

---

## 8. Today's Ark feed

This is the primary product surface.

The feed should feel closer to an intelligence report / editorial briefing than a grid of SaaS cards.

Each event row should contain:

- rank (`01`, `02`, ...)
- category
- recency (`7시간 전`)
- event title
- 1–2 line summary
- optional `OPPORTUNITY` signal pill
- grade (`A+`, `A`, `B+`, `B`)
- 3–4 muted tags
- thumbnail image when available
- link/action: `전체 요약 보기 →`

### Layout

Rank should sit on the left edge.

Title and summary are the dominant content.

Thumbnail sits on the right of the event row on desktop.

Grade should be visually clear but not colorful.

Rows are separated mainly by whitespace and a thin divider.

Avoid enclosing every event in a heavy rounded card.

### Article thumbnails

Thumbnails are part of the approved design direction.

Rules:

- rectangular 16:9-ish crop
- small radius, around 6–8px
- consistent size
- no decorative image when no meaningful source image exists
- use neutral placeholder rather than a random stock image

The thumbnail supports recognition; it must not dominate the title.

---

## 9. Grade styling

Do not use multicolor grade badges.

Preferred:

- `A+`: strong navy typography; optionally a tiny orange dot for exceptional urgency
- `A`: navy
- `B+`, `B`: slightly lighter navy / blue-gray

Grade should communicate hierarchy through weight and tone rather than rainbow colors.

---

## 10. Opportunity styling

Orange is reserved for signal detection.

Primary use:

- `OPPORTUNITY` pill
- new opportunity count
- tiny notification dots
- selected call-to-action emphasis where necessary

Recommended:

```css
background: var(--orange);
color: white;
```

or softer form:

```css
background: var(--orange-soft);
color: #c85e0a;
```

Do not use orange for large surfaces.

---

## 11. Metadata and tags

Metadata should be intentionally desaturated.

Examples:

- category
- timestamp
- source count
- tags
- article count

Tags should generally use soft gray pills:

```css
background: #f2f5f8;
color: #758497;
border: 0;
```

This is important: logo, major headings and important labels can be cool navy; routine UI copy should lose saturation and recede visually.

---

## 12. Right insight rail

The right rail should contain compact, useful intelligence—not generic dashboard decoration.

Recommended modules:

### Key Insights

Top 3 derived insights from the day's events.

Example:

```text
01 피지컬 AI, 실증에서 산업화로
02 주거 정책, 공급 확대 기조 유지
03 행정 디지털화 가속
```

### Sectors

Small ranked list with count:

- 부동산 · 주거
- 행정 · 제도
- 산업 · 기술
- 금융 · 지원
- 환경 · 에너지
- 국제 · 통상

### Optional promotional / product panel

A contained navy panel may be used for future NOAH Pro or deeper intelligence features.

This is one of the few places where a larger dark navy surface is acceptable.

Do not allow the right rail to become louder than Today's Ark.

---

## 13. Administration Korea attribution

The product is planned by 행정사법인 코리아.

Preferred wording:

`기획 · 행정사법인 코리아`

Best placement:

- bottom of left navigation rail, or
- footer / About NOAH area

Styling:

- small size
- muted gray or blue-gray
- no orange
- no large logo treatment

NOAH remains the primary product brand; 행정사법인 코리아 is the planning / institutional attribution.

---

## 14. Borders, radius and shadows

Use restrained geometry.

Recommended:

- radius: 6–10px for cards / controls
- pills: fully rounded only for tags/statuses
- border: 1px `--border-soft` or `--border`
- shadow: almost none

Suggested subtle card shadow only where needed:

```css
box-shadow: 0 1px 2px rgba(8, 35, 63, 0.035),
            0 4px 12px rgba(8, 35, 63, 0.025);
```

Do not use large floating shadows.

---

## 15. Responsive behavior

### Tablet

- collapse left rail into compact navigation
- right insight rail may move below main feed
- keep event thumbnail when width permits

### Mobile

Priority order:

1. Compact header
2. Hero title / date
3. Summary metrics
4. Today's Ark
5. Key Insights
6. Sectors / secondary content

On mobile event rows:

- rank + metadata
- title
- summary
- thumbnail may become full-width under title or be omitted if too dense
- grade remains visible
- tags may wrap or reduce count

Do not simply shrink the desktop three-column layout.

---

## 16. Data / implementation constraints

This is a visual redesign first.

Do not change the core Event scoring model merely to reproduce the mockup.

Reuse current `NoahEvent` data when possible.

If the UI needs optional properties such as thumbnail URL, add them in a backward-compatible manner and document architecture impact.

Do not fabricate real production news images or official content in production mode.

Mock data must remain clearly identified as mock/demo data until real providers are connected.

---

## 17. Suggested component structure

Codex may adapt this to the current repository, but prefer composable components such as:

```text
components/
  AppSidebar.tsx
  IntelligenceHeader.tsx
  SummaryMetrics.tsx
  ArkFeed.tsx
  ArkEventRow.tsx
  KeyInsights.tsx
  SectorSummary.tsx
  AdministrationKoreaAttribution.tsx
```

Do not refactor unrelated backend/domain code just for this UI task.

---

## 18. Acceptance criteria

The implementation is accepted when:

- overall canvas is predominantly white / cool gray
- legacy green / beige visual language is removed
- cool navy is used for brand, headings and key actions
- routine copy is substantially more desaturated gray / blue-gray
- orange appears only as a controlled signal accent
- Today's Ark is a vertical editorial feed rather than a card grid
- each event can show title, summary, metadata, grade, tags and thumbnail
- right-side Key Insights / Sectors exist on desktop
- `기획 · 행정사법인 코리아` appears subtly in the interface
- desktop, tablet and mobile are usable
- existing event/detail navigation continues to work
- no core scoring behavior is unintentionally changed
- no WIP from another agent is overwritten

---

## 19. Codex implementation workflow

Before implementation Codex must:

1. Read `AGENTS.md`.
2. Read this document.
3. Check latest `main`, active branches and PRs.
4. Preserve any uncommitted WIP that produced the currently deployed preview before changing UI files.
5. Work on a branch such as `codex/ui-v2-dashboard`.
6. Re-read `app/page.tsx`, `app/globals.css`, `components/*`, and `types/news.ts` before edits.
7. Prefer incremental component extraction over a full repository rewrite.
8. Run the app and verify desktop/mobile layout.
9. Open a PR with screenshots and implementation notes.

After the PR is opened, ChatGPT should review the diff and rendered UI against this specification before merge.

---

## 20. Final visual principle

**White provides clarity.**

**Cool navy provides authority.**

**Gray provides hierarchy.**

**Orange identifies signal.**

NOAH should look like a professional intelligence product designed by people who understand administration and policy—not like a generic colorful AI dashboard.
