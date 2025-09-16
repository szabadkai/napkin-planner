# Repository Guidelines

## Project Structure & Module Organization
- Root: configuration and docs. Notable files: `system_prompt.md`, `.env.local`, `.env.local.example`.
- Recommended layout as the codebase grows:
  - `src/`: application code (modules by feature or domain).
  - `tests/`: mirrors `src/` structure for unit/integration tests.
  - `assets/` or `public/`: static files if needed.
- Keep prompts/specs in `docs/` or alongside code with clear names.

## Build, Test, and Development Commands
- Environment: copy example env to local before running anything.
  - `cp .env.local.example .env.local`
- No project-specific scripts are defined yet. Suggested patterns to adopt:
  - Build: `make build` or `npm run build` (compile/bundle if applicable).
  - Test: `pytest -q` (Python) or `npm test`/`vitest run` (Node) once configured.
  - Run: `python -m src.main` or `node src/index.js` depending on stack.

## Coding Style & Naming Conventions
- Indentation: 2 spaces (JS/TS) or 4 spaces (Python). Be consistent within a language.
- Naming: `snake_case` for files in Python, `kebab-case` for web assets, `PascalCase` for classes, `camelCase` for functions/vars.
- Formatting: adopt a formatter per language (e.g., Black for Python, Prettier for JS/TS) and run before committing.

## Testing Guidelines
- Place tests under `tests/` mirroring `src/` paths.
- Names: `test_*.py` (pytest) or `*.spec.ts`/`*.test.ts` (JS/TS).
- Aim for meaningful unit tests; add integration tests for key flows. Target 80%+ coverage once frameworks are in place.

## Commit & Pull Request Guidelines
- Current history is minimal and unconstrained. Prefer Conventional Commits:
  - Example: `feat(planner): add task grouping rules`.
- Commits: small, scoped, with clear body explaining why.
- PRs: include purpose, summary of changes, screenshots or logs if UI/CLI, and linked issues. Add testing notes and any config changes (`.env` keys, migrations).

## Security & Configuration Tips
- Do not commit secrets. Keep local secrets in `.env.local` (already git-ignored). Update `.env.local.example` when adding new required keys.
- Validate inputs and avoid logging sensitive data.
