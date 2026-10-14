import test from "node:test";
import assert from "node:assert/strict";
import { analyze, EMPTY } from "../lib/scenario.mjs";
import { checkHomeLinkAggregate, HOMELINK_SCHEMA, checkHousingSupplySummary, SUPPLY_SCHEMA } from "../lib/homelink-contract.mjs";

test("blank fields do not create fictitious assumptions", () => {
  assert.ok(Object.values(analyze(EMPTY)).every(x => x === null));
});
test("240 units, 80 percent: deposits are liabilities, not sales", () => {
  const r=analyze({...EMPTY,units:"240",absorptionPercent:"80",salePriceEok:"5",depositEok:"2",monthlyRentMan:"100"});
  assert.equal(r.grossSaleEok,960);
  assert.equal(r.refundableDepositEok,384);
  assert.equal(r.grossMonthlyRentEok,1.92);
  assert.equal(r.grossAnnualRentEok,23.04);
});
test("simple interest and financing gap from user input only", () => {
  const r=analyze({...EMPTY,totalCostEok:"500",equityEok:"100",borrowingEok:"300",annualRatePercent:"6",borrowingMonths:"18"});
  assert.equal(r.fundingGapEok,100);
  assert.equal(r.simpleInterestEok,27);
});
test("invalid inputs cannot silently become valid estimates", () => {
  const r=analyze({...EMPTY,units:"10.5",absorptionPercent:"105",salePriceEok:"4",borrowingEok:"-10",annualRatePercent:"7"});
  assert.equal(r.grossSaleEok,null);
  assert.equal(r.simpleInterestEok,null);
});
test("HOME:LINK contract excludes personal fields and small buckets", () => {
  const valid={schema:HOMELINK_SCHEMA,source:"HOME:LINK",regionCode:"28177",asOf:"2026-10-14",sampleSize:40,qualifiedInterestCount:12,method:"deduplicated-user-interest",useApproved:true};
  assert.equal(checkHomeLinkAggregate(valid).ok,true);
  assert.equal(checkHomeLinkAggregate({...valid,contact:"010-1111-1111"}).ok,false);
  assert.equal(checkHomeLinkAggregate({...valid,sampleSize:9}).ok,false);
  assert.equal(checkHomeLinkAggregate({...valid,qualifiedInterestCount:50}).ok,false);
  assert.equal(checkHomeLinkAggregate({...valid,asOf:"2026-02-30"}).ok,false);
  assert.equal(checkHomeLinkAggregate({...valid,useApproved:false}).ok,false);
});

test("Housing supply contract never accepts direct dwelling or customer identifiers", () => {
  const supply = {schema:SUPPLY_SCHEMA, source:"NOAH-HOUSING", regionCode:"28177", asOf:"2026-10-14", supplyKind:"rental", availableUnits:240, priceMinEok:2, priceMaxEok:4, exportApproved:true};
  assert.equal(checkHousingSupplySummary(supply).ok,true);
  assert.equal(checkHousingSupplySummary({...supply,tenantName:"A"}).ok,false);
  assert.equal(checkHousingSupplySummary({...supply,detailedAddress:"Apt 1"}).ok,false);
  assert.equal(checkHousingSupplySummary({...supply,priceMaxEok:1}).ok,false);
  assert.equal(checkHousingSupplySummary({...supply,exportApproved:false}).ok,false);
});
