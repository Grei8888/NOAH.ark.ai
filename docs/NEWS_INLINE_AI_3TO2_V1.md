# NOAH ARK — Inline 3:2 Article + AI Companion (10-reader beta)

Owner direction (2026-10-13): shrink the largely informational rightmost rail; instead, split the central NEWS publisher-discovery section into **article titles : contextual AI question panel = 3 : 2**.

## Actual scope
- `AppShell` accepts `compactRail` (default false); only the working search-discovery Home / Discover / Startup requests the smaller right rail. Other pages retain their layout.
- On desktop, within NEWS: `newsAiSplit` uses a 3fr : 2fr grid, with source-credited actual publisher article results on left and a sticky real-API AI question panel on right.
- Select an actual SerpApi-returned article with **AI에게 질문**; its title/publisher and direct HTTPS original link appear in the right panel. Reader chooses **용어 설명 / 배경 이해 / 비판적 독해 / 다른 관점**, enters their own question, optionally enters the issued tester code.
- **Genuine reuse**: `POST /api/lab/reader`, existing preview-only lab security/invite limits and `lib/news/reader-companion.ts`; not a fake/synthetic AI response. Request sends ONLY the actual selected title, mode, question; no third-party body, URL or photograph. Search API remains cached; article click does not cause another SerpApi query.
- **No paid key:** the question UI remains visible but explicitly says AI is unconnected and the send button is disabled. Never manufacture a plausible answer.
- Preserve direct clickthrough original and add optional full split-original /lab/reader link where that lab is configured.
- User's **two-source reading remains voluntary**, not an AI access gate.
- On <=767px width, show switchable *기사 목록 / AI 질문* tabs, select article automatically enters the AI view; no side-scrolling.
- On narrow tablet, the global rail moves beneath main content to preserve useful width; the existing desktop navigation remains.
- All existing official govt RSS, publisher provenance, Google feedback and outgoing original links stay untouched. The old right rail stats stay visible but use less width.

## UI runtime verification
- Desktop 1440/1280/1024: verify main content expands and internal 3:2 split never overflows. Verify right rail shrink only in the news views.
- Mobile 320/390/430: switch tabs; select one actual publisher article; verify outlet + title + direct HTTPS original appears in AI panel; restore list without losing selection.
- Click title or original link; publisher website opens without being copied/proxied.
- Switch among all four types, enter tester invite, call actual AI only when owner explicitly connected a Preview-scoped API key; normal non-invite requests blocked by existing endpoint.
- Select a different article mid-request: previous answer is not shown under a different article.
- News search API degraded: show actual provider diagnostic and original Google News external search fallback; no fake headline.
- Check old production alias unchanged and that no costs occur simply from loading the inline panel.

## Risk
- Not yet externally verified with billed OpenAI: without an API key only UX is available, as designed.
- In-server per-invite rate caps are best effort, not a distributed hard monetary guardrail.
- This PR is stacked on latest working SerpApi query-compat Draft PR. **Do not merge to stale main or silently redeploy Production.** Owner reviews staging before opening 10 invites.
