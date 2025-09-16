import { NextRequest, NextResponse } from "next/server";
import { extractJson } from "@/lib/parse";
import { ResearchResult } from "@/lib/types";
import { SYSTEM_PROMPT } from "@/lib/system_prompt";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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
  type GeminiPart = { text?: string };
  type GeminiContent = { parts?: GeminiPart[] };
  type GeminiCandidate = { content?: GeminiContent };
  const data = (await res.json()) as { candidates?: GeminiCandidate[] };
  const text = (data?.candidates?.[0]?.content?.parts ?? [])
    .map((p) => p?.text || "")
    .join("\n");
  return text;
}

function normalizeResult(raw: unknown): ResearchResult {
  const r = raw as Record<string, unknown> | null | undefined;
  const num = (v: unknown) => (typeof v === "number" ? v : parseFloat(String(v ?? 0))) || 0;
  const int = (v: unknown) => (typeof v === "number" ? Math.round(v) : parseInt(String(v ?? 0))) || 0;
  return {
    business_idea: String(r?.business_idea ?? "Untitled business"),
    location: String(r?.location ?? ""),
    average_price: num(r?.average_price),
    gross_margin_percent: num(r?.gross_margin_percent),
    fixed_monthly_costs_total: num(r?.fixed_monthly_costs_total),
    rent_monthly: num(r?.rent_monthly),
    salaries_monthly: num(r?.salaries_monthly),
    utilities_monthly: num(r?.utilities_monthly),
    other_fixed_costs_monthly: num(r?.other_fixed_costs_monthly),
    variable_cost_per_unit: num(r?.variable_cost_per_unit),
    variable_cost_assumptions: String(r?.variable_cost_assumptions ?? ""),
    target_customers: int(r?.target_customers),
    business_analysis: String(r?.business_analysis ?? ""),
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

    const systemPrompt = SYSTEM_PROMPT;

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
      } catch {
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
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ ok: true, message: "Use POST with { prompt, location } to research." });
}
