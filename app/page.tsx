"use client";

import { useMemo, useState, useEffect } from 'react';
import {
  calculateRevenue,
  calculateGrossProfit,
  calculateNetProfit,
  calculateBreakEvenCustomers,
} from '@/lib/calculations';
import ResultsTable from '@/components/ResultsTable';
import BreakEvenChart from '@/components/BreakEvenChart';

type GeminiResponse = { text?: string; raw?: unknown };

export default function HomePage() {
  const [prompt, setPrompt] = useState('');
  const [aiResult, setAiResult] = useState<GeminiResponse | null>(null);
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Manual inputs as fallback/override
  const [businessIdea, setBusinessIdea] = useState('');
  const [location, setLocation] = useState('');
  const [averagePrice, setAveragePrice] = useState(20);
  const [grossMarginPercent, setGrossMarginPercent] = useState(60);
  const [fixedMonthlyCosts, setFixedMonthlyCosts] = useState(2000);
  const [targetCustomers, setTargetCustomers] = useState(200);
  const [currency, setCurrency] = useState('USD');
  const [businessAnalysis, setBusinessAnalysis] = useState('');
  const [hasCompletedAnalysis, setHasCompletedAnalysis] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Set initial currency based on locale
    const locale = typeof navigator !== 'undefined' ? navigator.language : 'en-US';
    let region = 'US';
    if (locale.includes('-')) {
      region = locale.split('-')[1].toUpperCase();
    } else {
      const languageToCountry: Record<string, string> = {
        'hu': 'HU', 'pl': 'PL', 'cz': 'CZ', 'sk': 'SK',
        'de': 'DE', 'fr': 'FR', 'es': 'ES', 'it': 'IT',
        'nl': 'NL', 'se': 'SE', 'no': 'NO', 'dk': 'DK'
      };
      region = languageToCountry[locale.toLowerCase()] || 'US';
    }

    const currencyByRegion: Record<string, string> = {
      US: 'USD', CA: 'CAD', MX: 'MXN', BR: 'BRL', AR: 'ARS', CL: 'CLP', CO: 'COP', PE: 'PEN',
      GB: 'GBP', IE: 'EUR', FR: 'EUR', DE: 'EUR', ES: 'EUR', IT: 'EUR', NL: 'EUR', BE: 'EUR', PT: 'EUR',
      SE: 'SEK', NO: 'NOK', DK: 'DKK', CH: 'CHF', PL: 'PLN', CZ: 'CZK', HU: 'HUF', RO: 'RON',
      AU: 'AUD', NZ: 'NZD', SG: 'SGD', HK: 'HKD', JP: 'JPY', CN: 'CNY', IN: 'INR', ID: 'IDR', PH: 'PHP',
      AE: 'AED', SA: 'SAR', ZA: 'ZAR'
    };

    const initialCurrency = currencyByRegion[region] || 'USD';
    console.log('Initial page load - locale:', locale, 'region:', region, 'currency:', initialCurrency);
    setCurrency(initialCurrency);
  }, []);

  const revenue = useMemo(
    () => calculateRevenue(averagePrice, targetCustomers),
    [averagePrice, targetCustomers]
  );
  const grossProfit = useMemo(
    () => calculateGrossProfit(revenue, grossMarginPercent),
    [revenue, grossMarginPercent]
  );
  const netProfit = useMemo(
    () => calculateNetProfit(grossProfit, fixedMonthlyCosts),
    [grossProfit, fixedMonthlyCosts]
  );
  const breakEven = useMemo(
    () => calculateBreakEvenCustomers(fixedMonthlyCosts, averagePrice, grossMarginPercent),
    [fixedMonthlyCosts, averagePrice, grossMarginPercent]
  );

  const getLocationInfo = async () => {
    return new Promise<{locale: string, timeZone: string, region: string, coords?: {lat: number, lon: number}}>((resolve) => {
      const locale = navigator.language;
      const { timeZone } = Intl.DateTimeFormat().resolvedOptions();

      // Extract region from locale (e.g., 'hu-HU' -> 'HU', 'en-US' -> 'US')
      let region = 'US'; // default
      if (locale.includes('-')) {
        region = locale.split('-')[1].toUpperCase();
      } else {
        // Handle cases like 'hu' -> 'HU'
        const languageToCountry: Record<string, string> = {
          'hu': 'HU', 'pl': 'PL', 'cz': 'CZ', 'sk': 'SK',
          'de': 'DE', 'fr': 'FR', 'es': 'ES', 'it': 'IT',
          'nl': 'NL', 'se': 'SE', 'no': 'NO', 'dk': 'DK'
        };
        region = languageToCountry[locale.toLowerCase()] || 'US';
      }

      console.log('Browser locale:', locale);
      console.log('Detected region from locale:', region);

      // Try to get geolocation
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({
              locale,
              timeZone,
              region,
              coords: {
                lat: position.coords.latitude,
                lon: position.coords.longitude
              }
            });
          },
          (error) => {
            console.log('Geolocation error:', error.message);
            resolve({ locale, timeZone, region });
          },
          { timeout: 5000, enableHighAccuracy: false }
        );
      } else {
        resolve({ locale, timeZone, region });
      }
    });
  };

  const onAiStart = async () => {
    if (!mounted || isLoading) return;

    setIsLoading(true);
    setAiResult(null);
    setHasCompletedAnalysis(false);

    const locationInfo = await getLocationInfo();
    const currencyByRegion: Record<string, string> = {
      US: 'USD', CA: 'CAD', MX: 'MXN', BR: 'BRL', AR: 'ARS', CL: 'CLP', CO: 'COP', PE: 'PEN',
      GB: 'GBP', IE: 'EUR', FR: 'EUR', DE: 'EUR', ES: 'EUR', IT: 'EUR', NL: 'EUR', BE: 'EUR', PT: 'EUR',
      SE: 'SEK', NO: 'NOK', DK: 'DKK', CH: 'CHF', PL: 'PLN', CZ: 'CZK', HU: 'HUF', RO: 'RON',
      AU: 'AUD', NZ: 'NZD', SG: 'SGD', HK: 'HKD', JP: 'JPY', CN: 'CNY', IN: 'INR', ID: 'IDR', PH: 'PHP',
      AE: 'AED', SA: 'SAR', ZA: 'ZAR'
    };

    console.log('Location info:', locationInfo);
    console.log('Detected region:', locationInfo.region);
    console.log('Currency mapping for region:', currencyByRegion[locationInfo.region]);

    const detectedCurrency = currencyByRegion[locationInfo.region] || 'USD';
    console.log('Final detected currency:', detectedCurrency);

    const context = {
      ...locationInfo,
      currency: detectedCurrency
    };

    try {
      const res = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, context })
      });
      const data = await res.json();
      setAiResult(data);

      // Extract JSON from response - handle both raw JSON and code blocks
      const text: string = data.text || '';
      console.log('AI Response:', text);

      // Try to find JSON in ```json blocks first
      const codeBlockMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
      let jsonText = '';

      if (codeBlockMatch) {
        jsonText = codeBlockMatch[1];
      } else {
        // Fallback to looking for raw JSON objects
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          jsonText = jsonMatch[0];
        }
      }

      if (jsonText) {
        try {
          console.log('Parsing JSON:', jsonText);
          const parsed = JSON.parse(jsonText);
          console.log('Parsed JSON:', parsed);

          if (parsed.average_price) setAveragePrice(Number(parsed.average_price));
          if (parsed.gross_margin_percent) setGrossMarginPercent(Number(parsed.gross_margin_percent));
          if (parsed.fixed_monthly_costs_total) setFixedMonthlyCosts(Number(parsed.fixed_monthly_costs_total));
          if (parsed.target_customers) setTargetCustomers(Number(parsed.target_customers));
          if (parsed.location) setLocation(String(parsed.location));
          if (parsed.business_idea) setBusinessIdea(String(parsed.business_idea));
          if (parsed.business_analysis) setBusinessAnalysis(String(parsed.business_analysis));

          console.log('Setting currency to:', detectedCurrency);
          setCurrency(detectedCurrency);
          setHasCompletedAnalysis(true);
        } catch (e) {
          console.error('Failed to parse JSON:', e, 'Raw text:', jsonText);
        }
      } else {
        console.log('No JSON found in response');
      }
    } catch (e) {
      setAiResult({ text: `AI error: ${(e as Error).message}` });
    } finally {
      setIsLoading(false);
    }
  };

  const showCalculations = (aiResult?.text && (businessIdea || location)) ||
    (averagePrice !== 20 || grossMarginPercent !== 60 || fixedMonthlyCosts !== 2000 || targetCustomers !== 200);

  return (
    <div className="space-y-8">
      <section className="text-center space-y-6 mb-12">
        <h1 className="text-5xl font-bold gradient-text mb-4">From idea to numbers in 60 seconds</h1>
        <p className="text-xl text-gray-700 max-w-3xl mx-auto">
          Get break-even, costs, customer volumes, and market sizing instantly with AI-powered calculations
        </p>
      </section>

      <section className="space-y-6">
        <div className="glass rounded-2xl p-8 shadow-xl max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
              <span className="text-white text-2xl font-bold">✨</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Describe Your Business Idea</h2>
            <p className="text-gray-600">Tell us about your business concept and location</p>
          </div>

          <textarea
            className="w-full rounded-xl border-2 border-gray-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 p-6 text-lg bg-white/50 backdrop-blur transition-all resize-none"
            rows={6}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Example: I want to start a coffee shop in downtown Budapest. I'm thinking of serving specialty coffee and pastries to office workers and students. The space would be about 50 square meters with seating for 20 people..."
          />

          {/* Value Proposition Panel */}
          <div className="mt-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">Here's what you'll get:</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-sm font-bold">✓</span>
                </div>
                <span className="font-medium text-gray-700">Monthly break-even</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-sm font-bold">✓</span>
                </div>
                <span className="font-medium text-gray-700">Customer volumes needed</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-sm font-bold">✓</span>
                </div>
                <span className="font-medium text-gray-700">Market size snapshot</span>
              </div>
            </div>
          </div>

          <div className="mt-6 text-center">
            <button
              onClick={onAiStart}
              disabled={isLoading || !prompt.trim()}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 mx-auto text-lg"
            >
              {isLoading && (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              )}
              {isLoading ? 'Analyzing Your Idea...' : 'Analyze My Business Idea ✨'}
            </button>

            {!isLoading && hasCompletedAnalysis && (
              <div className="flex items-center justify-center gap-2 text-green-600 mt-4">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="font-medium">Analysis complete! Check out your numbers below 👇</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {showCalculations && (
        <section className="grid gap-8 lg:grid-cols-2">
        <div className="glass rounded-2xl p-6 shadow-xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
              <span className="text-white font-bold">📊</span>
            </div>
            <h2 className="text-xl font-semibold text-gray-800">Business Parameters</h2>
          </div>
          <div className="space-y-4">
            <input
              className="w-full rounded-xl border-2 border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 p-3 text-sm bg-white/50 backdrop-blur transition-all"
              placeholder="Business idea"
              value={businessIdea}
              onChange={e=>setBusinessIdea(e.target.value)}
            />
            <input
              className="w-full rounded-xl border-2 border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 p-3 text-sm bg-white/50 backdrop-blur transition-all"
              placeholder="Location"
              value={location}
              onChange={e=>setLocation(e.target.value)}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">💰 Average Price</label>
                <input
                  type="number"
                  className="w-full rounded-xl border-2 border-gray-200 focus:border-green-400 focus:ring-2 focus:ring-green-100 p-3 text-sm bg-white/50 backdrop-blur transition-all"
                  value={averagePrice}
                  onChange={e=>setAveragePrice(Number(e.target.value))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">📈 Gross Margin %</label>
                <input
                  type="number"
                  className="w-full rounded-xl border-2 border-gray-200 focus:border-green-400 focus:ring-2 focus:ring-green-100 p-3 text-sm bg-white/50 backdrop-blur transition-all"
                  value={grossMarginPercent}
                  onChange={e=>setGrossMarginPercent(Number(e.target.value))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">🏢 Fixed Monthly Costs</label>
                <input
                  type="number"
                  className="w-full rounded-xl border-2 border-gray-200 focus:border-red-400 focus:ring-2 focus:ring-red-100 p-3 text-sm bg-white/50 backdrop-blur transition-all"
                  value={fixedMonthlyCosts}
                  onChange={e=>setFixedMonthlyCosts(Number(e.target.value))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">👥 Target Customers/Month</label>
                <input
                  type="number"
                  className="w-full rounded-xl border-2 border-gray-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 p-3 text-sm bg-white/50 backdrop-blur transition-all"
                  value={targetCustomers}
                  onChange={e=>setTargetCustomers(Number(e.target.value))}
                />
              </div>
            </div>
            <div className="w-32">
              <label className="block text-sm font-medium text-gray-700 mb-2">💱 Currency</label>
              <input
                className="w-full rounded-xl border-2 border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 p-3 text-sm bg-white/50 backdrop-blur transition-all font-mono"
                value={currency}
                onChange={e=>{
                  const value = e.target.value.toUpperCase();
                  if (value.length <= 3) setCurrency(value);
                }}
                placeholder="USD"
              />
            </div>
          </div>
        </div>

        <div className="glass rounded-2xl p-6 shadow-xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center">
              <span className="text-white font-bold">📊</span>
            </div>
            <h2 className="text-xl font-semibold text-gray-800">Financial Results</h2>
          </div>
          <div className="space-y-6">
            <ResultsTable
              revenue={revenue}
              grossProfit={grossProfit}
              netProfit={netProfit}
              breakEvenCustomers={breakEven}
              currency={currency}
            />
            <BreakEvenChart currentCustomers={targetCustomers} breakEvenCustomers={breakEven} />
          </div>
        </div>
      </section>
      )}

      {businessAnalysis && showCalculations && (
        <section className="mt-8">
          <div className="glass rounded-2xl p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center">
                <span className="text-white font-bold">🧠</span>
              </div>
              <h2 className="text-xl font-semibold text-gray-800">AI Business Analysis</h2>
            </div>
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-200">
              <p className="text-gray-800 leading-relaxed">{businessAnalysis}</p>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

