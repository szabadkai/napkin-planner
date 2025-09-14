Napkin Next

- Next.js app with Tailwind
- API routes call Gemini using `GEMINI_API_KEY`
- UI supports research → tweak params → quick math → generate plan
- Duplicate scenarios to compare variations

Quick start

1) Node 18+ and npm
2) Set env vars (or copy `.env.local.example` to `.env.local`):

```
export GEMINI_API_KEY=your_key_here
export RESEARCH_MODEL=gemini-1.5-flash
export PLAN_MODEL=gemini-1.5-flash
```

3) Install and run:

```
cd napkin-next
npm install
npm run dev
```

4) Open http://localhost:3000

Notes

- The research endpoint returns JSON parameters which you can edit.
- Quick Math computes break‑even: fixed / (price × margin).
- All LLM calls go to Gemini via REST; no extra SDK.

