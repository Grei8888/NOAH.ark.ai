# NOAH ARK

Only What Matters. 하나의 사건, 여러 개의 시선.

Review implementation for GitHub Issue #6. Next.js/TypeScript, source-attributed
Event pipeline, structured AI adapter, Prisma/PostgreSQL and isolated SQLite demo.
See [audit](docs/RECOVERED_RUNTIME_AUDIT.md) and [architecture](docs/ARCHITECTURE.md).

## Local mock run

```bash
pnpm install --frozen-lockfile
cp .env.example .env
pnpm setup:mock
pnpm dev
```

Open http://localhost:3000. Mock Events are synthetic, clearly labeled and have no
real-source outbound links. Setup writes only a local SQLite database and discovery
queries, never an owner or consumer profile. Preserve `.env`, databases and generated
clients outside git. Tests use their own UUID-named temporary databases.

```bash
pnpm typecheck
pnpm test
pnpm lint
pnpm build
```

## Live configuration

Set `DB_MODE=postgres`, a separate `DATABASE_URL`, `NEWS_PROVIDER=newsapi|rss|government`,
`AI_PROVIDER=openai`, and server-side provider/AI keys. For RSS set comma-separated
`RSS_FEEDS`; declare validated official feed URLs explicitly in `OFFICIAL_RSS_FEEDS`.
NewsAPI Korean search omits the unsupported language filter; coverage/pagination
limitations intentionally fail rather than publish a partial edition.

Generate clients, review/apply the fresh-schema migration using normal deployment
controls, seed discovery queries, then run `pnpm pipeline`. No real provider call,
production migration or scheduler activation has been verified or performed here.
No consumer login or cross-device user state is implemented yet.

## Routes

- `/`: public/personalized Home over published Event snapshots
- `/event/[id]`: immutable published Event, uncertainty and original-source links
- `/api/ark`: public Edition JSON (`mode`, `date`, `publishedAt`, `items`), no private relevance
- `/api/admin/session`: admin HMAC cookie login, explicit strong secret + origin required
- `/api/admin/[action]`: protected collect/process/full/generate-ark operations
- `/api/cron/[type]`: bearer-authenticated daily/breaking handler, no schedule enabled

Live failures never use a synthetic fallback. Home can show an honest empty edition
until data has been collected, analyzed and published.

Feature branches require Product Owner/ChatGPT review before merging. Archived
recovery and PR #4's Morning Brief experiment are independent and unchanged.

## Personalized Home v1 review layer

Home has local declared-interest personalization, save/hide/undo and five mobile
navigation destinations. `/` starts with public Must Know until interests are selected;
`/?view=my` edits them and `/?view=settings` can opt out/reset. Preferences are mode-
separated and browser-only. Authenticated cross-device state is not simulated.
Perspective affordances count sources, not unverified viewpoint diversity.

After `pnpm setup:mock` and `pnpm build`, run `pnpm test:http` for seven browser-free
HTTP acceptance cases (mock and live-isolation test servers). See
[Home implementation and limitations](docs/HOME_V1_IMPLEMENTATION.md).
Desktop/mobile screenshots and supported browser interaction checks remain pending.
