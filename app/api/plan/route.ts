import { NextRequest, NextResponse } from "next/server";
import { callGemini } from "@/lib/gemini";
import { baseNapkinPrompt } from "@/lib/prompts";

export const runtime = "nodejs";

function fillTemplate(template: string, params: Record<string, string>) {
  let out = template;
  for (const [k, v] of Object.entries(params)) {
    out = out.replaceAll(`{{${k}}}`, v);
  }
  return out;
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const p = body?.parameters || {};
  const keys = [
    "business_idea",
    "location",
    "average_price",
    "gross_margin_percent",
    "fixed_monthly_costs_total",
    "fixed_monthly_costs_breakdown",
    "variable_cost_assumptions",
  ] as const;
  const params: Record<string, string> = {} as any;
  for (const k of keys) params[k] = String(p[k] || "");

  const filled = fillTemplate(baseNapkinPrompt, params);
  const planText = await callGemini(
    process.env.PLAN_MODEL || "gemini-1.5-flash",
    "You are a startup advisor generating concise 1-page napkin plans.",
    filled
  );

  return NextResponse.json({ parameters: p, filled_prompt: filled, plan_text: planText });
}

