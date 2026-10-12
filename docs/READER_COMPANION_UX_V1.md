# NOAH ARK — Reader Companion UX v1.0 (owner-approved principles; design only)

Status: **Draft design only / not implemented, not deployed**. Owner direction, 2026-10-12: **two original articles are recommended, never required** for AI assistance, reading access, comparisons or source recommendations.

## Product promise

**기사를 대신 읽는 AI가 아니라, 기사를 더 깊게 읽게 돕는 AI.**

NOAH respects publisher original-reporting traffic, encourages intellectual curiosity and source diversity, and lets people decide what else to read. No moralizing about political alignment or compulsory steps.

## Event / reader entry

1. Event teaser card: neutral event title, concise verified fact/signal and explicit uncertainty label where needed; show publisher-linked items individually, distinct official government primary references, no republished body or news photos without permission.
2. A reader can **open any original anytime** (outbound publisher site). No forced two-link gate, timer, quiz, subscription handoff or "you must read this first" content blocker from NOAH.
3. **NOAH AI 이해 도우미** stays visible from the beginning via inline prompt suggestions (user chooses, doesn't interrupt reading):
   - **용어 설명** — "이 주제에서 어려운 용어를 쉽게 설명해 줘."
   - **배경 이해** — "이 사건을 이해하려면 어떤 제도를 알아야 해?"
   - **비판적 독해** — "이런 주장을 검토할 때 필요한 근거는 뭐야?"
   - **다른 관점** — "같은 사건을 다른 시각으로 다룬 원문 링크를 찾아줘."
4. After opening one publisher article, display one quiet optional module **시야를 넓혀보세요**, linking 1–3 *actually available, rights-cleared and independently reported* further originals:
   - "이 사건을 다르게 해석한 보도도 있어요."
   - "공통 사실과 해석의 차이를 살펴보세요."
   - "정부 발표 원문도 확인할 수 있어요."
   No claim of source diversity or two distinct editorial positions without evidence. Same syndicated origin counts once.
5. User can ignore/dismiss all recommendations, return to article, ask one simple question, or exit. Never block normal navigation.

## Progressive-disclosure wireframe

```
[EVENT] 신뢰할 수 있는 사건명 · 근거/확인중 구분
  [원문 A ↗ 언론사 이름]   [원문 B ↗ 언론사 이름]    [공식 자료 ↗]
  [NOAH AI에게 질문하기]
  [용어 설명] [배경 이해] [비판적 독해] [다른 관점]
  (question input, no forced steps; may work without reading any article)
  --------------------------------------------------------
  [시야를 넓혀보세요] (optional, dismissible)
  [다른 시각의 기사 ↗] [이 주장의 근거는?]
```

Mobile: 1-column compact event + original-source cards, horizontally wrapping optional questions, one dismissible subtle recommendation row after the primary reading controls. Desktop: the same hierarchy; related reading may be the side rail. Primary reading content retains visual priority over AI.

## Rights and truthful AI behaviors

- **General-background mode (first phase):** AI may answer conceptual questions using sources it is independently entitled to use; must not pretend to have inspected a specific publisher article. It should distinguish general knowledge from facts supported by an actually accessed source. If article-specific comparison isn't authorized or data unavailable, show: `해당 기사 본문은 확인하지 않았습니다. 원문을 직접 읽으면서 살펴볼 질문을 제안해 드릴게요.`
- **Licensed article-context mode (future):** only if publisher agreement explicitly allows the necessary storage/automated analysis and AI data use. Separate data processors, retention, attribution, revocation and derivative content terms.
- User clicking an article does **not** imply reading it. No "읽기 완료 인증", no AI gating by number of opened links.
- **Curiosity prompts, not declared knowledge:** If a source is missing/unverified, never invent a "counterargument" article, publisher position, or AI evidence. Distinguish independent reporting from commentary and publisher syndication.
- **Bias and fact integrity:** No rigid progressive-vs-conservative ratio, no both-sides treatment of demonstrably false claims. "다른 관점" means materially different evidence/interpretation *when actually present*, not fabricated parity.

## Measurable tests (consent/privacy-aware)

- Primary: users' optional outbound-original link clicks per Event; clicks to *additional independent* sources; voluntary AI questions; user-rated perceived understanding.
- Guardrails: no rise in misattributed claims, dead original links, excessive recommendation interruptions, AI claims of having read unavailable content, or copyright-policy violations.
- Do not label click count as completed reading. Avoid collecting personally identifying cross-site browsing histories; prefer anonymous aggregated events where lawful and opt-in notices as required.
- A/B hypothesis: single calm “다른 시각도 살펴보기” suggestion may produce more voluntary second-source visits than gated unlocking. **No empirical uplift claimed before experiment.**

## Acceptance criteria

- [ ] Primary source links always work without an AI gate.
- [ ] Concept-help affordance visible before any original is opened.
- [ ] More viewpoints is optional, dismissible, evidence-grounded and non-coercive.
- [ ] Article-specific AI interaction is rights-gated; no pretend knowledge.
- [ ] Display publisher attribution, preserve existing official-source filtering, beta submission and local saved/hidden states.
- [ ] Accessible keyboard/mobile/large-text layout and reduced-motion behavior.
- [ ] Product owner approves review-only UI changes prior to Vercel production deploy.
- [ ] Run regression/typecheck/lint/build and manual actual-browser QA when implemented.

Depends on GitHub #24 (baseline stabilization) and #26 (publisher permissions); Draft PR #27 has only **candidate registry + documentation**, no production four-filter UI or AI Reader yet.
