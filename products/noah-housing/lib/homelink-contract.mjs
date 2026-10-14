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


/**
 * Future NOAH Housing -> HOME:LINK approved public supply summary.
 * No address/tenant identity is accepted. Matching and publication still require
 * product-owner approval; validating this object sends nothing.
 */
export const SUPPLY_SCHEMA = "noah.housing.supply.summary.v1";
const supplyFields=["schema","source","regionCode","asOf","supplyKind","availableUnits","priceMinEok","priceMaxEok","exportApproved"];
export function checkHousingSupplySummary(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) return {ok:false,reason:"객체가 아닙니다"};
  if (Object.keys(input).some(key=>!supplyFields.includes(key)) || supplyFields.some(key=>!(key in input)))
    return {ok:false,reason:"허용되지 않은 공급정보 또는 필드 누락"};
  if (input.schema!==SUPPLY_SCHEMA || input.source!=="NOAH-HOUSING" || input.exportApproved!==true)
    return {ok:false,reason:"출처 또는 공유승인 확인 필요"};
  if (typeof input.regionCode!=="string" || !/^\d{5}$/.test(input.regionCode) ||
      typeof input.asOf!=="string" || !exactDate.test(input.asOf) ||
      !Number.isFinite(Date.parse(input.asOf+"T00:00:00Z")) ||
      new Date(input.asOf+"T00:00:00Z").toISOString().slice(0,10)!==input.asOf)
    return {ok:false,reason:"지역·기준일 오류"};
  if (!["rental","sale"].includes(input.supplyKind) ||
      !Number.isSafeInteger(input.availableUnits) || input.availableUnits<1 || input.availableUnits>100000 ||
      typeof input.priceMinEok!=="number" || !Number.isFinite(input.priceMinEok) || input.priceMinEok<0 ||
      typeof input.priceMaxEok!=="number" || !Number.isFinite(input.priceMaxEok) || input.priceMaxEok<input.priceMinEok)
    return {ok:false,reason:"공급·가격 범위 오류"};
  return {ok:true,summary:input};
}
