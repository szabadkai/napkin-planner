export const baseNapkinPrompt = `You are a startup advisor. I want a napkin business plan for my idea.

Business idea: {{business_idea}}
Location/market: {{location}}
Average product/service price: {{average_price}}
Estimated gross margin: {{gross_margin_percent}}
Fixed monthly costs: {{fixed_monthly_costs_breakdown}} = total {{fixed_monthly_costs_total}}
Variable cost assumptions: {{variable_cost_assumptions}}

Create a concise 1-page napkin plan with:
1. Business Concept (what, who, revenue streams)
2. Key Assumptions (pricing, margins, volumes)
3. Costs (fixed vs variable)
4. Break-Even (customers required to cover costs)
5. Team/Operations (roles & scaling per customer count)
6. Market Potential (quick TAM estimate in this location)
7. High-Level Trajectory (Year 1: pilot, Year 2: scale, Year 3: growth)

Keep it simple, with back-of-the-envelope numbers and no filler text.`;

