# NOAH Housing Intelligence

독립적으로 설치·실행·배포할 수 있는 NOAH Housing Intelligence v0.1 예비검토 애플리케이션.

## Product boundary

- **NOAH ARK:** 뉴스·정책 변화의 발견 및 원문 독해 (기존 운영 제품 유지)
- **NOAH Housing:** 주거개발·일반분양·민간임대 사업 검토, 시장·보증·금융 가설 비교
- **HOME:LINK:** 입주자 측 수요·조건·매칭; Housing에 개인정보 없는 검증된 *집계 신호*를 제공할 수 있는 미래 시스템

### Standalone install

From this directory:

\`\`\`bash
npm install
npm run dev
npm test
npm run build
\`\`\`

Use a **separate** Vercel project with Root Directory = \`products/noah-housing\`; do not modify the existing NOAH ARK production Vercel project. Deployment is subject to product-owner review and commercial hosting/license compliance. This project is not deployed by this PR.

## Implemented

- Site for separate NOAH Housing brand and a local-input consultant worksheet.
- Aggregate sale/lease comparison: sale gross amounts, **refundable** lease deposits (not revenue), monthly/annual **gross** rent.
- Cost/equity/borrowing gap and interest arithmetic (static principal, simple accrual, no phasing or fees).
- Institution **official homepage links**, not live entitlement or guarantee results.
- A HOME:LINK future integration tile marked **not connected** and a strict **schema draft** in \`lib/homelink-contract.mjs\`.
- No customer names required, no database, no cookies, no external provider/API calls, no mock market figures, no paid model calls and no localStorage.
- Node built-in tests for arithmetic, input safety, and non-PII aggregate contract.

## Connecting products later

**ARK → Housing:** ARK displays an outbound link only when \`NEXT_PUBLIC_NOAH_HOUSING_URL\` is configured with an approved HTTPS URL. Otherwise it displays a non-clickable future tool notice. No automatic user data handoff.

**Housing → ARK:** optional public URL \`NEXT_PUBLIC_NOAH_ARK_URL\`; link-only.

**HOME:LINK → Housing:** *not integrated yet*. Future contract: \`schema/source/regionCode/asOf/sampleSize/qualifiedInterestCount/method/useApproved\`. No contact data, address, per-person eligibility, customer identifiers or automatically claimed conversions. Validation of a schema does **not** mean consent or anonymization was legally confirmed. Before any API: real HOME:LINK repository/system, documented lawful basis, purpose limitation, bounded geography, aggregation threshold, anti-differencing protections, authenticated signed transport, audit, retention and cross-service approval are required.

## Out of scope (must not be misrepresented)

No automatic transaction feeds, geo/area normalization, supply and vacancy forecasts, verified HUG/HF eligibility, lending rates, underwriting, financial profitability, or real HOME:LINK conversion statistics.

## Engineering safety

Review only: product app is added within NOAH's existing Git repository until a separate repository is explicitly created. The app is **technically independent**, with its own package and Next root, but not yet migrated to a separate GitHub repository. Existing ARK production remains pinned and unaffected; do not merge/deploy without owner review.
