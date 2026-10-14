# NOAH ARK — Housing Intelligence v1 (2026-10-14)

## Why
An advisory agent serving a general-sale agency with a private-rental specialization needs more than a housing news feed: **market evidence + public guarantees/programs + finance structure** in one analyst workspace.

## Product boundary
A single opt-in specialist route /tools/housing, linked from MY BUSINESS. It must never displace the main news/article-first Home. It is NOT an automatic bank credit or HUG guarantee approval tool and must not invent source data.

## Three evidence lanes
1. **Market** — region/project-type/units, real transaction and competitor supply sources, comparable sale/deposit/rent values manually entered by the consultant. Initial official sources: REB R-ONE, Ministry of Land real transaction system, ApplyHome. No automated market data in v1.
2. **Public programs/guarantees** — HUG PF guarantee vs HUG rental deposit guarantee must be clearly separated; HF PF and NHUF private rental construction funds are also distinct. HUG/HF/NHUF original program URLs only. Display links and *review checklist*, never eligible or current approval status.
3. **Financing** — total project cost, equity, borrowing principal, annual borrowing rate, and duration. Show initial financing gap (cost – equity – borrowing) and flat/simple period interest (principal × annual rate × months/12) only when inputs present. This is not lender pricing.

## Calculation boundaries
- Both sale and lease outcomes can be compared under the SAME occupancy/absorption assumption. That percentage is supplied by the user and not inferred from market data.
- Sale: absorption-adjusted units × sale price per unit = illustrative gross contract sales (억원).
- Lease: same units × deposit per unit = **refundable deposits / obligations**, NOT revenue; units × monthly rent (만원) / 10,000 = monthly gross rent (억원), annual ×12. No operating expenses, vacancies beyond user assumption, tax or deposit repayment schedule included.
- Financing gap ignores rental deposits as freely available project cash and excludes fund eligibility, fees, time-varying drawdowns, principal repayment, guarantee fee, sales costs, or financing tax. Negative = arithmetic surplus before contingencies; NOT profit.
- Empty/invalid numbers produce no metric. Never set default housing prices or financing rates.
- No localStorage/server storage of project identity or data. Print/copy preliminary note only when the user requests it.

## Feature implementation
- Isolated client-side typed math in lib/housing/scenario.ts and tests/housing-scenario.test.ts.
- Route with input form and calculated results, official-source links, transparency note and manual actions.
- No automatic external fetch, billable AI calls, market-stat API, HUG/HF live match, institutional eligibility scoring, DB migration, news source ingestion or changes to user preferences.

## Later phase — separate approval
R-ONE API key and provider contract; licensed/sourced small-area competitive housing dataset (5 km / 3 years / 84㎡ definitions); source timestamps and update failures; loan rate source disclosures and time-dependent assumptions; draft memo DOCX/PDF with client approval and data confidentiality.

## Safety and review
- This feature is a human analyst **screening worksheet**, not underwriting or investment advice.
- Confirm typecheck, Vitest, ESLint, build and browser QA before deployment.
- Branch from draft My Business PR #38. Do not merge/redeploy or change production config without owner authorization. Existing protected beta remains untouched.

## Official links to check, not presumed automatically applicable
- R-ONE: https://www.reb.or.kr/r-one/portal/openapi/openApiDevPage.do
- MOLIT real transactions: https://rt.molit.go.kr/
- ApplyHome: https://www.applyhome.co.kr/
- HUG PF: https://m.khug.or.kr/hug/web/cg/pf/cgpf000001.jsp
- HUG refundable deposit protection: https://www.khug.or.kr/hug/web/cg/sd/cgsd000001.jsp
- HF PF: https://www.hf.go.kr/ko/sub02/sub02_04_05.do
- NHUF: https://nhuf.molit.go.kr/
