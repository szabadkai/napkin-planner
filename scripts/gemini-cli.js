#!/usr/bin/env node
/**
 * Minimal CLI to send a user prompt to Gemini, enriching it with
 * locale/timezone/currency parameters derived from the current system.
 *
 * Usage:
 *   node scripts/gemini-cli.js "Evaluate a coffee cart idea near a campus"
 *   GEMINI_API_KEY=... node scripts/gemini-cli.js "..."
 */

const fs = require('fs');
const path = require('path');

async function main() {
  const userInput = process.argv.slice(2).join(' ').trim();
  if (!userInput) {
    console.error('Usage: node scripts/gemini-cli.js "<your prompt>"');
    process.exit(1);
  }

  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL || process.env.RESEARCH_MODEL || process.env.PLAN_MODEL || 'gemini-1.5-flash';
  if (!apiKey) {
    console.error('Missing GEMINI_API_KEY in environment');
    process.exit(1);
  }

  const systemPath = path.join(process.cwd(), 'prompts', 'system-prompt.md');
  let systemPrompt = '';
  try {
    systemPrompt = fs.readFileSync(systemPath, 'utf8');
  } catch (e) {
    console.error(`Could not read system prompt at ${systemPath}`);
    process.exit(1);
  }

  // Derive location-based params from system settings (no external calls)
  const { locale, timeZone } = new Intl.DateTimeFormat().resolvedOptions();
  const normLocale = (locale || 'en-US').replace('_', '-');
  const region = normLocale.includes('-') ? normLocale.split('-')[1] : 'US';

  const currencyByRegion = {
    US: 'USD', CA: 'CAD', MX: 'MXN', BR: 'BRL', AR: 'ARS', CL: 'CLP', CO: 'COP', PE: 'PEN',
    GB: 'GBP', IE: 'EUR', FR: 'EUR', DE: 'EUR', ES: 'EUR', IT: 'EUR', NL: 'EUR', BE: 'EUR', PT: 'EUR',
    SE: 'SEK', NO: 'NOK', DK: 'DKK', CH: 'CHF', PL: 'PLN', CZ: 'CZK', HU: 'HUF', RO: 'RON',
    AU: 'AUD', NZ: 'NZD', SG: 'SGD', HK: 'HKD', JP: 'JPY', CN: 'CNY', IN: 'INR', ID: 'IDR', PH: 'PHP',
    AE: 'AED', SA: 'SAR', ZA: 'ZAR'
  };
  const currency = currencyByRegion[region] || 'USD';
  const dateFormat = region === 'US' ? 'MM/DD/YYYY' : 'DD/MM/YYYY';

  const userContext = {
    locale: normLocale,
    region,
    timeZone: timeZone || 'UTC',
    currency,
    dateFormat
  };

  const contents = [
    {
      role: 'user',
      parts: [
        {
          text: [
            'User Prompt:\n',
            userInput,
            '\n\nAuto-detected Context (JSON):\n',
            JSON.stringify(userContext)
          ].join('')
        }
      ]
    }
  ];

  const body = {
    contents,
    systemInstruction: { role: 'system', parts: [{ text: systemPrompt }] }
  };

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Gemini API error ${res.status}: ${errText}`);
    }
    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.map(p => p.text).join('\n') ||
                 data?.candidates?.[0]?.content?.parts?.[0]?.text ||
                 JSON.stringify(data, null, 2);
    console.log(text);
  } catch (err) {
    console.error('Failed to call Gemini:', err.message);
    process.exit(1);
  }
}

// Ensure fetch exists (Node 18+). If older Node, fall back to node-fetch if available.
if (typeof fetch === 'undefined') {
  global.fetch = (...args) => import('node-fetch').then(({ default: f }) => f(...args));
}

main();

