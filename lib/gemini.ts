export async function callGemini(model: string, system: string, user: string): Promise<string> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY not set");
  const base = process.env.GEMINI_BASE_URL || "https://generativelanguage.googleapis.com";
  const url = `${base.replace(/\/$/, '')}/v1beta/models/${model}:generateContent?key=${key}`;
  const payload = {
    systemInstruction: { role: "system", parts: [{ text: system }] },
    contents: [{ role: "user", parts: [{ text: user }] }],
    generationConfig: { temperature: 0.2 },
  };
  const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  if (!res.ok) throw new Error(`Gemini call failed: ${await res.text()}`);
  const data = await res.json();
  for (const cand of data.candidates ?? []) {
    for (const part of cand.content?.parts ?? []) {
      const t = part.text as string | undefined;
      if (t) return t;
    }
  }
  return "";
}

