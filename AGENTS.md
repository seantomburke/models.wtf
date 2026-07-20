# Models.fyi

An educational website that simplifies AI model selection for non-experts. Tracks flagship models from OpenAI, Anthropic, Google, xAI, and others, compares them across benchmarks, and guides users to the right model for their task via interactive graphs and decision flows.

See `docs/initial-plan.md` for the full product vision and requirements.

## Stack

- Vite + React + TypeScript
- Tailwind CSS
- Static/hardcoded data initially (a database comes later)
- Graphs via [openchart](https://github.com/tryopendata/openchart)
- Deployed to GitHub Pages

## Quick Commands

```bash
npm run dev       # Start the dev server
npm run build     # Production build
npm run preview   # Preview the production build
npm test          # Run tests (vitest)
npm run lint      # Lint
```

## Prerequisites

- Node.js and npm

## Agent Setup

This repo is agent-agnostic. Guidance lives in `AGENTS.md` files, not in any one agent's config format:

- This file holds repo-wide guidance; `src/AGENTS.md` adds frontend rules (React, error handling, testing) for work under `src/`.
- Reusable skills live in `.agents/skills/<name>/SKILL.md`. When a task matches a skill listed below, read its `SKILL.md` and follow it.
- Reusable agent roles live in `.agents/agents/`. Vendor-specific definitions must be thin adapters that point to these canonical instructions rather than copying them.
- Agent-specific discovery, permissions, and plugin config stays in that agent's folder. Don't put project guidance there.
- Describe required capabilities (read, edit, search, run, monitor) instead of naming vendor-specific tools in shared guidance.
- Run `npm run check:agents` after changing agent guidance, skills, or adapters.

| Skill | Use when |
|-------|----------|
| `.agents/skills/writing-tests/` | Writing tests, choosing test types |
| `.agents/skills/fixing-flaky-tests/` | Tests pass alone but fail in the suite, or fail intermittently |
| `.agents/skills/handling-errors/` | Designing try/catch, error propagation, Result patterns |
| `.agents/skills/systematic-debugging/` | Investigating bugs, errors, unexpected behavior |
| `.agents/skills/design/` | Building data-heavy or dashboard-style UI |

## Debugging

When investigating bugs or unexpected behavior, follow `.agents/skills/systematic-debugging/SKILL.md`.

Four-phase approach:
1. Reproduce the issue
2. Trace the code path
3. Identify root cause
4. Verify the fix

## Conventions

- SEO is a first-class requirement: semantic HTML, meta tags, and accessible markup on every page.
- Keep the stack light. The initial plan (`docs/initial-plan.md`) explicitly avoids heavy frameworks — prefer simple, composable components.
- Model and benchmark data are hardcoded for now. Isolate data behind a typed module so migrating to a database later is a contained change.

## Deployment

- Always push finished work to `main` — every push to main triggers the GitHub Actions deploy to GitHub Pages. Don't leave completed work sitting on feature branches.
- Monitor the deploy asynchronously using the agent's available background-job capability; don't occupy the foreground with continuous polling.
- After the deploy succeeds, verify the change on the live site, then close the GitHub issue.
