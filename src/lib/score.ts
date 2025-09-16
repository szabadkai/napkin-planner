import { ViabilityCalc, ViabilityInputs } from "./types";

function clamp(n: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, n));
}

function toNum(v: unknown, fallback = 0) {
  const n = typeof v === "number" ? v : parseFloat(String(v));
  return Number.isFinite(n) ? n : fallback;
}

export function computeViability(inputs: ViabilityInputs): ViabilityCalc {
  const avg = toNum(inputs.average_price);
  const varCost = toNum(inputs.variable_cost_per_unit);
  const fixed = toNum(inputs.fixed_monthly_costs_total);
  const targets = Math.max(0, Math.round(toNum(inputs.target_customers)));
  const ramp = Math.max(1, Math.round(toNum(inputs.ramp_months ?? 3, 3)));

  const contributionPerUnit = Math.max(0, avg - varCost);
  const monthlyGrossProfit = contributionPerUnit * targets;
  const monthlyNetProfit = monthlyGrossProfit - fixed;

  const cm = contributionPerUnit;
  const breakEvenCustomersPerMonth = cm > 0 ? fixed / cm : null;

  // Build a 24-month cumulative profit series with linear ramp to target_customers
  const months = 24;
  let cumulative = 0;
  const series: ViabilityCalc["series"] = [];
  let breakEvenMonth: number | null = null;
  for (let m = 1; m <= months; m++) {
    const rampProgress = Math.min(1, m / ramp);
    const customers = targets * rampProgress;
    const monthlyProfit = customers * contributionPerUnit - fixed;
    cumulative += monthlyProfit;
    series.push({ month: m, customers, monthlyProfit, cumulativeProfit: cumulative });
    if (breakEvenMonth === null && cumulative >= 0) {
      breakEvenMonth = m;
    }
  }

  // Viability score heuristic: blend profitability and speed to break-even
  const base = monthlyNetProfit >= 0 ? 65 : 35;
  const profitFactor = fixed > 0 ? (monthlyNetProfit / fixed) * 25 : monthlyNetProfit > 0 ? 25 : -25;
  const speedFactor = breakEvenMonth ? (24 - breakEvenMonth) * (10 / 24) : monthlyNetProfit > 0 ? 10 : -10;
  const viabilityScore = clamp(base + profitFactor + speedFactor);

  return {
    contributionPerUnit: toNum(contributionPerUnit),
    monthlyGrossProfit: toNum(monthlyGrossProfit),
    monthlyNetProfit: toNum(monthlyNetProfit),
    breakEvenCustomersPerMonth,
    viabilityScore: toNum(viabilityScore),
    series,
    breakEvenMonth,
  };
}
