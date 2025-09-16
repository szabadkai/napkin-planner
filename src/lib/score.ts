import { ViabilityCalc, ViabilityInputs } from "./types";

function clamp(n: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, n));
}

export function computeViability(inputs: ViabilityInputs): ViabilityCalc {
  const {
    average_price,
    variable_cost_per_unit,
    fixed_monthly_costs_total,
    target_customers,
    ramp_months = 3,
  } = inputs;

  const contributionPerUnit = Math.max(0, average_price - variable_cost_per_unit);
  const monthlyGrossProfit = contributionPerUnit * target_customers;
  const monthlyNetProfit = monthlyGrossProfit - fixed_monthly_costs_total;

  const cm = contributionPerUnit;
  const breakEvenCustomersPerMonth = cm > 0 ? fixed_monthly_costs_total / cm : null;

  // Build a 24-month cumulative profit series with linear ramp to target_customers
  const months = 24;
  let cumulative = 0;
  const series: ViabilityCalc["series"] = [];
  let breakEvenMonth: number | null = null;
  for (let m = 1; m <= months; m++) {
    const rampProgress = Math.min(1, m / Math.max(1, ramp_months));
    const customers = target_customers * rampProgress;
    const monthlyProfit = customers * contributionPerUnit - fixed_monthly_costs_total;
    cumulative += monthlyProfit;
    series.push({ month: m, customers, monthlyProfit, cumulativeProfit: cumulative });
    if (breakEvenMonth === null && cumulative >= 0) {
      breakEvenMonth = m;
    }
  }

  // Viability score heuristic: blend profitability and speed to break-even
  const base = monthlyNetProfit >= 0 ? 65 : 35;
  const profitFactor = fixed_monthly_costs_total > 0
    ? (monthlyNetProfit / fixed_monthly_costs_total) * 25
    : monthlyNetProfit > 0
      ? 25
      : -25;
  const speedFactor = breakEvenMonth ? (24 - breakEvenMonth) * (10 / 24) : monthlyNetProfit > 0 ? 10 : -10;
  const viabilityScore = clamp(base + profitFactor + speedFactor);

  return {
    contributionPerUnit,
    monthlyGrossProfit,
    monthlyNetProfit,
    breakEvenCustomersPerMonth,
    viabilityScore,
    series,
    breakEvenMonth,
  };
}

