# NOAH Reader — Split Reading + Instant Word Bubble v1

**Status:** additive review-only implementation stacked on the real-source + real-AI 10-reader beta branch, pending owner release approval. This design addresses user feedback on 2026-10-13: switching tabs to search unfamiliar economic terms interrupts reading and causes the reader to forget the term.

## What is actually implemented

1. **Desktop dual pane:** the original government's official HTTPS webpage is attempted in a **live cross-origin iframe on the left**; the genuine NOAH AI question and OpenAI response remain visible/sticky on the right. Same vetted official source URL / same OpenAI Responses adapter as PR #30. No HTML fetch or body copy in NOAH.
2. **Always-visible fallback:** official websites may send `X-Frame-Options` or CSP `frame-ancestors` that block iframe display. We cannot bypass these protections; "원문 새 창" is **always** available, as is reader clipboard lookup. There is no guarantee that RSS source HTML is embeddable.
3. **Tap a word, see a translucent popover:** the official RSS *headline* and an optional **short user-pasted excerpt** (max 500 characters, held only in local React state, never automatically sent to the AI) are NOAH-owned rendered text. Tap one word in these surfaces to keep the term and open a **translucent in-place contextual bubble**. When the owner connects an API key, the button uses the SAME real AI endpoint and displays the explanation next to the word; never fake a computed answer if AI is unconfigured.
4. **Original webpage word transfer without losing it:** user selects a word in the publisher's original iframe or external tab, presses Copy, then clicks **원문에서 복사한 단어 설명하기**. This reads clipboard content **only after a user gesture**, refuses paragraphs/multiline strings/length greater than 50 characters, and asks the same real AI backend (when configured). It never monitors a publisher page or silently copies its text.
5. **Mobile reading:** responsive original/AI tabs using CSS that keep the iframe mounted between tabs to retain reading position, not two separate navigations. Original new-window fallback persists. Keyboard and button focus are visible.
6. **No mandatory two-article gate**; other perspectives remain voluntary via external Google News search. This is NOT verified opposing-view curation.

## Limitations and honest browser security model

- **NOAH cannot inspect clicks, selections or reading progress inside a cross-origin iframe.** Even when an official site allows embedding, same-origin policy blocks reading its DOM. Only NOAH's own headline / voluntarily pasted short excerpt can support true "tap word" behavior directly inside this app.
- Direct single-tap bubbles on a publisher's **original webpage** would require separately designed and user-installed browser extension/content script or an authorized publisher integration. A mobile web page cannot generally add this to unrelated sites; do not claim it works.
- If iframe is blocked by site policy, no automatic browser API consistently reports the reason to the parent; the fallback is explicit rather than pretending it loaded. We intentionally do not proxy/rehost article bodies or defeat CSP.
- Clipboard read can be denied by permissions/browser or non-secure context. Give manual-paste fallback. No clipboard persistence, polling or analytics.
- The pasted 500-character note is used only in NOAH UI to select a term. The server receives **title + user's question or a chosen term**, not a copied paragraph nor original URL.
- The real AI remains **disabled until the owner's dedicated API key is connected** and real-model QA is performed. CI uses synthetic fixture/mocked HTTP responses only.
- 10-person access remains subject to previous staging/Vercel protection and invite-code setup; no unintended public launch or Vercel production change.

## Tester acceptance

- [ ] Desktop side-by-side stays open while the user changes AI modes.
- [ ] Choose an official RSS source from the disclosure panel and view its original URL. If iframe blocked, external source link visibly works.
- [ ] Click any Korean word in the source headline: popover stays near it, retains the selected word and offers AI lookup.
- [ ] Paste a single short excerpt (<=500 chars), click a term, verify entire excerpt is not transmitted in the request.
- [ ] Copy an original webpage term, click clipboard lookup, question is populated automatically and AI called only when key & invite are configured.
- [ ] Without key, popover shows "AI 연결 후", no invented or stubbed AI response.
- [ ] On mobile, switch reader/AI tabs and preserve the loaded iframe, current source and selected word.
- [ ] Manually verify normal browser keyboard/touch behavior, blocked-frame fallback, iOS clipboard restrictions and response cost before sharing with ten testers.
- [ ] All existing CI typecheck/test/lint/build/http tests pass, with no production changes.

## Follow-up UX options

**Highest-fidelity future experience:** a Chrome/Edge extension that requests the user's explicit permission on original sites and injects an on-selection, low-distraction NOAH glossary bubble. It may be suitable for desktop testing, but requires host permissions, trustworthy onboarding, security audit and a separate authorized API flow. Safari/iOS/mobile support needs its own design. Do not slip the extension into the beta or auto-deploy without owner review.
