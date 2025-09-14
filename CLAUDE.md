# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

**Working Directory**: All commands should be run from `napkin-next/`

- **Development server**: `npm run dev` (runs on port 3000)
- **Build**: `npm run build`
- **Production server**: `npm start`
- **Linting**: `npm run lint`

## Architecture Overview

This is a Next.js application that generates napkin business plans using Google's Gemini AI models.

### Core Structure

- **Frontend**: Single-page React application at `app/page.tsx` with Tailwind CSS
- **API Layer**: Two main endpoints in `app/api/`:
  - `/api/research` - Analyzes business ideas and extracts parameters
  - `/api/plan` - Generates napkin business plans from parameters
- **AI Integration**: `lib/gemini.ts` handles all Gemini API calls via REST
- **Business Logic**: 
  - `lib/prompts.ts` contains prompt templates
  - `components/QuickMath.tsx` calculates break-even analysis
  - `components/ScenarioCard.tsx` manages individual planning scenarios

### Key Features

- **Research → Parameters**: AI extracts structured parameters from business ideas
- **Quick Math**: Break-even calculation (fixed costs / (price × margin))
- **Scenario Duplication**: Compare multiple variations of the same business idea
- **Parameter Editing**: Modify AI-extracted parameters before plan generation

### Configuration

Environment variables (set in `.env.local`):
- `GEMINI_API_KEY` - Required for AI functionality
- `RESEARCH_MODEL` - Model for parameter extraction (default: gemini-1.5-flash)
- `PLAN_MODEL` - Model for plan generation (default: gemini-1.5-flash)

### Data Flow

1. User enters business idea → `/api/research` extracts parameters
2. User can edit parameters and run Quick Math
3. User duplicates scenarios to compare variations
4. `/api/plan` generates napkin business plans using template system

The app uses TypeScript throughout with strict mode enabled and path aliases (`@/*` maps to root directory).