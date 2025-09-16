import { NextRequest, NextResponse } from "next/server";
import { extractJson } from "@/lib/parse";
import { ResearchResult } from "@/lib/types";
import { readFile } from "node:fs/promises";

type ReqBody = {
  prompt: string;
  locale?: string;
  region?: string;
  currency?: string; // symbol or code
  location?: string; // city/region override from client
};

async function callGemini(systemPrompt: string, userPrompt: string, apiKey: string): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${apiKey}`;
  const body = {
    systemInstruction: { parts: [{ text: systemPrompt }] },
    contents: [
      {
        role: "user",
        parts: [{ text: userPrompt }],
      },
    ],
  } as const;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(`Gemini API error: ${res.status} ${res.statusText}`);
  }
  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.map((p: any) => p?.text || "").join("\n") || "";
  return text;
}

function normalizeResult(raw: any): ResearchResult {
  const num = (v: any) => (typeof v === "number" ? v : parseFloat(String(v ?? 0))) || 0;
  const int = (v: any) => (typeof v === "number" ? Math.round(v) : parseInt(String(v ?? 0))) || 0;
  return {
    business_idea: String(raw.business_idea ?? "Untitled business"),
    location: String(raw.location ?? ""),
    average_price: num(raw.average_price),
    gross_margin_percent: num(raw.gross_margin_percent),
    fixed_monthly_costs_total: num(raw.fixed_monthly_costs_total),
    rent_monthly: num(raw.rent_monthly),
    salaries_monthly: num(raw.salaries_monthly),
    utilities_monthly: num(raw.utilities_monthly),
    other_fixed_costs_monthly: num(raw.other_fixed_costs_monthly),
    variable_cost_per_unit: num(raw.variable_cost_per_unit),
    variable_cost_assumptions: String(raw.variable_cost_assumptions ?? ""),
    target_customers: int(raw.target_customers),
    business_analysis: String(raw.business_analysis ?? ""),
  };
}

function stubFromPrompt(prompt: string, location?: string): ResearchResult {
  const base = Math.max(1, Math.min(30, prompt.length));
  const avg = 30 + base; // simple heuristic
  const marginPct = 60;
  const variable = avg * (1 - marginPct / 100);
  const rent = 800 + base * 10;
  const salaries = 2000 + base * 20;
  const utilities = 150 + base * 2;
  const other = 100 + base * 3;
  const fixed = rent + salaries + utilities + other;
  const customers = 200 + base * 5;
  return {
    business_idea: prompt,
    location: location || "local",
    average_price: Math.round(avg),
    gross_margin_percent: marginPct,
    fixed_monthly_costs_total: Math.round(fixed),
    rent_monthly: Math.round(rent),
    salaries_monthly: Math.round(salaries),
    utilities_monthly: Math.round(utilities),
    other_fixed_costs_monthly: Math.round(other),
    variable_cost_per_unit: Math.round(variable),
    variable_cost_assumptions: "Derived from average price and margin heuristic.",
    target_customers: Math.round(customers),
    business_analysis:
      "Heuristic estimate: adjust fields to refine. Aim to raise margin or reduce fixed costs to improve viability.",
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as ReqBody;
    if (!body?.prompt || typeof body.prompt !== "string") {
      return NextResponse.json({ error: "Missing prompt" }, { status: 400 });
    }

    const systemPrompt = await readFile(process.cwd() + "/system_prompt.md", "utf8");

    const locale = body.locale || req.headers.get("x-user-locale") || "";
    const region = body.region || req.headers.get("x-user-region") || "";
    const currency = body.currency || req.headers.get("x-user-currency") || "";
    const location = body.location || "";

    const composedUser = [
      `User prompt: ${body.prompt}`,
      location ? `Location: ${location}` : undefined,
      locale ? `Locale: ${locale}` : undefined,
      region ? `Region: ${region}` : undefined,
      currency ? `Currency: ${currency}` : undefined,
      "Respond per the system instructions and end with the required JSON block.",
    ]
      .filter(Boolean)
      .join("\n");

    const apiKey = process.env.GEMINI_API_KEY;

    let result: ResearchResult;
    if (apiKey) {
      try {
        const text = await callGemini(systemPrompt, composedUser, apiKey);
        const json = extractJson(text);
        result = json ? normalizeResult(json) : stubFromPrompt(body.prompt, location);
      } catch (e) {
        // Fallback to stub if API fails
        result = stubFromPrompt(body.prompt, location);
      }
    } else {
      result = stubFromPrompt(body.prompt, location);
    }

    // Ensure fixed_monthly_costs_total is the sum of parts if missing or zero
    if (!result.fixed_monthly_costs_total) {
      result.fixed_monthly_costs_total = Math.max(
        0,
        result.rent_monthly +
          result.salaries_monthly +
          result.utilities_monthly +
          result.other_fixed_costs_monthly
      );
    }

    return NextResponse.json({ ok: true, data: result });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Unknown error" }, { status: 500 });
  }
}
