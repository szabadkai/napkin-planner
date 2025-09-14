"use client";

import type { ViabilityScore as ViabilityScoreType } from '@/lib/viability';

interface Props {
  score: ViabilityScoreType;
}

export default function ViabilityScore({ score }: Props) {
  const { overall, breakdown, insights, grade, color } = score;
  
  return (
    <div className="space-y-6">
      {/* Overall Score */}
      <div className="text-center">
        <div 
          className="inline-flex items-center justify-center w-24 h-24 rounded-full text-white text-3xl font-bold shadow-2xl"
          style={{ backgroundColor: color }}
        >
          {grade}
        </div>
        <div className="mt-3">
          <div className="text-2xl font-bold" style={{ color }}>
            {overall}/100
          </div>
          <div className="text-sm text-slate-600">Viability Score</div>
        </div>
      </div>
      
      {/* Score Breakdown */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-4 rounded-xl border border-purple-100 text-center">
          <div className="text-xs font-semibold text-purple-600 uppercase tracking-wide mb-1">Profitability</div>
          <div className="text-xl font-bold text-purple-800">{breakdown.profitability}</div>
          <div className="text-xs text-purple-600">/ 25</div>
        </div>
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-4 rounded-xl border border-emerald-100 text-center">
          <div className="text-xs font-semibold text-emerald-600 uppercase tracking-wide mb-1">Market Size</div>
          <div className="text-xl font-bold text-emerald-800">{breakdown.marketSize}</div>
          <div className="text-xs text-emerald-600">/ 25</div>
        </div>
        <div className="bg-gradient-to-br from-cyan-50 to-blue-50 p-4 rounded-xl border border-cyan-100 text-center">
          <div className="text-xs font-semibold text-cyan-600 uppercase tracking-wide mb-1">Competition</div>
          <div className="text-xl font-bold text-cyan-800">{breakdown.competition}</div>
          <div className="text-xs text-cyan-600">/ 25</div>
        </div>
        <div className="bg-gradient-to-br from-orange-50 to-red-50 p-4 rounded-xl border border-orange-100 text-center">
          <div className="text-xs font-semibold text-orange-600 uppercase tracking-wide mb-1">Feasibility</div>
          <div className="text-xl font-bold text-orange-800">{breakdown.feasibility}</div>
          <div className="text-xs text-orange-600">/ 25</div>
        </div>
      </div>
      
      {/* Progress Bar */}
      <div className="bg-slate-200 rounded-full h-3 overflow-hidden">
        <div 
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{ 
            width: `${overall}%`,
            backgroundColor: color,
            boxShadow: `0 0 10px ${color}40`
          }}
        />
      </div>
      
      {/* Insights */}
      <div className="space-y-2">
        <div className="font-semibold text-slate-700 mb-3">Key Insights</div>
        {insights.map((insight, idx) => (
          <div key={idx} className="flex items-start gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
            <div className="text-sm leading-relaxed">{insight}</div>
          </div>
        ))}
      </div>
    </div>
  );
}