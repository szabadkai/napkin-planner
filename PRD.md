# **Product Requirements Document (PRD)**

**Product Name:** BizNapkin  
**Owner:** Levi (Engineering Manager)  
**Date:** 2025-09-14

---

## 1. **Purpose**

NapkinPlanner helps entrepreneurs and operators quickly assess the viability of a business idea using a structured set of parameters (costs, pricing, margin, target customers). The goal is to provide clarity in minutes, not hours — “back-of-the-napkin” level math with room to expand for more detailed modeling.

---

## 2. **Goals & Non-Goals**

### Goals

- Provide a **minimal input form** for users to enter the core assumptions.
- Instantly compute **revenue, gross profit, net profit, and break-even point**.
- Allow layering of **optional parameters** for deeper analysis.
- Output results in a clean, **visual summary (tables + charts)**.

### Non-Goals

- Full financial forecasting (3–5 year P&L).
- Detailed investor-grade reporting.
- Complex integrations with accounting/CRM tools (at MVP).

---

## 3. **User Personas**

1. **Founder/Hustler** — Wants to test if an idea is worth pursuing.
2. **Ops/Side Hustler** — Wants quick math on small businesses.
3. **Investor/Advisor** — Wants a basic sense of business traction potential.

---

## 4. **Core Features (MVP)**

### Inputs (required)

- **business_idea** (text)
- **location** (text/dropdown of region)
- **average_price** (number + currency)
- **gross_margin_percent** (number %)
- **fixed_monthly_costs_total** (number + currency)
- **variable_cost_assumptions** (text/number)
- **target_customers** (number)

### Calculations (auto-generated)

- Monthly Revenue = average_price × target_customers
- Gross Profit = Revenue × gross_margin%
- Net Profit = Gross Profit – fixed_monthly_costs_total
- Break-even Customers = fixed_costs ÷ (average_price × gross_margin%)

### Outputs

- **Summary table:** Revenue, Gross Profit, Net Profit
- **Chart:** Profit vs. Customers
- **Break-even point indicator**

---

## 5. **Extended Features (Post-MVP)**

- **CAC, churn, sales cycle** → growth dynamics
- **Headcount plan, tools/licenses** → scale ops costs
- **Billing model, setup fees, discounts** → SaaS-specific
- **Taxes** → net income realism
- **Meta (notes, sources)** → documentation

---

## 6. **UI/UX Requirements**

- **Step 1:** Minimal form (7 required inputs)
- **Step 2:** Instant math, results on one screen
- **Step 3 (Optional):** Expand panel → advanced parameters
- Clean, mobile-friendly **single-page app (SPA)**

---

## 7. **Technical Requirements**

- **Frontend:** React or Next.js (SPA)
- **Backend:** Minimal Node/Express or serverless (optional — can compute client-side)
- **Persistence:** Local storage (MVP), later DB if needed
- **APIs:** None required for MVP, optional integration with currency APIs later

---

## 8. **Acceptance Criteria**

- User can enter **required params only** and get instant output.
- User can toggle open advanced params without blocking basic results.
- Calculations are correct and displayed clearly.
- MVP deployed as a web app, usable on mobile & desktop.

---

## 9. **Risks & Unknowns**

- Scope creep toward “full financial modeling”.
- Assumption accuracy — (to be handled with clear disclaimers).
- Competitive overlap (many startup calculators, need UX differentiation).
