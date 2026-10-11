# NOAH ARK — Brand & Digital Design System v3 (Draft)

> Product owner direction: 2026-10-11. This document supersedes the color, logo, typography, and attribution guidance of `docs/UI_V2_SPEC.md`. Layout ideas in UI v2 can still be reused where compatible.

## Brand identity

- Name: **NOAH ARK**
- Primary statement: **Only What Matters.**
- Editorial philosophy: **하나의 사건, 여러 개의 시선.** / **One Event. Multiple Perspectives.**
- Product: AI-personalized news platform for employed professionals planning or operating a side business, and people preparing for or beginning entrepreneurship.
- Character: premium, discerning, competent, trustworthy, contemporary, welcoming; not stuffy or playful for its own sake.
- Product intent: organize an information flood into Events, show distinct verified perspectives and explain relevance to the user's goals.

## Chosen logo direction

**Concept C Refined — Event Capsule**, with the product owner's preference of Concept C 70% + Concept B 30% as the design direction.

- Low, horizontally elongated capsule/ark with **two restrained overlapping wave/knowledge layers**.
- One small gold circular signal; deep navy primary form; cool gray subordinate layer.
- Simple enough to remain legible at favicon and phone app icon size.
- Convey a modern ark/exploration vessel without explicit weapons or military hardware.
- Periscope association can be hinted at in campaign graphics, but **do not add the old round periscope cartoon to the primary mark**.
- The design image approved in chat is a **visual reference, not an editable, production-ready SVG master**. Rebuild as vector, then review against the reference before replacing the app/site logo. Never auto-trace jagged image edges as the final source.

Required logo deliverables: editable vector master, horizontal lockup, compact app symbol, 1-color navy, reverse white, and restrained navy+gold version. Verify recognition at 16px/24px/32px and at app-launcher sizes, including dark backgrounds.

## Color tokens

```css
:root {
  --noah-navy-950: #0B1F3B;
  --noah-navy-850: #12304E;
  --noah-slate-600: #64748B;
  --noah-gray-300: #CBD2DB;
  --noah-gray-200: #E2E7ED;
  --noah-gray-100: #F2F4F7;
  --noah-gray-50: #F8FAFC;
  --noah-white: #FFFFFF;
  --noah-gold-brand: #D4AF37;
  --noah-gold-ui: #B49A60;
  --noah-ink: #152C46;
  --noah-muted: #66778C;
  --noah-border: #E0E6ED;
}
```

- White/gray backgrounds ~75%; navy/ink hierarchy ~20%; gold 2–3% accents. These are visual heuristics, not rigid pixel quotas.
- Use gold for the logo signal, exceptional selection, and selected premium editorial accents — never as a large filled CTA or the only way to convey status.
- Keep all ordinary text high contrast. Gray-on-gray metadata must remain legible on mobile.
- Do not reintroduce the **orange** highlight system from UI v2 unless the product owner explicitly changes the direction.
- No emerald theme, neon, strong gradients, glowing effects, or indiscriminate colorful badges.

## Type & information hierarchy

- **News titles, body, navigation, controls:** clean Korean gothic/sans, e.g. Pretendard with sensible system fallback.
- **Only very large English display headings / premium editorial section marks:** a disciplined serif, e.g. Georgia or a tested licensed alternative.
- Keep the NOAH ARK wordmark based on the approved logo artwork rather than restyling the wordmark with arbitrary fonts.
- Prioritize Korean legibility, 2-line event headlines, clearly distinguished source/date/summary text, and sufficient mobile touch target size.
- Do not put serif fonts everywhere: usability and fast news scanning win.

## Site & app design

Desktop:
- Compact left navigation with **horizontal logo lockup** rather than oversized standalone mascot.
- Main editorial Event feed with a headline, short explanation, source/time, rank, and licensed/relevant thumbnail when available.
- Right rail with key intelligence, personalized signals, and sector trends.
- Crisp lines, layered cool-gray surfaces, near-zero shadow, restrained radius; design for a content platform, not a flashy dashboard.
- The primary navigation should have fewer core destinations than the earlier demo and expand progressively.

Mobile:
- Content-first top header, brand symbol+wordmark.
- Today's curated events visible immediately, minimal hero height, bottom or compact navigation.
- Thumb-friendly save / not interested / source action; readable multi-view coverage.
- Secondary rail panels move below content or into a separate insight surface.
- Support real responsive behavior, never shrink the desktop three-column grid to fit.

Editorial imagery:
- Source-relevant, correctly attributed and legally usable images only.
- Missing images should not be replaced with deceptive generic photos that appear to document a real event.
- Premium is achieved by spacing, hierarchy, source confidence, and visual consistency — not decorative scenery.

## Attribution

NOAH ARK is the consumer brand. **Do not show `기획 · 행정사법인 코리아`** in the product header, main screens, or default footer. If there is a genuine formal sponsor relationship approved for publication, a subdued `Supported by 행정사법인 코리아` can be considered in About only. Legally required operator details belong in the appropriate policy/footer documents once determined.

## Design acceptance checklist

1. Logo family looks like one brand at desktop header, mobile header, favicon, and app icon sizes.
2. Logo remains recognizable in navy-only mode and inverted white mode.
3. White, navy, layered cool gray predominate; gold is sparse and purposeful.
4. English editorial display serif is limited; Korean dense text is a legible gothic/sans.
5. The first screen answers: what matters, why it matters, and how to open differing perspectives.
6. Mobile content readability, color contrast, focus state, keyboard navigation and tap sizes pass manual review.
7. No unsupported sponsorship/producer credit or fabricated production news imagery.
8. No application source rewrite, branch integration, or deployment occurs merely because this design document is merged.
