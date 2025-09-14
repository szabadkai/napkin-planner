import { NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";

export const runtime = "nodejs";

export async function POST(req: Request) {
    try {
        const { prompt, context } = await req.json();
        if (!prompt || typeof prompt !== "string") {
            return NextResponse.json(
                { error: "Missing prompt" },
                { status: 400 }
            );
        }

        const apiKey = process.env.GEMINI_API_KEY;
        const model =
            process.env.GEMINI_MODEL ||
            process.env.RESEARCH_MODEL ||
            process.env.PLAN_MODEL ||
            "gemini-1.5-flash";
        if (!apiKey) {
            return NextResponse.json(
                { error: "Server missing GEMINI_API_KEY" },
                { status: 500 }
            );
        }

        const systemPath = path.join(
            process.cwd(),
            "prompts",
            "system-prompt.md"
        );
        let systemPrompt;
        systemPrompt = fs.readFileSync(systemPath, "utf8");

        console.log(
            "System prompt loaded successfully, length:",
            systemPrompt.length
        );

        // Enhance system prompt with context information
        const contextInfo = context || {};
        const locationText = contextInfo.coords
            ? `${contextInfo.region || 'Unknown'} (GPS: ${contextInfo.coords.lat.toFixed(2)}, ${contextInfo.coords.lon.toFixed(2)})`
            : (contextInfo.region || 'Unknown');

        const enhancedSystemPrompt = [
            systemPrompt,
            "\n\n--- CONTEXT INFORMATION ---",
            `User's Location/Region: ${locationText}`,
            `User's Locale: ${contextInfo.locale || 'Unknown'}`,
            `User's Timezone: ${contextInfo.timeZone || 'Unknown'}`,
            `Detected Currency: ${contextInfo.currency || 'USD'}`,
            contextInfo.coords ? `Geographic Coordinates: ${contextInfo.coords.lat}, ${contextInfo.coords.lon}` : "",
            "\nPlease use this context to provide region-appropriate pricing, costs, and business assumptions. Consider local market conditions, typical wages, rent costs, and business practices for the user's region when suggesting defaults.",
            contextInfo.coords ? "With GPS coordinates available, you can be more precise about local market conditions." : ""
        ].filter(line => line).join("\n");

        const contents = [
            {
                role: "user",
                parts: [
                    {
                        text: [
                            "User Prompt:\n",
                            prompt,
                            "\n\nAuto-detected Context (JSON):\n",
                            JSON.stringify(contextInfo),
                        ].join(""),
                    },
                ],
            },
        ];

        const body = {
            contents,
            systemInstruction: { parts: [{ text: enhancedSystemPrompt }] },
        } as const;

        console.log(
            "Request body:",
            JSON.stringify(
                {
                    contents: body.contents,
                    systemInstructionLength: enhancedSystemPrompt.length,
                    model,
                    contextProvided: contextInfo
                },
                null,
                2
            )
        );

        const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;

        const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });
        if (!res.ok) {
            const err = await res.text();
            return NextResponse.json(
                { error: `Gemini API error ${res.status}`, details: err },
                { status: 502 }
            );
        }
        const data = await res.json();
        const text =
            data?.candidates?.[0]?.content?.parts
                ?.map((p: any) => p.text)
                .join("\n") || data?.candidates?.[0]?.content?.parts?.[0]?.text;
        return NextResponse.json({ text, raw: data });
    } catch (e: any) {
        return NextResponse.json(
            { error: e?.message || "Unknown error" },
            { status: 500 }
        );
    }
}
