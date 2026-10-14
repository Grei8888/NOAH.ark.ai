/**
 * Pure, user-input-only first-pass housing business calculations.
 * All capital numbers are KRW 100 million (억원) unless otherwise noted.
 * These outputs are NOT underwriting, an investment recommendation or a cashflow model.
 */
export type HousingInputs = {
  units: string;
  absorptionPercent: string;
  salePriceEok: string;
  depositEok: string;
  monthlyRentMan: string;
  totalCostEok: string;
  equityEok: string;
  borrowingEok: string;
  annualRatePercent: string;
  borrowingMonths: string;
};

export type HousingResults = {
  estimatedUnits: number | null;
  grossSalesEok: number | null;
  refundableDepositsEok: number | null;
  grossMonthlyRentEok: number | null;
  grossAnnualRentEok: number | null;
  financingGapEok: number | null;
  simplePeriodInterestEok: number | null;
};

function value(raw: string, max: number, positive = false): number | null {
  if (raw.trim() === "") return null;
  const num = Number(raw);
  if (!Number.isFinite(num) || num < (positive ? Number.EPSILON : 0) || num > max) return null;
  return num;
}
function nonnegativeProduct(...values: Array<number | null>): number | null {
  if (values.some(v => v === null)) return null;
  const result = (values as number[]).reduce((a, b) => a * b, 1);
  return Number.isFinite(result) ? result : null;
}
export function analyzeHousing(input: HousingInputs): HousingResults {
  const units = value(input.units, 100000, true);
  const absorption = value(input.absorptionPercent, 100);
  const validUnits = units !== null && Number.isInteger(units) ? units : null;
  const estimatedUnits = nonnegativeProduct(validUnits, absorption === null ? null : absorption / 100);
  const salePrice = value(input.salePriceEok, 100000);
  const deposit = value(input.depositEok, 100000);
  const monthlyRent = value(input.monthlyRentMan, 100000);
  const grossSalesEok = nonnegativeProduct(estimatedUnits, salePrice);
  // Tenant deposits remain repayable liabilities. Do not add them to sales revenue.
  const refundableDepositsEok = nonnegativeProduct(estimatedUnits, deposit);
  const grossMonthlyRentEok = nonnegativeProduct(estimatedUnits, monthlyRent === null ? null : monthlyRent / 10000);
  const grossAnnualRentEok = grossMonthlyRentEok === null ? null : grossMonthlyRentEok * 12;

  const totalCost = value(input.totalCostEok, 10000000);
  const equity = value(input.equityEok, 10000000);
  const borrowing = value(input.borrowingEok, 10000000);
  const annualRate = value(input.annualRatePercent, 100);
  const months = value(input.borrowingMonths, 600);
  const financingGapEok = totalCost !== null && equity !== null && borrowing !== null
    ? totalCost - equity - borrowing : null;
  // Flat principal assumption only; excludes drawdown schedules, fees, tax and principal repayments.
  const simplePeriodInterestEok = nonnegativeProduct(
    borrowing, annualRate === null ? null : annualRate / 100,
    months === null ? null : months / 12
  );
  return {
    estimatedUnits, grossSalesEok, refundableDepositsEok,
    grossMonthlyRentEok, grossAnnualRentEok, financingGapEok,
    simplePeriodInterestEok,
  };
}
