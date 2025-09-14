import { NextRequest, NextResponse } from "next/server";
import { callGemini } from "@/lib/gemini";

export const runtime = "nodejs";

const RESEARCH_SYSTEM =
  "You are a pragmatic startup research assistant. Given an initial idea, " +
  "infer reasonable, back-of-the-envelope parameters for a napkin business calculator. " +
  "When precise data is unavailable, use sane estimates and clearly mark them as estimates. " +
  "Prefer local currency for the provided location. Respond ONLY with a strict JSON object, no prose.";

const RESEARCH_INSTRUCTION =
  "Return a compact JSON with keys: business_idea, location, average_price, gross_margin_percent, " +
  "fixed_monthly_costs_total, fixed_monthly_costs_breakdown, variable_cost_assumptions, notes, sources, " +
  // Expanded optional fields; missing values are fine
  "billing_model, setup_fee, discounts, taxes, target_customers, sales_cycle_days, trial_conversion_rate, cac, churn_rate, arpu, headcount_plan, tools_licenses, runway_months, burn_rate.\n\n" +
  "Guidelines:\n" +
  "- average_price: include unit, e.g., '€400/month per client'\n" +
  "- gross_margin_percent: like '50%'\n" +
  "- fixed_monthly_costs_total: single currency figure, e.g., '€8,000'\n" +
  "- fixed_monthly_costs_breakdown: short list, e.g., 'rent + salaries + tools'\n" +
  "- variable_cost_assumptions: e.g., 'beans + servicing'\n" +
  "- notes: 1-2 short bullets about assumptions\n" +
  "- sources: optional list of high-level sources or heuristics\n";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const idea = String(body?.idea || "").trim();
  if (!idea) return NextResponse.json({ error: "Idea is required" }, { status: 400 });
  const location = String(body?.location || "").trim();
  const currency = String(body?.currency || "").trim();

  const parts: string[] = [
    `Idea: ${idea}`,
    location ? `Location: ${location}` : "",
    currency ? `Preferred currency: ${currency}` : "",
    "",
    RESEARCH_INSTRUCTION,
  ].filter(Boolean);

  const text = await callGemini(process.env.RESEARCH_MODEL || "gemini-1.5-flash", RESEARCH_SYSTEM, parts.join("\n"));

  let data: any;
  try {
    data = JSON.parse(text);
  } catch {
    const s = text.indexOf("{");
    const e = text.lastIndexOf("}");
    if (s >= 0 && e > s) data = JSON.parse(text.slice(s, e + 1));
    else return NextResponse.json({ error: "LLM response was not valid JSON" }, { status: 502 });
  }

  const out = {
    business_idea: String(data.business_idea || idea),
    location: String(data.location || location || ""),
    average_price: String(data.average_price || ""),
    gross_margin_percent: String(data.gross_margin_percent || ""),
    fixed_monthly_costs_total: String(data.fixed_monthly_costs_total || ""),
    fixed_monthly_costs_breakdown: String(data.fixed_monthly_costs_breakdown || ""),
    variable_cost_assumptions: String(data.variable_cost_assumptions || ""),
    notes: data.notes || null,
    sources: data.sources || null,
    billing_model: String(data.billing_model || ""),
    setup_fee: String(data.setup_fee || ""),
    discounts: String(data.discounts || ""),
    taxes: String(data.taxes || ""),
    target_customers: String(data.target_customers || ""),
    sales_cycle_days: String(data.sales_cycle_days || ""),
    trial_conversion_rate: String(data.trial_conversion_rate || ""),
    cac: String(data.cac || ""),
    churn_rate: String(data.churn_rate || ""),
    arpu: String(data.arpu || ""),
    headcount_plan: String(data.headcount_plan || ""),
    tools_licenses: String(data.tools_licenses || ""),
    runway_months: String(data.runway_months || ""),
    burn_rate: String(data.burn_rate || ""),
  };
  return NextResponse.json(out);
}
