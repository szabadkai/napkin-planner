type Props = { currentCustomers: number; breakEvenCustomers: number };

export default function BreakEvenChart({ currentCustomers, breakEvenCustomers }: Props) {
  const max = Math.max(breakEvenCustomers * 1.5, currentCustomers * 1.5, 1);
  const currentPct = Math.min((currentCustomers / max) * 100, 100);
  const bePct = Math.min((breakEvenCustomers / max) * 100, 100);

  const isProfitable = currentCustomers >= breakEvenCustomers;

  return (
    <div className="bg-white/50 backdrop-blur rounded-xl p-4 border-2 border-gray-100 shadow-lg">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-lg">📊</span>
        <h3 className="font-semibold text-gray-800">Break-even Analysis</h3>
      </div>

      <div className="space-y-4">
        <div className="relative h-4 w-full rounded-full bg-gradient-to-r from-gray-200 to-gray-300 shadow-inner">
          <div
            className={`absolute left-0 top-0 h-4 rounded-full shadow-md transition-all duration-500 ${
              isProfitable
                ? 'bg-gradient-to-r from-emerald-400 to-green-500'
                : 'bg-gradient-to-r from-amber-400 to-orange-500'
            }`}
            style={{ width: `${currentPct}%` }}
          />
          <div
            className="absolute top-[-6px] flex flex-col items-center"
            style={{ left: `${Math.max(0, Math.min(bePct, 95))}%` }}
            title={`Break-even: ${Math.ceil(breakEvenCustomers)} customers`}
          >
            <div className="w-1 h-6 bg-red-500 rounded-full shadow-md"></div>
            <div className="text-xs font-semibold text-red-600 mt-1 whitespace-nowrap bg-white px-2 py-1 rounded shadow-sm">
              Break-even
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-white/70 rounded-lg p-2">
            <div className="text-xs font-medium text-gray-600">Start</div>
            <div className="font-bold text-gray-800">0</div>
          </div>
          <div className={`rounded-lg p-2 ${isProfitable ? 'bg-green-50' : 'bg-orange-50'}`}>
            <div className="text-xs font-medium text-gray-600">Current</div>
            <div className={`font-bold ${isProfitable ? 'text-green-700' : 'text-orange-700'}`}>
              {Math.round(currentCustomers)}
            </div>
          </div>
          <div className="bg-red-50 rounded-lg p-2">
            <div className="text-xs font-medium text-gray-600">Break-even</div>
            <div className="font-bold text-red-700">{Math.ceil(breakEvenCustomers)}</div>
          </div>
        </div>

        <div className={`text-center p-3 rounded-lg ${
          isProfitable
            ? 'bg-green-50 text-green-700 border border-green-200'
            : 'bg-amber-50 text-amber-700 border border-amber-200'
        }`}>
          <div className="font-semibold">
            {isProfitable
              ? `✅ Profitable! You're ${Math.round(currentCustomers - breakEvenCustomers)} customers above break-even`
              : `📈 Need ${Math.ceil(breakEvenCustomers - currentCustomers)} more customers to break even`
            }
          </div>
        </div>
      </div>
    </div>
  );
}

