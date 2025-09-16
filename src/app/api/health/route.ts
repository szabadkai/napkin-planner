import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const hasGemini = Boolean(process.env.GEMINI_API_KEY);
  return NextResponse.json({ ok: true, env: { gemini: hasGemini } });
}

