// Utilities to extract JSON from LLM text responses

export function extractJson<T = unknown>(text: string): T | null {
  // Try fenced code block first
  const fence = /```(?:json)?\n([\s\S]*?)\n```/i.exec(text);
  if (fence) {
    try {
      return JSON.parse(fence[1]);
    } catch {}
  }
  // Try to find the first { ... } block
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start !== -1 && end !== -1 && end > start) {
    const candidate = text.slice(start, end + 1);
    try {
      return JSON.parse(candidate);
    } catch {}
  }
  return null;
}
