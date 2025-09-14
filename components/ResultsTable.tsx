type Props = {
  revenue: number;
  grossProfit: number;
  netProfit: number;
  breakEvenCustomers: number;
  currency: string;
  rentMonthly: number;
  salariesMonthly: number;
  utilitiesMonthly: number;
  otherFixedCosts: number;
  variableCostPerUnit: number;
  targetCustomers: number;
};

function fmt(n: number, currency: string) {
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(
      isFinite(n) ? n : 0
    );
  } catch {
    // Fallback to USD if invalid currency
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(
      isFinite(n) ? n : 0
    );
  }
}

export default function ResultsTable({
  revenue,
  grossProfit,
  netProfit,
  breakEvenCustomers,
  currency,
  rentMonthly,
  salariesMonthly,
  utilitiesMonthly,
  otherFixedCosts,
  variableCostPerUnit,
  targetCustomers,
}: Props) {
  const getNetProfitColor = (profit: number) => {
    if (profit > 0) return 'text-green-600 bg-green-50';
    if (profit < 0) return 'text-red-600 bg-red-50';
    return 'text-gray-600 bg-gray-50';
  };

  const totalFixedCosts = rentMonthly + salariesMonthly + utilitiesMonthly + otherFixedCosts;
  const totalVariableCosts = variableCostPerUnit * targetCustomers;

  return (
    <div className="space-y-4">
      {/* Revenue & Profit Summary */}
      <div className="overflow-hidden rounded-xl bg-white/50 backdrop-blur border-2 border-gray-100 shadow-lg">
        <div className="bg-blue-50/50 px-4 py-2 border-b border-gray-100">
          <h3 className="font-semibold text-gray-700 flex items-center gap-2">
            <span className="text-blue-500">📊</span>
            Financial Summary
          </h3>
        </div>
        <table className="w-full text-sm">
          <tbody>
            <tr className="border-b border-gray-100 hover:bg-white/30 transition-colors">
              <td className="p-4 font-semibold text-gray-700 flex items-center gap-2">
                <span className="text-blue-500">💰</span>
                Monthly Revenue
              </td>
              <td className="p-4 text-right font-bold text-blue-600">{fmt(revenue, currency)}</td>
            </tr>
            <tr className="border-b border-gray-100 hover:bg-white/30 transition-colors">
              <td className="p-4 font-semibold text-gray-700 flex items-center gap-2">
                <span className="text-emerald-500">📈</span>
                Gross Profit
              </td>
              <td className="p-4 text-right font-bold text-emerald-600">{fmt(grossProfit, currency)}</td>
            </tr>
            <tr className="border-b border-gray-100 hover:bg-white/30 transition-colors">
              <td className="p-4 font-semibold text-gray-700 flex items-center gap-2">
                <span className={netProfit >= 0 ? "text-green-500" : "text-red-500"}>
                  {netProfit >= 0 ? "✅" : "❌"}
                </span>
                Net Profit
              </td>
              <td className={`p-4 text-right font-bold px-3 py-1 rounded-lg ${getNetProfitColor(netProfit)}`}>
                {fmt(netProfit, currency)}
              </td>
            </tr>
            <tr className="hover:bg-white/30 transition-colors">
              <td className="p-4 font-semibold text-gray-700 flex items-center gap-2">
                <span className="text-purple-500">🎯</span>
                Break-even Customers
              </td>
              <td className="p-4 text-right font-bold text-purple-600 bg-purple-50 px-3 py-1 rounded-lg">
                {Math.ceil(breakEvenCustomers)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Cost Breakdown */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Fixed Costs */}
        <div className="overflow-hidden rounded-xl bg-white/50 backdrop-blur border-2 border-red-100 shadow-lg">
          <div className="bg-red-50/50 px-4 py-2 border-b border-red-100">
            <h3 className="font-semibold text-gray-700 flex items-center gap-2">
              <span className="text-red-500">🏢</span>
              Fixed Costs ({fmt(totalFixedCosts, currency)})
            </h3>
          </div>
          <table className="w-full text-sm">
            <tbody>
              <tr className="border-b border-red-100 hover:bg-red-50/30 transition-colors">
                <td className="p-3 font-medium text-gray-700 flex items-center gap-2">
                  <span className="text-orange-500">🏠</span>
                  Rent
                </td>
                <td className="p-3 text-right font-semibold text-red-600">{fmt(rentMonthly, currency)}</td>
              </tr>
              <tr className="border-b border-red-100 hover:bg-red-50/30 transition-colors">
                <td className="p-3 font-medium text-gray-700 flex items-center gap-2">
                  <span className="text-green-500">👥</span>
                  Salaries
                </td>
                <td className="p-3 text-right font-semibold text-red-600">{fmt(salariesMonthly, currency)}</td>
              </tr>
              <tr className="border-b border-red-100 hover:bg-red-50/30 transition-colors">
                <td className="p-3 font-medium text-gray-700 flex items-center gap-2">
                  <span className="text-yellow-500">⚡</span>
                  Utilities
                </td>
                <td className="p-3 text-right font-semibold text-red-600">{fmt(utilitiesMonthly, currency)}</td>
              </tr>
              <tr className="hover:bg-red-50/30 transition-colors">
                <td className="p-3 font-medium text-gray-700 flex items-center gap-2">
                  <span className="text-gray-500">📋</span>
                  Other
                </td>
                <td className="p-3 text-right font-semibold text-red-600">{fmt(otherFixedCosts, currency)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Variable Costs */}
        <div className="overflow-hidden rounded-xl bg-white/50 backdrop-blur border-2 border-orange-100 shadow-lg">
          <div className="bg-orange-50/50 px-4 py-2 border-b border-orange-100">
            <h3 className="font-semibold text-gray-700 flex items-center gap-2">
              <span className="text-orange-500">📦</span>
              Variable Costs ({fmt(totalVariableCosts, currency)})
            </h3>
          </div>
          <table className="w-full text-sm">
            <tbody>
              <tr className="border-b border-orange-100 hover:bg-orange-50/30 transition-colors">
                <td className="p-3 font-medium text-gray-700 flex items-center gap-2">
                  <span className="text-orange-500">💳</span>
                  Per Unit Cost
                </td>
                <td className="p-3 text-right font-semibold text-orange-600">{fmt(variableCostPerUnit, currency)}</td>
              </tr>
              <tr className="border-b border-orange-100 hover:bg-orange-50/30 transition-colors">
                <td className="p-3 font-medium text-gray-700 flex items-center gap-2">
                  <span className="text-blue-500">👥</span>
                  Target Customers
                </td>
                <td className="p-3 text-right font-semibold text-gray-600">{targetCustomers}</td>
              </tr>
              <tr className="hover:bg-orange-50/30 transition-colors">
                <td className="p-3 font-medium text-gray-700 flex items-center gap-2">
                  <span className="text-orange-500">💰</span>
                  Total Variable
                </td>
                <td className="p-3 text-right font-bold text-orange-600">{fmt(totalVariableCosts, currency)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

