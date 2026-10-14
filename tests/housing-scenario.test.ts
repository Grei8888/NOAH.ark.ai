import { describe, expect, it } from "vitest";
import { analyzeHousing, type HousingInputs } from "../lib/housing/scenario";

const blank: HousingInputs = {
  units: "", absorptionPercent: "", salePriceEok: "", depositEok: "",
  monthlyRentMan: "", totalCostEok: "", equityEok: "",
  borrowingEok: "", annualRatePercent: "", borrowingMonths: "",
};

describe("Housing Intelligence preliminary arithmetic", () => {
  it("never calculates a fictional default when no project data was entered", () => {
    expect(Object.values(analyzeHousing(blank)).every(v => v === null)).toBe(true);
  });
  it("separates sale consideration, refundable lease deposits, and rental revenue", () => {
    const result = analyzeHousing({
      ...blank, units: "240", absorptionPercent: "80",
      salePriceEok: "5", depositEok: "2", monthlyRentMan: "100",
    });
    expect(result.estimatedUnits).toBe(192);
    expect(result.grossSalesEok).toBe(960);
    expect(result.refundableDepositsEok).toBe(384);
    expect(result.grossMonthlyRentEok).toBeCloseTo(1.92);
    expect(result.grossAnnualRentEok).toBeCloseTo(23.04);
  });
  it("calculates an explicit gap without treating refundable deposits as project finance", () => {
    const result = analyzeHousing({
      ...blank, totalCostEok: "500", equityEok: "100",
      borrowingEok: "300", annualRatePercent: "6", borrowingMonths: "18",
      depositEok: "200",
    });
    expect(result.financingGapEok).toBe(100);
    expect(result.simplePeriodInterestEok).toBe(27);
  });
  it("does not estimate results from incomplete or invalid assumptions", () => {
    const result = analyzeHousing({
      ...blank, units: "12.5", absorptionPercent: "101",
      salePriceEok: "5", borrowingEok: "-10", annualRatePercent: "7",
    });
    expect(result.estimatedUnits).toBeNull();
    expect(result.grossSalesEok).toBeNull();
    expect(result.simplePeriodInterestEok).toBeNull();
  });
  it("allows a negative funding gap to indicate a surplus, not an invented support amount", () => {
    const result = analyzeHousing({
      ...blank, totalCostEok: "100", equityEok: "90", borrowingEok: "30",
    });
    expect(result.financingGapEok).toBe(-20);
  });
});
