# Agent Memory

The repo is the persistent memory for every agent that works on it, regardless of vendor. Do not store durable project knowledge in agent-private locations (Claude memory dirs, Cursor notes, and the like). Write it here so every LLM benefits.

## When to write

Record a fact when it is durable, non-obvious, and would change how a future agent acts: a gotcha, an invariant, a workflow constraint, a dead end that should not be re-explored.

Do not record what the code, tests, or git history already express. If a guard test enforces the fact, reference the guard instead of restating it.

## Where to write

- Area-specific facts: the nearest nested `AGENTS.md` (`src/AGENTS.md`, `src/data/AGENTS.md`, `src/pages/learn/AGENTS.md`, `scripts/AGENTS.md`). Create a new nested file only when an area accumulates several facts.
- Cross-cutting facts: the matching file in `.agents/rules/` (writing-style, performance-budget, prerender-seo, frontend-gotchas, workflow). Create a new rule file only for a genuinely new topic, and index it in the root `AGENTS.md` Rules table.
- Run `npm run check:agents` after any change to guidance files.

## How to write

- One short paragraph or bullet per fact: state the trap, then the correct move.
- Convert relative dates ("last week") to absolute dates.
- Terse and technical. Site copy voice rules do not apply to agent docs.
- No em dashes (the repo-wide ban covers these files too).
- Delete or correct entries that turn out to be wrong. Stale memory is worse than none.
