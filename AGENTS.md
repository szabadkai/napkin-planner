# Repository Guidelines

## Project Structure & Module Organization
- Root docs: `PRD.md` (product requirements) and `tech_specs.md` (technical design).
- Environment files: `.env.local.example` (template) → copy to `.env.local` for local secrets.
- Git-only repo today (no `src/` yet). If code is added, use `src/` for app code, `docs/` for extended documentation, and `tests/` for automated tests.

## Build, Test, and Development Commands
- Docs-only at present: no build step required.
- Optional linting (recommended):
  - `npx markdownlint .` — lint Markdown files.
  - `npx prettier --check .` — verify formatting.
  - `npx prettier --write .` — format in place.
  If you use these tools, include config in the repo before enforcing.

## Coding Style & Naming Conventions
- Markdown: wrap at ~100 chars, use ATX headings (`#`, `##`), and sentence‑case headings.
- Files: kebab-case for docs (e.g., `design-notes.md`).
- Lists: prefer `-` for bullets; keep lines concise.
- Code (when added): 2‑space indentation, descriptive names, and small, focused modules under `src/`.
- Tools (optional): Prettier for Markdown and code; EditorConfig for basic whitespace.

## Testing Guidelines
- No framework in use yet. When code is introduced:
  - Place tests in `tests/` mirroring `src/` paths.
  - Name tests `*.test.[js|ts|py|rs]` as applicable.
  - Aim for meaningful coverage on core logic; avoid brittle UI tests.
  - Run tests in CI before merging.

## Commit & Pull Request Guidelines
- Commits: follow Conventional Commits, e.g., `feat: add roadmap section` or `docs: clarify env setup`.
- Branches: `feat/<short-name>`, `fix/<short-name>`, `docs/<short-name>`.
- PRs: include purpose, scope, linked issues, and screenshots for UX/docs changes. Keep PRs small and focused.

## Security & Configuration Tips
- Never commit real secrets. Use `.env.local` locally and update `.env.local.example` with non‑secret keys.
- Remove credentials from crash logs or screenshots.
- If adding dependencies, prefer vetted, maintained packages and pin versions.
