"use client";

import { useState } from "react";
import QuickMath from "@/components/QuickMath";
import ViabilityScore from "@/components/ViabilityScore";
import { SliderField, SelectField, NumberField } from "@/components/InputField";
import { calculateViabilityScore } from "@/lib/viability";
import type { Parameters } from "@/types/parameters";

export default function ScenarioCard({ initial, onRemove }: { initial: Parameters; onRemove: () => void }) {
  const [p, setP] = useState<Parameters>(initial);
  const [showScore, setShowScore] = useState(false);

  const set = (field: keyof Parameters) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setP({ ...p, [field]: e.target.value });
  };

  return (
    <div className="card p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="h-6 w-6 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
            <span className="text-white text-xs font-bold">📋</span>
          </div>
          <h3 className="font-bold text-lg bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">Scenario Comparison</h3>
        </div>
        <button className="text-sm text-red-500 hover:text-red-700 font-medium px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors" onClick={onRemove}>
          🗑️ Remove
        </button>
      </div>
      <div className="grid grid-cols-1 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Business idea</label>
          <input className="input" value={p.business_idea} onChange={set("business_idea")} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Location</label>
            <input className="input" value={p.location} onChange={set("location")} />
          </div>
          <NumberField
            label="Average Price"
            value={p.average_price}
            onChange={(value) => setP({ ...p, average_price: value })}
            prefix="$"
            placeholder="99"
          />
          <SliderField
            label="Gross Margin"
            value={p.gross_margin_percent.replace('%', '')}
            onChange={(value) => setP({ ...p, gross_margin_percent: `${value}%` })}
            min={0}
            max={100}
            step={5}
            unit="%"
          />
          <NumberField
            label="Fixed Monthly Costs (Total)"
            value={p.fixed_monthly_costs_total}
            onChange={(value) => setP({ ...p, fixed_monthly_costs_total: value })}
            prefix="$"
            placeholder="5000"
          />
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium mb-1">Fixed costs breakdown</label>
            <input className="input" value={p.fixed_monthly_costs_breakdown} onChange={set("fixed_monthly_costs_breakdown")} />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium mb-1">Variable cost assumptions</label>
            <input className="input" value={p.variable_cost_assumptions} onChange={set("variable_cost_assumptions")} />
          </div>
        </div>
        <div className="mt-6 bg-gradient-to-r from-amber-50/80 to-orange-50/80 border-2 border-amber-200/60 rounded-2xl p-6 text-sm backdrop-blur-sm">
          <div className="font-bold text-amber-800 mb-3 flex items-center gap-2">
            <span className="text-lg">🔢</span>
            Quick Math (auto)
          </div>
          <QuickMath
            averagePrice={p.average_price}
            grossMarginPercent={p.gross_margin_percent}
            fixedMonthlyCostsTotal={p.fixed_monthly_costs_total}
            cac={p.cac}
            churnRate={p.churn_rate}
            targetCustomers={p.target_customers}
          />
        </div>
        <div className="pt-6">
          <button
            className="btn-primary"
            onClick={() => setShowScore(true)}
          >
            <span>🎯</span>
            <span>Calculate Viability Score</span>
          </button>
        </div>
        {showScore && (
          <div className="card p-6 mt-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg">🎯</span>
              <h4 className="font-semibold text-purple-700">Viability Score</h4>
            </div>
            <ViabilityScore score={calculateViabilityScore(p)} />
          </div>
        )}
        <details className="mt-2">
          <summary className="cursor-pointer font-medium">More parameters</summary>
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <SliderField
              label="Target Customers"
              value={p.target_customers || "100"}
              onChange={(value) => setP({ ...p, target_customers: value })}
              min={10}
              max={10000}
              step={10}
              formatter={(value) => value >= 1000 ? `${(value/1000).toFixed(1)}K` : value.toString()}
            />
            <SliderField
              label="Customer Acquisition Cost (CAC)"
              value={p.cac || "50"}
              onChange={(value) => setP({ ...p, cac: value })}
              min={0}
              max={500}
              step={5}
              formatter={(value) => `$${value}`}
            />
            <SliderField
              label="Monthly Churn Rate"
              value={p.churn_rate?.replace('%', '') || "5"}
              onChange={(value) => setP({ ...p, churn_rate: `${value}%` })}
              min={0}
              max={50}
              step={1}
              unit="%"
            />
            <SliderField
              label="Sales Cycle"
              value={p.sales_cycle_days || "30"}
              onChange={(value) => setP({ ...p, sales_cycle_days: value })}
              min={1}
              max={365}
              step={1}
              formatter={(value) => `${value} days`}
            />
          </div>
        </details>
      </div>
    </div>
  );
}
