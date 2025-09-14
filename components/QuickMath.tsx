"use client";

export function extractFirstNumber(str?: string) {
  if (!str) return NaN;
  const m = str.replace(/\s+/g, "").match(/-?[0-9]+(?:[.,][0-9]+)?/);
  if (!m) return NaN;
  return Number(m[0].replace(",", "."));
}

export function detectCurrencySymbol(str?: string) {
  if (!str) return "";
  const symbols = ["€", "$", "£", "¥", "Ft", "HUF", "PLN", "zł", "CHF", "C$", "A$"];
  for (const s of symbols) {
    if (str.includes(s)) return s;
  }
  const code = str.match(/\b([A-Z]{3})\b/);
  return code ? code[1] : "";
}

export function parsePercent(str?: string) {
  if (!str) return NaN;
  const n = extractFirstNumber(str);
  if (isNaN(n)) return NaN;
  return str.includes("%") || n > 1 ? n / 100 : n;
}

export function formatCurrency(n: number, symbol?: string) {
  if (!isFinite(n)) return "–";
  const s = symbol || "";
  return `${s}${new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(n)}`;
}

export function computeQuickMath(avgPriceStr?: string, marginStr?: string, fixedStr?: string) {
  const price = extractFirstNumber(avgPriceStr);
  const margin = parsePercent(marginStr);
  const fixed = extractFirstNumber(fixedStr);
  const symbol = detectCurrencySymbol(avgPriceStr) || detectCurrencySymbol(fixedStr) || "";
  const unitRevenue = isFinite(price) && isFinite(margin) ? price * margin : NaN;
  const be = isFinite(unitRevenue) && unitRevenue > 0 && isFinite(fixed) ? Math.ceil(fixed / unitRevenue) : NaN;
  return { price, margin, fixed, unitRevenue, be, symbol };
}

export function computeAdvancedMetrics({
  averagePrice,
  grossMarginPercent,
  fixedMonthlyCostsTotal,
  cac,
  churnRate,
  targetCustomers,
}: {
  averagePrice?: string;
  grossMarginPercent?: string;
  fixedMonthlyCostsTotal?: string;
  cac?: string;
  churnRate?: string; // monthly
  targetCustomers?: string;
}) {
  const { price, margin, fixed, unitRevenue, be, symbol } = computeQuickMath(
    averagePrice,
    grossMarginPercent,
    fixedMonthlyCostsTotal
  );
  const parsedCAC = extractFirstNumber(cac);
  const churn = parsePercent(churnRate); // monthly fraction
  const ltvMonths = isFinite(churn) && churn > 0 ? 1 / churn : NaN;
  const ltvGross = isFinite(unitRevenue) && isFinite(ltvMonths) ? unitRevenue * ltvMonths : NaN;
  const paybackMonths = isFinite(parsedCAC) && isFinite(unitRevenue) && unitRevenue > 0 ? parsedCAC / unitRevenue : NaN;
  const ltvToCac = isFinite(ltvGross) && isFinite(parsedCAC) && parsedCAC > 0 ? ltvGross / parsedCAC : NaN;
  const target = extractFirstNumber(targetCustomers);
  const mrrAtTarget = isFinite(price) && isFinite(target) ? price * target : NaN;
  const grossAtTarget = isFinite(unitRevenue) && isFinite(target) ? unitRevenue * target : NaN;

  return {
    symbol,
    be,
    unitRevenue,
    parsedCAC,
    paybackMonths,
    ltvMonths,
    ltvGross,
    ltvToCac,
    mrrAtTarget,
    grossAtTarget,
  };
}

export default function QuickMath({
  averagePrice,
  grossMarginPercent,
  fixedMonthlyCostsTotal,
  cac,
  churnRate,
  targetCustomers,
}: {
  averagePrice?: string;
  grossMarginPercent?: string;
  fixedMonthlyCostsTotal?: string;
  cac?: string;
  churnRate?: string;
  targetCustomers?: string;
}) {
  const { unitRevenue, fixed, be, symbol } = computeQuickMath(averagePrice, grossMarginPercent, fixedMonthlyCostsTotal);
  const adv = computeAdvancedMetrics({
    averagePrice,
    grossMarginPercent,
    fixedMonthlyCostsTotal,
    cac,
    churnRate,
    targetCustomers,
  });
  return (
    <div className="space-y-4">
      {/* Core Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-4 rounded-xl border border-purple-100">
          <div className="text-xs font-semibold text-purple-600 uppercase tracking-wide mb-1">Unit Revenue</div>
          <div className="text-lg font-bold text-purple-800">{isFinite(unitRevenue) ? `${formatCurrency(unitRevenue, symbol)}` : "–"}</div>
          <div className="text-xs text-purple-600">per customer/month</div>
        </div>
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-4 rounded-xl border border-emerald-100">
          <div className="text-xs font-semibold text-emerald-600 uppercase tracking-wide mb-1">Break-even</div>
          <div className="text-lg font-bold text-emerald-800">{isFinite(be) ? `${be}` : "–"}</div>
          <div className="text-xs text-emerald-600">customers needed</div>
        </div>
      </div>
      
      {/* Advanced Metrics */}
      {(isFinite(adv.paybackMonths) || isFinite(adv.ltvGross) || isFinite(adv.ltvToCac)) && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-gradient-to-r from-cyan-50 to-blue-50 p-3 rounded-lg border border-cyan-100">
            <div className="text-xs font-semibold text-cyan-600 uppercase tracking-wide mb-1">CAC Payback</div>
            <div className="text-sm font-bold text-cyan-800">{isFinite(adv.paybackMonths) ? `${adv.paybackMonths.toFixed(1)}mo` : "–"}</div>
          </div>
          <div className="bg-gradient-to-r from-orange-50 to-red-50 p-3 rounded-lg border border-orange-100">
            <div className="text-xs font-semibold text-orange-600 uppercase tracking-wide mb-1">LTV/CAC</div>
            <div className="text-sm font-bold text-orange-800">{isFinite(adv.ltvToCac) ? `${adv.ltvToCac.toFixed(1)}×` : "–"}</div>
          </div>
          <div className="bg-gradient-to-r from-pink-50 to-purple-50 p-3 rounded-lg border border-pink-100">
            <div className="text-xs font-semibold text-pink-600 uppercase tracking-wide mb-1">LTV Gross</div>
            <div className="text-sm font-bold text-pink-800">{isFinite(adv.ltvGross) ? `${formatCurrency(adv.ltvGross, symbol)}` : "–"}</div>
          </div>
        </div>
      )}
      
      {/* Target Metrics */}
      {(isFinite(adv.mrrAtTarget) || isFinite(adv.grossAtTarget)) && (
        <div className="bg-gradient-to-r from-slate-50 to-gray-50 p-4 rounded-xl border border-slate-200">
          <div className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-3">At Target Scale</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-slate-600">Monthly Recurring Revenue</div>
              <div className="text-lg font-bold text-slate-800">{isFinite(adv.mrrAtTarget) ? formatCurrency(adv.mrrAtTarget, symbol) : "–"}</div>
            </div>
            <div>
              <div className="text-sm text-slate-600">Gross Revenue</div>
              <div className="text-lg font-bold text-slate-800">{isFinite(adv.grossAtTarget) ? formatCurrency(adv.grossAtTarget, symbol) : "–"}</div>
            </div>
          </div>
        </div>
      )}
      
      {/* Formula Note */}
      <div className="text-xs text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-200">
        💡 Break-even = Fixed Costs ÷ (Price × Margin) | LTV assumes monthly churn
      </div>
    </div>
  );
}
