import { extractFirstNumber, parsePercent } from '@/components/QuickMath';
import type { Parameters } from '@/types/parameters';

export interface ViabilityScore {
  overall: number;
  breakdown: {
    profitability: number;
    marketSize: number;
    competition: number;
    feasibility: number;
  };
  insights: string[];
  grade: 'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C' | 'D' | 'F';
  color: string;
}

export function calculateViabilityScore(params: Parameters): ViabilityScore {
  const insights: string[] = [];
  
  // Extract numeric values
  const price = extractFirstNumber(params.average_price);
  const margin = parsePercent(params.gross_margin_percent);
  const fixed = extractFirstNumber(params.fixed_monthly_costs_total);
  const cac = extractFirstNumber(params.cac);
  const churnRate = parsePercent(params.churn_rate);
  
  // Calculate unit economics
  const unitRevenue = isFinite(price) && isFinite(margin) ? price * margin : 0;
  const breakEven = isFinite(unitRevenue) && unitRevenue > 0 && isFinite(fixed) ? Math.ceil(fixed / unitRevenue) : Infinity;
  
  // 1. Profitability Score (0-25)
  let profitability = 0;
  if (isFinite(margin) && margin > 0) {
    if (margin >= 0.7) profitability = 25;
    else if (margin >= 0.5) profitability = 20;
    else if (margin >= 0.3) profitability = 15;
    else if (margin >= 0.2) profitability = 10;
    else profitability = 5;
    
    if (margin >= 0.8) insights.push("🟢 Excellent profit margins (80%+)");
    else if (margin >= 0.5) insights.push("🟡 Good profit margins (50%+)");
    else if (margin < 0.2) insights.push("🔴 Low profit margins (<20%)");
  } else {
    insights.push("❌ Missing or invalid margin data");
  }
  
  // Adjust for break-even feasibility
  if (isFinite(breakEven)) {
    if (breakEven <= 20) {
      profitability = Math.min(25, profitability + 5);
      insights.push("🟢 Low break-even point - highly achievable");
    } else if (breakEven <= 100) {
      insights.push("🟡 Moderate break-even point - achievable with effort");
    } else if (breakEven <= 500) {
      profitability = Math.max(0, profitability - 5);
      insights.push("🔴 High break-even point - challenging to achieve");
    } else {
      profitability = Math.max(0, profitability - 10);
      insights.push("🔴 Very high break-even point - extremely challenging");
    }
  }
  
  // 2. Market Size Score (0-25)
  let marketSize = 15; // Default moderate score
  const idea = params.business_idea.toLowerCase();
  
  // Boost for scalable/large markets
  if (idea.includes('software') || idea.includes('app') || idea.includes('digital') || idea.includes('online')) {
    marketSize = 20;
    insights.push("🟢 Digital business model - highly scalable");
  } else if (idea.includes('local') || idea.includes('neighborhood') || idea.includes('city')) {
    marketSize = 10;
    insights.push("🟡 Local market focus - limited scalability");
  } else if (idea.includes('niche') || idea.includes('specialized')) {
    marketSize = 12;
    insights.push("🟡 Niche market - focused but limited scale");
  }
  
  // 3. Competition Score (0-25) - Inverse scoring (less competition = higher score)
  let competition = 15; // Default moderate score
  
  if (idea.includes('unique') || idea.includes('innovative') || idea.includes('new') || idea.includes('first')) {
    competition = 20;
    insights.push("🟢 Innovative concept - potential competitive advantage");
  } else if (idea.includes('crowded') || idea.includes('competitive') || idea.includes('saturated')) {
    competition = 8;
    insights.push("🔴 Highly competitive market");
  } else if (idea.includes('established') || idea.includes('traditional')) {
    competition = 10;
    insights.push("🟡 Established market - competition exists");
  }
  
  // 4. Feasibility Score (0-25)
  let feasibility = 15; // Default moderate score
  
  // Check if complex requirements mentioned
  if (idea.includes('simple') || idea.includes('basic') || idea.includes('straightforward')) {
    feasibility = 20;
    insights.push("🟢 Simple business model - easy to execute");
  } else if (idea.includes('complex') || idea.includes('advanced') || idea.includes('sophisticated')) {
    feasibility = 10;
    insights.push("🔴 Complex business model - execution challenges");
  } else if (idea.includes('regulated') || idea.includes('licensed') || idea.includes('compliance')) {
    feasibility = 8;
    insights.push("🔴 Regulatory requirements - compliance overhead");
  }
  
  // Adjust for customer acquisition
  if (isFinite(cac) && isFinite(unitRevenue)) {
    const paybackMonths = cac / unitRevenue;
    if (paybackMonths <= 3) {
      feasibility += 3;
      insights.push("🟢 Fast payback period - efficient customer acquisition");
    } else if (paybackMonths > 12) {
      feasibility -= 3;
      insights.push("🔴 Long payback period - slow customer acquisition");
    }
  }
  
  // Adjust for churn
  if (isFinite(churnRate)) {
    if (churnRate <= 0.05) { // 5% monthly churn or less
      feasibility += 2;
      insights.push("🟢 Low churn rate - strong customer retention");
    } else if (churnRate >= 0.15) { // 15% monthly churn or more
      feasibility -= 2;
      insights.push("🔴 High churn rate - customer retention issues");
    }
  }
  
  // Calculate overall score
  const overall = Math.min(100, Math.max(0, profitability + marketSize + competition + feasibility));
  
  // Determine grade and color
  let grade: ViabilityScore['grade'];
  let color: string;
  
  if (overall >= 90) {
    grade = 'A+';
    color = '#10b981'; // emerald-500
  } else if (overall >= 85) {
    grade = 'A';
    color = '#22c55e'; // green-500
  } else if (overall >= 80) {
    grade = 'B+';
    color = '#84cc16'; // lime-500
  } else if (overall >= 70) {
    grade = 'B';
    color = '#eab308'; // yellow-500
  } else if (overall >= 60) {
    grade = 'C+';
    color = '#f97316'; // orange-500
  } else if (overall >= 50) {
    grade = 'C';
    color = '#ef4444'; // red-500
  } else if (overall >= 40) {
    grade = 'D';
    color = '#dc2626'; // red-600
  } else {
    grade = 'F';
    color = '#991b1b'; // red-800
  }
  
  // Add overall assessment
  if (overall >= 80) {
    insights.unshift("🎉 Strong business opportunity with high viability");
  } else if (overall >= 65) {
    insights.unshift("👍 Promising opportunity with some areas for improvement");
  } else if (overall >= 50) {
    insights.unshift("⚠️ Moderate potential - requires significant improvements");
  } else {
    insights.unshift("❌ Low viability - major changes needed");
  }
  
  return {
    overall,
    breakdown: {
      profitability: Math.min(25, Math.max(0, profitability)),
      marketSize: Math.min(25, Math.max(0, marketSize)),
      competition: Math.min(25, Math.max(0, competition)),
      feasibility: Math.min(25, Math.max(0, feasibility))
    },
    insights,
    grade,
    color
  };
}