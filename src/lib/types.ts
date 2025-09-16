export type ResearchResult = {
  business_idea: string;
  location: string;
  average_price: number;
  gross_margin_percent: number; // 0-100
  fixed_monthly_costs_total: number;
  rent_monthly: number;
  salaries_monthly: number;
  utilities_monthly: number;
  other_fixed_costs_monthly: number;
  variable_cost_per_unit: number;
  variable_cost_assumptions: string;
  target_customers: number; // per month
  business_analysis: string;
};

export type ViabilityInputs = ResearchResult & {
  ramp_months?: number; // months to reach target_customers
};

export type ViabilityCalc = {
  contributionPerUnit: number;
  monthlyGrossProfit: number;
  monthlyNetProfit: number;
  breakEvenCustomersPerMonth: number | null; // customers needed per month to break even
  viabilityScore: number; // 0-100
  series: { month: number; customers: number; monthlyProfit: number; cumulativeProfit: number }[];
  breakEvenMonth: number | null; // first month cumulative >= 0
};

