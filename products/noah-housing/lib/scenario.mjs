// Pure local arithmetic. Amounts: 억원 unless explicitly marked 만원.
export const EMPTY = Object.freeze({
  units: "", absorptionPercent: "", salePriceEok: "", depositEok: "",
  monthlyRentMan: "", totalCostEok: "", equityEok: "", borrowingEok: "",
  annualRatePercent: "", borrowingMonths: "",
});
function num(raw, max, positive = false) {
  if (typeof raw !== "string" && typeof raw !== "number") return null;
  if (String(raw).trim() === "") return null;
  const n = Number(raw);
  return Number.isFinite(n) && n <= max && (positive ? n > 0 : n >= 0) ? n : null;
}
function mul(...factors) {
  return factors.every(x => x !== null) && Number.isFinite(factors.reduce((a,b) => a*b,1))
    ? factors.reduce((a,b) => a*b,1) : null;
}
export function analyze(input) {
  const units = num(input.units, 100000, true);
  const count = units !== null && Number.isInteger(units) ? units : null;
  const ratio = num(input.absorptionPercent, 100);
  const effective = mul(count, ratio === null ? null : ratio / 100);
  const sale = num(input.salePriceEok, 100000);
  const deposit = num(input.depositEok, 100000);
  const rent = num(input.monthlyRentMan, 100000);
  const cost = num(input.totalCostEok, 10000000);
  const equity = num(input.equityEok, 10000000);
  const borrow = num(input.borrowingEok, 10000000);
  const rate = num(input.annualRatePercent, 100);
  const months = num(input.borrowingMonths, 600);
  const monthly = mul(effective, rent === null ? null : rent / 10000);
  return {
    effectiveUnits: effective,
    grossSaleEok: mul(effective, sale),
    refundableDepositEok: mul(effective, deposit),
    grossMonthlyRentEok: monthly,
    grossAnnualRentEok: monthly === null ? null : monthly * 12,
    fundingGapEok: cost === null || equity === null || borrow === null ? null : cost - equity - borrow,
    simpleInterestEok: mul(borrow, rate === null ? null : rate / 100, months === null ? null : months / 12),
  };
}
export function fmt(value, unit = "억원") {
  return value === null ? "—" : new Intl.NumberFormat("ko-KR", { maximumFractionDigits: 2 }).format(value) + " " + unit;
}
