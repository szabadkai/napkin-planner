# **Technical Specification**

**Product:** BizNapkin  
**Date:** 2025-09-14  
**Owner:** Levi

---

## 1. **Tech Stack**

- **Frontend Framework:** [Next.js 14+](https://nextjs.org/) (App Router, React Server Components for performance)
- **Styling:** [Tailwind CSS 3+](https://tailwindcss.com/) with custom theme for brand identity
- **Deployment:** [Vercel](https://vercel.com/) (CI/CD, env management, edge functions)
- **Hosting:** Vercel (auto SSL, CDN, serverless infra)
- **Backend (MVP):** All calculations client-side for speed and simplicity. Possible serverless endpoints (`app/api/` in Next.js) for advanced persistence later.
- **Data Persistence:** None required for MVP → use `localStorage` for saving inputs between page loads. Future option: Supabase / PlanetScale if saving models per-user.

---

## 2. **System Architecture**

### High-level Flow (MVP)

```
[User] --> [Next.js Frontend SPA] --> [Calculation Hooks/Utils in Client]
        Output: UI Summary + Charts
```

### Extended Flow (Post-MVP with persistence)

```
[User] --> [Next.js Frontend] --> [Serverless API Routes] --> [DB]
```

---

## 3. **Frontend Specification**

- **Pages/Routes (Next.js App Router)**
    - `/` → Landing page with CTA "Evaluate an Idea"
    - `/calculator` → Main app (inputs + results)
    - `/about` (optional) → Methodology

- **Components**
    - `FormInputs.tsx` (parameters form)
    - `ResultsTable.tsx` (revenue/profit/break-even summary)
    - `BreakEvenChart.tsx` (Tailwind + Chart.js/Recharts)
    - `AdvancedToggle.tsx` (expand/collapse advanced params)
    - `Layout.tsx` (header/footer, consistent styling)

- **Styling**
    - Tailwind utility classes
    - Theme config in `tailwind.config.js` (colors, typography scale)

---

## 4. **Core Calculations (Utils Layer)**

All calculations implemented in `lib/calculations.ts`:

```ts
export function calculateRevenue(price: number, customers: number): number {
    return price * customers;
}

export function calculateGrossProfit(
    revenue: number,
    grossMarginPercent: number
): number {
    return revenue * (grossMarginPercent / 100);
}

export function calculateNetProfit(
    grossProfit: number,
    fixedCosts: number
): number {
    return grossProfit - fixedCosts;
}

export function calculateBreakEvenCustomers(
    fixedCosts: number,
    price: number,
    grossMarginPercent: number
): number {
    return fixedCosts / (price * (grossMarginPercent / 100));
}
```

---

## 5. **Deployment**

- GitHub / GitLab repo connected to Vercel
- `main` branch → auto-deploy to production
- `dev` branch → preview deployments
- Env vars managed via Vercel dashboard (future use for currency APIs, analytics)

---

## 6. **Non-Functional Requirements**

- **Performance:** <1s TTFB via edge caching/CDN (Vercel)
- **Scalability:** Serverless model → zero ops overhead
- **Accessibility:** WCAG AA compliance, forms keyboard accessible
- **Browser support:** Latest 2 versions of Chrome, Safari, Firefox, Edge

---

## 7. **Future Extensions**

- Add **Supabase** for user accounts/project saves
- Integrate currency conversion API
- Advanced Monte Carlo simulations for sensitivity testing

---

✅ This spec defines **how to implement** the PRD using Next.js + Tailwind + Vercel.
