"use client";
import { useEffect, useMemo, useState } from "react";
import { ResearchResult } from "@/lib/types";
import { computeViability } from "@/lib/score";

type State = {
  loading: boolean;
  error?: string;
  data?: ResearchResult;
};

function NumberField({
  label,
  value,
  onChange,
  step = 1,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
  step?: number;
}) {
  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="w-56 text-white/80">{label}</span>
      <input
        type="number"
        step={step}
        className="input-like flex-1 rounded-xl px-3 py-2"
        value={Number.isFinite(value) ? value : 0}
        onChange={(e) => {
          const v = e.target.value;
          onChange(v === "" ? 0 : parseFloat(v));
        }}
      />
    </label>
  );
}

function SimpleChart({
  series,
  breakEvenMonth,
}: {
  series: { month: number; cumulativeProfit: number }[];
  breakEvenMonth: number | null;
}) {
  const width = 640;
  const height = 240;
  const padding = 32;
  const xs = series.map((d) => d.month);
  const ys = series.map((d) => d.cumulativeProfit);
  const ysClean = ys.filter((n) => Number.isFinite(n)) as number[];
  const yVals = ysClean.length ? ysClean : [0];
  const xMin = Math.min(...xs);
  const xMax = Math.max(...xs);
  const yMin = Math.min(0, ...yVals);
  const yMax = Math.max(0, ...yVals);
  const xScale = (m: number) =>
    padding + ((m - xMin) / (xMax - xMin)) * (width - padding * 2);
  const yScale = (v: number) =>
    height - padding - ((v - yMin) / (yMax - yMin || 1)) * (height - padding * 2);

  const path = series
    .map((d, i) => `${i === 0 ? "M" : "L"} ${xScale(d.month)} ${yScale(d.cumulativeProfit)}`)
    .join(" ");

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full max-w-3xl">
      <defs>
        <linearGradient id="lineGrad" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor="#22c55e" />
          <stop offset="100%" stopColor="#06b6d4" />
        </linearGradient>
        <linearGradient id="areaGrad" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="rgba(34,197,94,0.25)" />
          <stop offset="100%" stopColor="rgba(34,197,94,0)" />
        </linearGradient>
      </defs>
      <rect x={0} y={0} width={width} height={height} fill="transparent" />
      {/* Grid */}
      {Array.from({ length: 6 }).map((_, i) => {
        const x = padding + (i / 5) * (width - padding * 2);
        return <line key={i} x1={x} y1={padding} x2={x} y2={height - padding} stroke="rgba(255,255,255,0.06)" />;
      })}
      <line x1={padding} y1={yScale(0)} x2={width - padding} y2={yScale(0)} stroke="rgba(255,255,255,0.2)" strokeDasharray="4 4" />
      <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="rgba(255,255,255,0.2)" />

      {/* Area under line */}
      <path d={`${path} L ${xScale(xMax)} ${yScale(0)} L ${xScale(xMin)} ${yScale(0)} Z`} fill="url(#areaGrad)" />

      {/* Line */}
      <path d={path} fill="none" stroke="url(#lineGrad)" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />

      {/* Break-even marker */}
      {breakEvenMonth && (
        <g>
          <line x1={xScale(breakEvenMonth)} y1={padding} x2={xScale(breakEvenMonth)} y2={height - padding} stroke="#f59e0b" strokeDasharray="6 4" />
          <text x={xScale(breakEvenMonth) + 6} y={padding + 12} fontSize={12} fill="#fcd34d">
            Break-even: M{breakEvenMonth}
          </text>
        </g>
      )}

      {/* Y max/min labels */}
      <text x={8} y={yScale(yMax)} fontSize={10} fill="rgba(255,255,255,0.6)">{Number.isFinite(yMax) ? Math.round(yMax) : 0}</text>
      <text x={8} y={yScale(yMin)} fontSize={10} fill="rgba(255,255,255,0.6)">{Number.isFinite(yMin) ? Math.round(yMin) : 0}</text>
    </svg>
  );
}

function ScoreRing({ value }: { value: number }) {
  const size = 140;
  const stroke = 14;
  const radius = (size - stroke) / 2;
  const c = Math.PI * 2 * radius;
  const safe = Number.isFinite(value) ? value : 0;
  const pct = Math.max(0, Math.min(100, safe));
  const dash = (pct / 100) * c;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <defs>
        <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#7c3aed" />
          <stop offset="50%" stopColor="#06b6d4" />
          <stop offset="100%" stopColor="#22c55e" />
        </linearGradient>
      </defs>
      <g transform={`translate(${size / 2}, ${size / 2})`}>
        <circle r={radius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={stroke} />
        <circle
          r={radius}
          fill="none"
          stroke="url(#ringGrad)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${c - dash}`}
          transform="rotate(-90)"
        />
        <text x={0} y={4} fontSize={28} textAnchor="middle" fill="#fff" fontWeight={600}>
          {Number.isFinite(pct) ? Math.round(pct) : 0}
        </text>
        <text x={0} y={24} fontSize={11} textAnchor="middle" fill="rgba(255,255,255,0.7)">/100</text>
      </g>
    </svg>
  );
}

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [location, setLocation] = useState("");
  const [rampMonths, setRampMonths] = useState(3);
  const [state, setState] = useState<State>({ loading: false });

  useEffect(() => {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
      const locale = navigator.language || "";
      if (!location) setLocation(tz.split("/").pop() || locale);
    } catch {}
  }, [location]);

  const viability = useMemo(() => {
    if (!state.data) return null;
    return computeViability({ ...state.data, ramp_months: rampMonths });
  }, [state.data, rampMonths]);

  const submit = async () => {
    setState({ loading: true });
    try {
      const res = await fetch("/api/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, location }),
      });
      const json = (await res.json()) as { ok?: boolean; data?: ResearchResult; error?: string };
      if (!res.ok || !json?.ok) throw new Error(json?.error || "Failed");
      setState({ loading: false, data: json.data });
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Request failed";
      setState({ loading: false, error: message });
    }
  };

  const d = state.data;

  return (
    <div className="min-h-screen px-5 sm:px-8 py-8 font-sans">
      <div className="mx-auto max-w-6xl space-y-8">
        <header className="pt-2">
          <div className="flex items-center gap-3 mb-3">
            <span className="pill">BizNapkin</span>
            <span className="pill">Back‑of‑the‑napkin planner</span>
          </div>
          <h1 className="title-gradient text-4xl sm:text-5xl font-semibold tracking-tight">
            Evaluate your business idea delightfully
          </h1>
          <p className="mt-2 text-sm text-white/70">Fast research, tweak assumptions, and see when you break even.</p>
        </header>

        <section className="glass rounded-2xl p-4 sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              placeholder="Describe your idea (e.g., ‘Lovable for pet owners’ 🐾)"
              className="input-like flex-1 rounded-xl px-4 py-3 text-[15px]"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
            <input
              placeholder="Location (city / region) 🌍"
              className="input-like w-full sm:w-[220px] rounded-xl px-4 py-3 text-[15px]"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
            <button
              onClick={submit}
              disabled={!prompt || state.loading}
              className={`btn-gradient rounded-xl px-5 py-3 text-[15px] font-medium ${!prompt || state.loading ? "btn-disabled" : ""}`}
            >
              {state.loading ? "Thinking…" : "Research"}
            </button>
          </div>
          {state.error && (
            <div className="mt-3 text-sm text-red-300">{state.error}</div>
          )}
        </section>

        {d && (
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="glass space-y-5 rounded-2xl p-5 sm:p-6">
              <div className="flex items-center justify-between">
                <h2 className="font-medium text-white/90">Assumptions</h2>
                <span className="pill">{d.location || "your market"}</span>
              </div>
              <div className="text-sm text-white/70">{d.business_analysis}</div>
              <div className="grid grid-cols-1 gap-3">
                <NumberField label="Average price" value={d.average_price} onChange={(n) => setState((s) => ({ ...s, data: s.data ? { ...s.data, average_price: n } : s.data }))} />
                <NumberField label="Gross margin %" value={d.gross_margin_percent} onChange={(n) => setState((s) => ({ ...s, data: s.data ? { ...s.data, gross_margin_percent: n } : s.data }))} />
                <NumberField label="Variable cost per unit" value={d.variable_cost_per_unit} onChange={(n) => setState((s) => ({ ...s, data: s.data ? { ...s.data, variable_cost_per_unit: n } : s.data }))} />
                <NumberField label="Target customers / month" value={d.target_customers} onChange={(n) => setState((s) => ({ ...s, data: s.data ? { ...s.data, target_customers: Math.max(0, Math.round(n)) } : s.data }))} />
                <hr className="my-1 border-white/10" />
                <NumberField label="Rent (monthly)" value={d.rent_monthly} onChange={(n) => setState((s) => ({ ...s, data: s.data ? { ...s.data, rent_monthly: n, fixed_monthly_costs_total: n + s.data.salaries_monthly + s.data.utilities_monthly + s.data.other_fixed_costs_monthly } : s.data }))} />
                <NumberField label="Salaries (monthly)" value={d.salaries_monthly} onChange={(n) => setState((s) => ({ ...s, data: s.data ? { ...s.data, salaries_monthly: n, fixed_monthly_costs_total: s.data.rent_monthly + n + s.data.utilities_monthly + s.data.other_fixed_costs_monthly } : s.data }))} />
                <NumberField label="Utilities (monthly)" value={d.utilities_monthly} onChange={(n) => setState((s) => ({ ...s, data: s.data ? { ...s.data, utilities_monthly: n, fixed_monthly_costs_total: s.data.rent_monthly + s.data.salaries_monthly + n + s.data.other_fixed_costs_monthly } : s.data }))} />
                <NumberField label="Other fixed costs (monthly)" value={d.other_fixed_costs_monthly} onChange={(n) => setState((s) => ({ ...s, data: s.data ? { ...s.data, other_fixed_costs_monthly: n, fixed_monthly_costs_total: s.data.rent_monthly + s.data.salaries_monthly + s.data.utilities_monthly + n } : s.data }))} />
                <NumberField label="Fixed costs total (monthly)" value={d.fixed_monthly_costs_total} onChange={(n) => setState((s) => ({ ...s, data: s.data ? { ...s.data, fixed_monthly_costs_total: n } : s.data }))} />
                <label className="flex items-center gap-2 text-sm">
                  <span className="w-56 text-white/80">Ramp-up months</span>
                  <input type="number" min={1} max={24} value={rampMonths} onChange={(e) => setRampMonths(Math.max(1, Math.min(24, parseInt(e.target.value))))} className="input-like flex-1 rounded-xl px-3 py-2" />
                </label>
              </div>
              <div>
                <label className="text-xs text-white/60">Variable cost assumptions</label>
                <textarea className="input-like w-full rounded-xl px-3 py-2 mt-1" value={d.variable_cost_assumptions} onChange={(e) => setState((s) => ({ ...s, data: s.data ? { ...s.data, variable_cost_assumptions: e.target.value } : s.data }))} />
              </div>
            </div>

            <div className="glass rounded-2xl p-5 sm:p-6 space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="font-medium text-white/90">Viability</h2>
                <span className="pill">Break-even forecast</span>
              </div>
              {viability && (
                <div className="grid grid-cols-1 sm:grid-cols-[160px_auto] gap-4 sm:gap-6 items-center">
                  <div className="flex items-center justify-center">
                    <ScoreRing value={viability.viabilityScore} />
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="text-white/80">Contribution per unit: <b className="text-white">{Number.isFinite(viability.contributionPerUnit) ? Math.round(viability.contributionPerUnit) : 0}</b></div>
                    <div className="text-white/80">Monthly net profit: <b className="text-white">{Number.isFinite(viability.monthlyNetProfit) ? Math.round(viability.monthlyNetProfit) : 0}</b></div>
                    <div className="text-white/80">Break-even customers/month: <b className="text-white">{viability.breakEvenCustomersPerMonth ? Math.ceil(viability.breakEvenCustomersPerMonth) : "—"}</b></div>
                  </div>
                </div>
              )}

              {viability && (
                <div className="mt-2">
                  <SimpleChart
                    series={viability.series.map(({ month, cumulativeProfit }) => ({ month, cumulativeProfit }))}
                    breakEvenMonth={viability.breakEvenMonth}
                  />
                </div>
              )}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
