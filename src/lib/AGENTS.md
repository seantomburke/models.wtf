# Lib Guidance (src/lib/)

Extends the root `AGENTS.md` and `src/AGENTS.md`.

- `routeMeta.ts` ships on every route. Nothing heavy at top level; see `.agents/rules/performance-budget.md`. It drives prerender, sitemap, OG images, and JSON-LD; see `.agents/rules/prerender-seo.md`.
- Page titles use the pipe separator (`Page name | Models.wtf`). The JSON-LD name fields strip that suffix; keep the strip regex in sync with the separator.
- Shareable page state goes through a `*UrlState.ts` module with `replace: true` (see `compareUrlState.ts`, `searchUrlState.ts`).
- Keep content corpora imports out of `search.ts`; `contentSearch.ts` owns lazy corpus loading, or `/compare` preloads every corpus.
- Chart gotchas (openchart quirks, `axisScale()`) are in `.agents/rules/frontend-gotchas.md`.
- Glossary terms stay out of the sitemap; Learn topics go in.
