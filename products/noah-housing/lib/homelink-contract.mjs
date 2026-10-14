/**
 * Future HOME:LINK → NOAH Housing aggregate interface (schema draft).
 * This function performs schema-level checks only, NOT privacy certification.
 * It is NOT an HTTP endpoint; no live connector is implemented.
 */
export const HOMELINK_SCHEMA = "noah.homelink.demand.aggregate.v1";
const keys = ["schema","source","regionCode","asOf","sampleSize","qualifiedInterestCount","method","useApproved"];
const exactDate = /^\d{4}-\d{2}-\d{2}$/;
export function checkHomeLinkAggregate(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) return { ok:false, reason:"객체가 아닙니다" };
  // Reject all extra keys, e.g., names, contact details, addresses and identifiers.
  if (Object.keys(input).some(key => !keys.includes(key)) || keys.some(key => !(key in input)))
    return { ok:false, reason:"허용되지 않은 필드 또는 누락된 필드" };
  if (input.schema !== HOMELINK_SCHEMA || input.source !== "HOME:LINK")
    return { ok:false, reason:"연계 형식 불일치" };
  if (typeof input.regionCode !== "string" || !/^\d{5}$/.test(input.regionCode))
    return { ok:false, reason:"지역 코드 형식 불일치" };
  if (typeof input.asOf !== "string" || !exactDate.test(input.asOf) ||
      !Number.isFinite(Date.parse(input.asOf + "T00:00:00Z")) ||
      new Date(input.asOf + "T00:00:00Z").toISOString().slice(0,10) !== input.asOf)
    return { ok:false, reason:"기준일 형식 불일치" };
  if (!Number.isSafeInteger(input.sampleSize) || input.sampleSize < 10 ||
      !Number.isSafeInteger(input.qualifiedInterestCount) ||
      input.qualifiedInterestCount < 0 || input.qualifiedInterestCount > input.sampleSize)
    return { ok:false, reason:"표본수 부족 또는 집계 오류" };
  if (input.method !== "deduplicated-user-interest" || input.useApproved !== true)
    return { ok:false, reason:"집계 방법·이용 권한 확인 필요" };
  return { ok:true, aggregate:input };
}
