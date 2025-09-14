type Props = {
  revenue: number;
  grossProfit: number;
  netProfit: number;
  breakEvenCustomers: number;
  currency: string;
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
}: Props) {
  const getNetProfitColor = (profit: number) => {
    if (profit > 0) return 'text-green-600 bg-green-50';
    if (profit < 0) return 'text-red-600 bg-red-50';
    return 'text-gray-600 bg-gray-50';
  };

  return (
    <div className="overflow-hidden rounded-xl bg-white/50 backdrop-blur border-2 border-gray-100 shadow-lg">
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
  );
}

