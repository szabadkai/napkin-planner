# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

BizNapkin is a business viability calculator built with Next.js 14 that helps entrepreneurs quickly assess business ideas using back-of-the-napkin calculations. The app provides instant financial metrics (revenue, profit, break-even) from basic business parameters.

## Architecture

- **Frontend**: Next.js 14 with App Router and React Server Components
- **Styling**: Tailwind CSS with utility-first approach
- **Calculations**: Client-side only for speed, implemented in `/lib/calculations.ts`
- **AI Integration**: Gemini API via `/app/api/gemini/route.ts` for parameter extraction
- **Deployment**: Vercel with auto-deployment from main branch

## Key File Structure

```
app/
  ├── calculator/page.tsx    # Main calculator interface
  ├── api/gemini/route.ts    # AI endpoint for parameter extraction
  ├── layout.tsx             # Root layout
  └── page.tsx               # Landing page
components/
  ├── BreakEvenChart.tsx     # Profit visualization
  └── ResultsTable.tsx       # Financial metrics display
lib/
  └── calculations.ts        # Core business calculations
```

## Common Commands

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run format   # Format code with Prettier
```

## Core Calculations

All financial calculations are in `lib/calculations.ts`:
- Revenue = price × customers
- Gross Profit = revenue × margin%
- Net Profit = gross profit - fixed costs
- Break-even = fixed costs ÷ (price × margin%)

## Development Notes

- All calculations happen client-side for performance
- AI integration extracts business parameters from natural language descriptions
- Currency detection based on user locale
- Forms use controlled components with immediate calculation updates
- No backend persistence - uses localStorage for session data

## Styling Conventions

- Tailwind utility classes throughout
- Consistent spacing with space-y-* and gap-*
- Form inputs: `rounded border p-2 text-sm`
- Buttons: `rounded bg-black px-3 py-1.5 text-white text-sm hover:bg-gray-800`
- run the build after completing the task