# Workflow

## Before committing

Run all of these and fix failures before claiming completion:

```bash
npm run check:agents   # Agent config consistency
npx tsc --noEmit       # Types
npm test               # Vitest suite (includes prose and copy-style guards)
npm run build          # Prerender guard, bundle budget, OG drift, link check
```

- No prettier in this repo. oxlint only, single quotes, no semicolons. Never run prettier here.
- New page state goes through a `*UrlState.ts` module with `replace: true` (see `compareUrlState.ts`, `searchUrlState.ts`).

## Auditing

- Fetch, rebase, `npm install`, and clean rebuild before auditing anything. `dist/` is gitignored and lies about the current tree.

## Deployment

- Push finished work to `main`. Every push to main triggers the GitHub Actions deploy to GitHub Pages. Do not leave completed work on feature branches.
- Monitor the deploy asynchronously with a background job capability; do not poll in the foreground.
- The live site is `https://seantomburke.github.io/models.fyi` (a GitHub Pages subpath, no custom domain).
- After deploy succeeds, verify the change on the live site, then close the GitHub issue.

## Repo hygiene

- Session reports, audits, and plans never land in the repo root. Put them in `docs/archive/` if they must be kept at all.
- Parallel workers sharing a worktree cross-commit each other's files. Verify `git commit --stat` against what each worker reports done.
