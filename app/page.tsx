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

  // Detailed cost breakdown
  const [rentMonthly, setRentMonthly] = useState(800);
  const [salariesMonthly, setSalariesMonthly] = useState(1000);
  const [utilitiesMonthly, setUtilitiesMonthly] = useState(150);
  const [otherFixedCosts, setOtherFixedCosts] = useState(50);
  const [variableCostPerUnit, setVariableCostPerUnit] = useState(20);

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

  // Keep fixedMonthlyCosts in sync with detailed breakdown
  useEffect(() => {
    const newTotal = rentMonthly + salariesMonthly + utilitiesMonthly + otherFixedCosts;
    if (newTotal !== fixedMonthlyCosts) {
      setFixedMonthlyCosts(newTotal);
    }
  }, [rentMonthly, salariesMonthly, utilitiesMonthly, otherFixedCosts]);

  const revenue = useMemo(
    () => calculateRevenue(averagePrice, targetCustomers),
    [averagePrice, targetCustomers]
  );

  const totalVariableCosts = useMemo(
    () => variableCostPerUnit * targetCustomers,
    [variableCostPerUnit, targetCustomers]
  );

  const totalFixedCosts = useMemo(
    () => rentMonthly + salariesMonthly + utilitiesMonthly + otherFixedCosts,
    [rentMonthly, salariesMonthly, utilitiesMonthly, otherFixedCosts]
  );

  const grossProfit = useMemo(
    () => revenue - totalVariableCosts,
    [revenue, totalVariableCosts]
  );

  const netProfit = useMemo(
    () => grossProfit - totalFixedCosts,
    [grossProfit, totalFixedCosts]
  );

  const breakEven = useMemo(
    () => calculateBreakEvenCustomers(totalFixedCosts, averagePrice, grossMarginPercent),
    [totalFixedCosts, averagePrice, grossMarginPercent]
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

          // Detailed cost breakdown
          if (parsed.rent_monthly) setRentMonthly(Number(parsed.rent_monthly));
          if (parsed.salaries_monthly) setSalariesMonthly(Number(parsed.salaries_monthly));
          if (parsed.utilities_monthly) setUtilitiesMonthly(Number(parsed.utilities_monthly));
          if (parsed.other_fixed_costs_monthly) setOtherFixedCosts(Number(parsed.other_fixed_costs_monthly));
          if (parsed.variable_cost_per_unit) setVariableCostPerUnit(Number(parsed.variable_cost_per_unit));

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
    (averagePrice !== 20 || grossMarginPercent !== 60 || fixedMonthlyCosts !== 2000 || targetCustomers !== 200 ||
     rentMonthly !== 800 || salariesMonthly !== 1000 || utilitiesMonthly !== 150 || otherFixedCosts !== 50 || variableCostPerUnit !== 20);

  return (
    <div className="space-y-8">
      <section className="text-center space-y-6 mb-12">
        <h1 className="text-5xl md:text-6xl font-black gradient-text mb-4 tracking-tight">From idea to numbers in 60 seconds</h1>
        <p className="text-xl md:text-2xl text-gray-700 max-w-3xl mx-auto font-medium leading-relaxed">
          Get break-even, costs, customer volumes, and market sizing instantly with AI-powered calculations
        </p>
      </section>

      <section className="space-y-6">
        <div className="glass rounded-2xl p-8 shadow-xl max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg border-4 border-white">
              <span className="text-white text-3xl font-bold">📊</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Describe Your Business Idea</h2>
            <p className="text-gray-600">Tell us about your business concept and location</p>
          </div>

          <textarea
            className="w-full rounded-xl border-2 border-gray-200 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 p-6 text-lg bg-white/80 backdrop-blur transition-all resize-none shadow-sm hover:shadow-md font-medium placeholder-gray-500"
            rows={6}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Example: I want to start a coffee shop in downtown Budapest. I'm thinking of serving specialty coffee and pastries to office workers and students. The space would be about 50 square meters with seating for 20 people..."
          />

          {/* Value Proposition Panel */}
          <div className="mt-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-8 border border-green-200 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-6 text-center">Here's what you'll get:</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
                  <span className="text-white text-sm font-bold">✓</span>
                </div>
                <span className="font-semibold text-gray-800">Monthly break-even</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
                  <span className="text-white text-sm font-bold">✓</span>
                </div>
                <span className="font-semibold text-gray-800">Customer volumes needed</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
                  <span className="text-white text-sm font-bold">✓</span>
                </div>
                <span className="font-semibold text-gray-800">Market size snapshot</span>
              </div>
            </div>

            {/* Sample Output Preview */}
            <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
              <div className="text-xs font-medium text-gray-500 mb-3 text-center">Sample Output Preview:</div>
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">💰 Monthly Revenue</span>
                  <span className="font-bold text-blue-600">$8,000</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">📈 Gross Profit</span>
                  <span className="font-bold text-emerald-600">$4,800</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">✅ Net Profit</span>
                  <span className="font-bold text-green-600 bg-green-50 px-2 py-1 rounded">$2,800</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">🎯 Break-even</span>
                  <span className="font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded">84 customers</span>
                </div>
              </div>
              <div className="mt-3 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-emerald-400 to-green-500 rounded-full" style={{width: '75%'}}></div>
              </div>
              <div className="text-xs text-center text-gray-500 mt-1">Profitable! 25 customers above break-even</div>
            </div>
          </div>

          <div className="mt-6 text-center">
            <button
              onClick={onAiStart}
              disabled={isLoading || !prompt.trim()}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 mx-auto text-lg border-2 border-transparent hover:border-indigo-300"
            >
              {isLoading && (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              )}
              {isLoading ? 'Crunching Your Numbers...' : (
                <>
                  <span>Show Me My Numbers</span>
                  <span className="text-xl">📊</span>
                </>
              )}
            </button>

            <div className="mt-4 text-center text-sm text-gray-600">
              Takes &lt;30 seconds • No signup required
            </div>

            {!isLoading && hasCompletedAnalysis && (
              <div className="flex items-center justify-center gap-2 text-green-600 mt-4">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="font-medium">Numbers ready! Check out your break-even below 👇</span>
              </div>
            )}
          </div>
        </div>

        {/* Trust Booster */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            Trusted by founders, students, and business advisors worldwide
          </p>
        </div>
      </section>

      {showCalculations && (
        <section className="grid gap-8 lg:grid-cols-2">
        <div className="glass rounded-2xl p-6 shadow-xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
              <span className="text-white font-bold">📊</span>
            </div>
            <h2 className="text-xl font-semibold text-gray-800">Your Business Inputs</h2>
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
            <div className="space-y-6">
              {/* Revenue Section */}
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <span className="text-blue-600">💰</span>
                  Revenue
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Average Price</label>
                    <input
                      type="number"
                      className="w-full rounded-xl border-2 border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 p-3 text-sm bg-white/80 backdrop-blur transition-all"
                      value={averagePrice}
                      onChange={e=>setAveragePrice(Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Target Customers/Month</label>
                    <input
                      type="number"
                      className="w-full rounded-xl border-2 border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 p-3 text-sm bg-white/80 backdrop-blur transition-all"
                      value={targetCustomers}
                      onChange={e=>setTargetCustomers(Number(e.target.value))}
                    />
                  </div>
                </div>
              </div>

              {/* Fixed Costs Section */}
              <div className="bg-red-50 rounded-xl p-4 border border-red-200">
                <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <span className="text-red-600">🏢</span>
                  Fixed Monthly Costs
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Rent</label>
                    <input
                      type="number"
                      className="w-full rounded-xl border-2 border-gray-200 focus:border-red-400 focus:ring-2 focus:ring-red-100 p-3 text-sm bg-white/80 backdrop-blur transition-all"
                      value={rentMonthly}
                      onChange={e=>setRentMonthly(Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Salaries</label>
                    <input
                      type="number"
                      className="w-full rounded-xl border-2 border-gray-200 focus:border-red-400 focus:ring-2 focus:ring-red-100 p-3 text-sm bg-white/80 backdrop-blur transition-all"
                      value={salariesMonthly}
                      onChange={e=>setSalariesMonthly(Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Utilities</label>
                    <input
                      type="number"
                      className="w-full rounded-xl border-2 border-gray-200 focus:border-red-400 focus:ring-2 focus:ring-red-100 p-3 text-sm bg-white/80 backdrop-blur transition-all"
                      value={utilitiesMonthly}
                      onChange={e=>setUtilitiesMonthly(Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Other Fixed Costs</label>
                    <input
                      type="number"
                      className="w-full rounded-xl border-2 border-gray-200 focus:border-red-400 focus:ring-2 focus:ring-red-100 p-3 text-sm bg-white/80 backdrop-blur transition-all"
                      value={otherFixedCosts}
                      onChange={e=>setOtherFixedCosts(Number(e.target.value))}
                    />
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-red-200">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-700">Total Fixed Costs:</span>
                    <span className="font-bold text-red-700">{new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(rentMonthly + salariesMonthly + utilitiesMonthly + otherFixedCosts)}</span>
                  </div>
                </div>
              </div>

              {/* Variable Costs Section */}
              <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
                <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <span className="text-orange-600">📦</span>
                  Variable Costs
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Cost Per Unit/Service</label>
                    <input
                      type="number"
                      className="w-full rounded-xl border-2 border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 p-3 text-sm bg-white/80 backdrop-blur transition-all"
                      value={variableCostPerUnit}
                      onChange={e=>setVariableCostPerUnit(Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Gross Margin %</label>
                    <input
                      type="number"
                      className="w-full rounded-xl border-2 border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 p-3 text-sm bg-white/80 backdrop-blur transition-all"
                      value={grossMarginPercent}
                      onChange={e=>setGrossMarginPercent(Number(e.target.value))}
                    />
                  </div>
                </div>
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
            <h2 className="text-xl font-semibold text-gray-800">Your Break-Even Numbers</h2>
          </div>
          <div className="space-y-6">
            <ResultsTable
              revenue={revenue}
              grossProfit={grossProfit}
              netProfit={netProfit}
              breakEvenCustomers={breakEven}
              currency={currency}
              rentMonthly={rentMonthly}
              salariesMonthly={salariesMonthly}
              utilitiesMonthly={utilitiesMonthly}
              otherFixedCosts={otherFixedCosts}
              variableCostPerUnit={variableCostPerUnit}
              targetCustomers={targetCustomers}
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

