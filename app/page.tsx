"use client";

import { useEffect, useState } from "react";
import QuickMath from "@/components/QuickMath";
import ViabilityScore from "@/components/ViabilityScore";
import { SliderField, SelectField, NumberField } from "@/components/InputField";
import type { Parameters } from "@/types/parameters";
import { calculateViabilityScore } from "@/lib/viability";
import ScenarioCard from "@/components/ScenarioCard";

// Extended parameter type is imported from types/parameters

export default function Page() {
  const [idea, setIdea] = useState("");
  const [detectedCurrency, setDetectedCurrency] = useState("");
  
  useEffect(() => {
    // Enhanced currency detection: Geolocation first, then locale fallback
    const detectCurrency = async () => {
      // Country code to currency mapping
      const countryToCurrency: Record<string, string> = {
        'US': '$', 'GB': '£', 'DE': '€', 'FR': '€', 'ES': '€', 'IT': '€', 'PT': '€', 'NL': '€', 
        'BE': '€', 'AT': '€', 'IE': '€', 'FI': '€', 'EE': '€', 'LV': '€', 'LT': '€', 'SK': '€', 
        'SI': '€', 'CY': '€', 'MT': '€', 'LU': '€', 'HU': 'Ft', 'PL': 'zł', 'CZ': 'Kč', 
        'DK': 'kr', 'SE': 'kr', 'NO': 'kr', 'CH': 'CHF', 'JP': '¥', 'CN': '¥', 'CA': 'C$', 
        'AU': 'A$', 'NZ': 'NZ$', 'IN': '₹', 'BR': 'R$', 'KR': '₩', 'MX': '$', 'AR': '$', 
        'CL': '$', 'PE': 'S/', 'CO': '$', 'TR': '₺', 'RU': '₽', 'UA': '₴', 'IL': '₪', 
        'SA': 'ر.س', 'AE': 'د.إ', 'EG': 'ج.م', 'ZA': 'R', 'NG': '₦', 'KE': 'KSh', 'TH': '฿', 
        'VN': '₫', 'MY': 'RM', 'SG': '$', 'ID': 'Rp', 'PH': '₱', 'TW': 'NT$', 'HK': 'HK$'
      };

      // Try geolocation first
      try {
        if (navigator.geolocation) {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              timeout: 5000,
              enableHighAccuracy: false,
              maximumAge: 300000 // 5 minutes
            });
          });

          // Use reverse geocoding to get country from coordinates
          try {
            const response = await fetch(
              `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${position.coords.latitude}&longitude=${position.coords.longitude}&localityLanguage=en`
            );
            
            if (response.ok) {
              const data = await response.json();
              const countryCode = data.countryCode;
              
              if (countryCode && countryToCurrency[countryCode]) {
                console.log(`Currency detected from geolocation: ${countryCode} -> ${countryToCurrency[countryCode]}`);
                setDetectedCurrency(countryToCurrency[countryCode]);
                return;
              }
            }
          } catch (geoError) {
            console.warn('Reverse geocoding failed:', geoError);
          }
        }
      } catch (locationError) {
        console.warn('Geolocation failed:', locationError);
      }

      // Fallback to locale detection
      try {
        const locale = navigator.language || 'en-US';
        console.log(`Fallback to locale detection: ${locale}`);
        
        // Enhanced locale to currency mapping
        const localeToCurrency: Record<string, string> = {
          'en-US': '$', 'en-GB': '£', 'en-CA': 'C$', 'en-AU': 'A$', 'en-NZ': 'NZ$', 'en-ZA': 'R',
          'de': '€', 'de-DE': '€', 'de-AT': '€', 'de-CH': 'CHF',
          'fr': '€', 'fr-FR': '€', 'fr-CA': 'C$', 'fr-CH': 'CHF',
          'es': '€', 'es-ES': '€', 'es-MX': '$', 'es-AR': '$',
          'it': '€', 'it-IT': '€', 'it-CH': 'CHF',
          'pt': '€', 'pt-PT': '€', 'pt-BR': 'R$',
          'nl': '€', 'nl-NL': '€', 'be': '€', 'at': '€', 'ie': '€',
          'fi': '€', 'fi-FI': '€', 'ee': '€', 'lv': '€', 'lt': '€',
          'sk': '€', 'si': '€', 'cy': '€', 'mt': '€', 'lu': '€',
          'hu': 'Ft', 'hu-HU': 'Ft', 'pl': 'zł', 'pl-PL': 'zł',
          'cs': 'Kč', 'cs-CZ': 'Kč', 'da': 'kr', 'da-DK': 'kr',
          'sv': 'kr', 'sv-SE': 'kr', 'nb': 'kr', 'nn': 'kr', 'no': 'kr',
          'ja': '¥', 'ja-JP': '¥', 'zh': '¥', 'zh-CN': '¥', 'zh-TW': 'NT$',
          'ko': '₩', 'ko-KR': '₩', 'hi': '₹', 'hi-IN': '₹',
          'th': '฿', 'th-TH': '฿', 'vi': '₫', 'vi-VN': '₫',
          'ms': 'RM', 'ms-MY': 'RM', 'id': 'Rp', 'id-ID': 'Rp',
          'tl': '₱', 'fil': '₱', 'tr': '₺', 'tr-TR': '₺',
          'ru': '₽', 'ru-RU': '₽', 'uk': '₴', 'uk-UA': '₴',
          'he': '₪', 'he-IL': '₪', 'ar': 'ر.س', 'ar-SA': 'ر.س',
          'ar-AE': 'د.إ', 'ar-EG': 'ج.م'
        };
        
        // Try exact locale match first, then language code
        let currency = localeToCurrency[locale.toLowerCase()];
        if (!currency) {
          const langCode = locale.split('-')[0].toLowerCase();
          currency = localeToCurrency[langCode];
        }
        
        // If still no match, try country code from locale
        if (!currency) {
          const countryCode = locale.split('-')[1]?.toUpperCase();
          if (countryCode && countryToCurrency[countryCode]) {
            currency = countryToCurrency[countryCode];
          }
        }
        
        console.log(`Currency detected from locale: ${locale} -> ${currency || '$'}`);
        setDetectedCurrency(currency || '$');
      } catch (error) {
        console.warn('Locale detection failed:', error);
        setDetectedCurrency('$');
      }
    };

    detectCurrency();
  }, []);

  const [status, setStatus] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [params, setParams] = useState<Parameters | null>(null);
  const [showScore, setShowScore] = useState(false);

  const [scenarios, setScenarios] = useState<Parameters[]>([]);

  async function research() {
    setStatus("Researching…");
    setLoading(true);
    try {
      const res = await fetch("/api/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea, currency: detectedCurrency }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data: Parameters = await res.json();
      setParams(data);
      setStatus("Parameters ready — tweak if needed, then calculate viability!");
      setShowScore(false);
    } catch (e: any) {
      setStatus(`Error: ${e?.message || "request failed"}`);
    } finally {
      setLoading(false);
    }
  }

  function calculateScore() {
    if (!params) return;
    setShowScore(true);
    setStatus("Viability score calculated!");
  }

  // Currency-specific min/max values
  const getCurrencyRanges = () => {
    const ranges: Record<string, { avgPrice: [number, number], fixedCosts: [number, number], cac: [number, number] }> = {
      '$': { avgPrice: [5, 2000], fixedCosts: [500, 50000], cac: [10, 500] },
      'C$': { avgPrice: [5, 2500], fixedCosts: [600, 60000], cac: [12, 600] },
      'A$': { avgPrice: [7, 2800], fixedCosts: [700, 65000], cac: [15, 650] },
      'NZ$': { avgPrice: [8, 3000], fixedCosts: [800, 70000], cac: [18, 700] },
      '£': { avgPrice: [4, 1600], fixedCosts: [400, 40000], cac: [8, 400] },
      '€': { avgPrice: [4, 1800], fixedCosts: [450, 45000], cac: [9, 450] },
      'CHF': { avgPrice: [5, 2200], fixedCosts: [600, 55000], cac: [12, 550] },
      '¥': { avgPrice: [500, 200000], fixedCosts: [50000, 5000000], cac: [1000, 50000] },
      'NT$': { avgPrice: [150, 60000], fixedCosts: [15000, 1500000], cac: [300, 15000] },
      'HK$': { avgPrice: [40, 15000], fixedCosts: [4000, 400000], cac: [80, 4000] },
      '₹': { avgPrice: [300, 150000], fixedCosts: [30000, 3000000], cac: [500, 30000] },
      '₩': { avgPrice: [6000, 2500000], fixedCosts: [600000, 60000000], cac: [12000, 600000] },
      'R$': { avgPrice: [20, 10000], fixedCosts: [2000, 200000], cac: [40, 2000] },
      'R': { avgPrice: [70, 35000], fixedCosts: [7000, 700000], cac: [140, 7000] },
      '₦': { avgPrice: [2000, 800000], fixedCosts: [200000, 20000000], cac: [4000, 200000] },
      'Rp': { avgPrice: [75000, 30000000], fixedCosts: [7500000, 750000000], cac: [150000, 7500000] },
      '₱': { avgPrice: [250, 100000], fixedCosts: [25000, 2500000], cac: [500, 25000] },
      '฿': { avgPrice: [150, 70000], fixedCosts: [15000, 1500000], cac: [300, 15000] },
      '₫': { avgPrice: [115000, 45000000], fixedCosts: [11500000, 1150000000], cac: [230000, 11500000] },
      'RM': { avgPrice: [20, 8500], fixedCosts: [2000, 200000], cac: [40, 2000] },
      '₺': { avgPrice: [80, 35000], fixedCosts: [8000, 800000], cac: [160, 8000] },
      '₽': { avgPrice: [300, 150000], fixedCosts: [30000, 3000000], cac: [600, 30000] },
      'Ft': { avgPrice: [1500, 700000], fixedCosts: [150000, 15000000], cac: [3000, 150000] },
      'zł': { avgPrice: [18, 8000], fixedCosts: [1800, 180000], cac: [36, 1800] },
      'Kč': { avgPrice: [110, 50000], fixedCosts: [11000, 1100000], cac: [220, 11000] },
      'kr': { avgPrice: [45, 20000], fixedCosts: [4500, 450000], cac: [90, 4500] },
      '₪': { avgPrice: [17, 7500], fixedCosts: [1700, 170000], cac: [34, 1700] },
      'ر.س': { avgPrice: [19, 7500], fixedCosts: [1900, 190000], cac: [38, 1900] },
      'د.إ': { avgPrice: [18, 7300], fixedCosts: [1800, 180000], cac: [36, 1800] }
    };
    return ranges[detectedCurrency] || ranges['$'];
  };

  return (
    <>
      <header className="mb-12">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 flex items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-2xl ring-4 ring-white/20 backdrop-blur-sm float-animation">
            <span className="text-2xl">🚀</span>
          </div>
          <div>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
              Napkin Planner <span className="inline-block animate-bounce">✨</span>
            </h1>
            <p className="text-slate-700 mt-2 text-lg font-medium">1. Prompt → 2. Tweak → 3. Calculate viability SCORE</p>
          </div>
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <span className="status-badge status-alpha">Alpha</span>
          <span className="status-badge status-llm">AI‑Powered</span>
          <span className="status-badge status-nofuss">No‑fuss</span>
        </div>
      </header>

      <section className="card p-8">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="idea">
              Your idea
            </label>
            <textarea
              id="idea"
              required
              rows={3}
              className="input"
              placeholder="e.g. Renting coffee machines to offices with premium beans subscription and trainings"
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              onKeyDown={(e) => {
                if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                  e.preventDefault();
                  if (!loading && idea.trim()) {
                    research();
                  }
                }
              }}
            />
          </div>
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={research}
              disabled={loading || !idea.trim()}
              className={`btn-primary ${loading ? 'loading-shimmer' : ''}`}
            >
              <span>{loading ? 'Researching...' : 'Research Parameters'}</span>
{loading ? <span className="animate-pulse">🔍</span> : <span>🚀</span>}
            </button>
            {status && (
              <div className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 border border-purple-100 text-sm text-purple-700 font-medium backdrop-blur-sm">
                {status}
              </div>
            )}
          </div>
        </div>
      </section>

      {params && (
        <section className="mt-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
              <span className="text-white text-sm font-bold">📊</span>
            </div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">Parameters</h2>
          </div>
          <div className="card p-8">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Business idea</label>
                <input
                  className="input"
                  value={params.business_idea}
                  onChange={(e) => setParams({ ...params, business_idea: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Location</label>
                  <input
                    className="input"
                    value={params.location}
                    onChange={(e) => setParams({ ...params, location: e.target.value })}
                  />
                </div>
                <SliderField
                  label="Average Price"
                  value={params.average_price}
                  onChange={(value) => setParams({ ...params, average_price: value })}
                  min={getCurrencyRanges().avgPrice[0]}
                  max={getCurrencyRanges().avgPrice[1]}
                  step={getCurrencyRanges().avgPrice[1] > 10000 ? 100 : 1}
                  formatter={(value) => `${detectedCurrency} ${value >= 1000 ? (value/1000).toFixed(1) + 'K' : value}`}
                />
                <SliderField
                  label="Gross Margin"
                  value={params.gross_margin_percent.replace('%', '')}
                  onChange={(value) => setParams({ ...params, gross_margin_percent: `${value}%` })}
                  min={0}
                  max={100}
                  step={5}
                  unit="%"
                />
                <SliderField
                  label="Fixed Monthly Costs"
                  value={params.fixed_monthly_costs_total}
                  onChange={(value) => setParams({ ...params, fixed_monthly_costs_total: value })}
                  min={getCurrencyRanges().fixedCosts[0]}
                  max={getCurrencyRanges().fixedCosts[1]}
                  step={getCurrencyRanges().fixedCosts[1] > 100000 ? 1000 : 100}
                  formatter={(value) => `${detectedCurrency} ${value >= 1000 ? (value/1000).toFixed(1) + 'K' : value}`}
                />
                <SliderField
                  label="Target Customers"
                  value={params.target_customers || "100"}
                  onChange={(value) => setParams({ ...params, target_customers: value })}
                  min={10}
                  max={10000}
                  step={10}
                  formatter={(value) => value >= 1000 ? `${(value/1000).toFixed(1)}K` : value.toString()}
                />
                <SliderField
                  label="Customer Acquisition Cost (CAC)"
                  value={params.cac || "50"}
                  onChange={(value) => setParams({ ...params, cac: value })}
                  min={getCurrencyRanges().cac[0]}
                  max={getCurrencyRanges().cac[1]}
                  step={getCurrencyRanges().cac[1] > 1000 ? 50 : 5}
                  formatter={(value) => `${detectedCurrency} ${value >= 1000 ? (value/1000).toFixed(1) + 'K' : value}`}
                />
                <SliderField
                  label="Monthly Churn Rate"
                  value={params.churn_rate?.replace('%', '') || "5"}
                  onChange={(value) => setParams({ ...params, churn_rate: `${value}%` })}
                  min={0}
                  max={50}
                  step={1}
                  unit="%"
                />
                <SliderField
                  label="Sales Cycle"
                  value={params.sales_cycle_days || "30"}
                  onChange={(value) => setParams({ ...params, sales_cycle_days: value })}
                  min={1}
                  max={365}
                  step={1}
                  formatter={(value) => `${value} days`}
                />
                <SelectField
                  label="Billing Model"
                  value={params.billing_model || ""}
                  onChange={(value) => setParams({ ...params, billing_model: value })}
                  options={[
                    { value: 'monthly', label: 'Monthly Subscription' },
                    { value: 'annual', label: 'Annual Subscription' },
                    { value: 'one-time', label: 'One-time Payment' },
                    { value: 'usage-based', label: 'Usage-based' },
                    { value: 'freemium', label: 'Freemium' },
                    { value: 'per-seat', label: 'Per Seat/User' }
                  ]}
                  allowCustom={true}
                />
                <NumberField
                  label="Setup Fee"
                  value={params.setup_fee || ""}
                  onChange={(value) => setParams({ ...params, setup_fee: value })}
                  prefix={detectedCurrency}
                  placeholder="0"
                />
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">Discounts</label>
                  <input className="input" value={params.discounts || ""} onChange={(e) => setParams({ ...params, discounts: e.target.value })} placeholder="10% annual discount" />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">Tax Rate</label>
                  <input className="input" value={params.taxes || ""} onChange={(e) => setParams({ ...params, taxes: e.target.value })} placeholder="8% sales tax" />
                </div>
                <div className="sm:col-span-2 lg:col-span-3">
                  <label className="block text-sm font-medium mb-1">Fixed costs breakdown</label>
                  <input
                    className="input"
                    value={params.fixed_monthly_costs_breakdown}
                    onChange={(e) => setParams({ ...params, fixed_monthly_costs_breakdown: e.target.value })}
                  />
                </div>
                <div className="sm:col-span-2 lg:col-span-3">
                  <label className="block text-sm font-medium mb-1">Variable cost assumptions</label>
                  <input
                    className="input"
                    value={params.variable_cost_assumptions}
                    onChange={(e) => setParams({ ...params, variable_cost_assumptions: e.target.value })}
                  />
                </div>
                <div className="sm:col-span-2 lg:col-span-3 space-y-2">
                  <label className="block text-sm font-medium text-slate-700">Headcount Plan</label>
                  <input className="input" value={params.headcount_plan || ""} onChange={(e) => setParams({ ...params, headcount_plan: e.target.value })} placeholder="Start with 3 people, hire 1 per month" />
                </div>
                <div className="sm:col-span-2 lg:col-span-3 space-y-2">
                  <label className="block text-sm font-medium text-slate-700">Tools & Licenses</label>
                  <input className="input" value={params.tools_licenses || ""} onChange={(e) => setParams({ ...params, tools_licenses: e.target.value })} placeholder="Stripe $50/mo, AWS $200/mo, Slack $100/mo" />
                </div>
              </div>

              <div className="mt-6 bg-gradient-to-r from-amber-50/80 to-orange-50/80 border-2 border-amber-200/60 rounded-2xl p-6 text-sm backdrop-blur-sm">
                <div className="font-bold text-amber-800 mb-3 flex items-center gap-2">
                  <span className="text-lg">🔢</span>
                  Quick Math (auto)
                </div>
                <QuickMath
                  averagePrice={params.average_price}
                  grossMarginPercent={params.gross_margin_percent}
                  fixedMonthlyCostsTotal={params.fixed_monthly_costs_total}
                  cac={params.cac}
                  churnRate={params.churn_rate}
                  targetCustomers={params.target_customers}
                />
              </div>

              <details className="text-sm text-slate-600">
                <summary className="cursor-pointer">Notes & sources</summary>
                <div className="mt-2 space-y-2">
                  <div className="whitespace-pre-wrap">{params.notes || ""}</div>
                  <ul className="list-disc list-inside">
                    {(params.sources || []).map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>
              </details>

              <div className="pt-4">
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    className="btn-primary"
                    onClick={calculateScore}
                  >
                    <span>🎯</span>
                    <span>Calculate Viability Score</span>
                  </button>
                  <button
                    className="btn-secondary"
                    onClick={() => setScenarios((s) => [...s, params])}
                  >
                    Duplicate Scenario
                  </button>
                </div>
              </div>

            </div>
          </div>

          {showScore && (
            <div className="mt-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center float-animation">
                  <span className="text-white text-sm font-bold">🎯</span>
                </div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">Viability Score</h2>
              </div>
              <div className="card p-8">
                <ViabilityScore score={calculateViabilityScore(params)} />
              </div>
            </div>
          )}

          {scenarios.length > 0 && (
            <div className="mt-12 space-y-8">
              {scenarios.map((p, idx) => (
                <ScenarioCard key={idx} initial={p} onRemove={() => setScenarios((s) => s.filter((_, i) => i !== idx))} />
              ))}
            </div>
          )}
        </section>
      )}
    </>
  );
}