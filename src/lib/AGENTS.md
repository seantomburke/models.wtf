# Lib Guidance (src/lib/)

Extends the root `AGENTS.md` and `src/AGENTS.md`.

- `routeMeta.ts` ships on every route. Nothing heavy at top level; see `.agents/rules/performance-budget.md`. It drives prerender, sitemap, OG images, and JSON-LD; see `.agents/rules/prerender-seo.md`.
- Page titles use the pipe separator (`Page name | Models.wtf`). The JSON-LD name fields strip that suffix; keep the strip regex in sync with the separator.
- Shareable page state goes through a `*UrlState.ts` module with `replace: true` (see `compareUrlState.ts`, `searchUrlState.ts`).
- Keep content corpora imports out of `search.ts`; `contentSearch.ts` owns lazy corpus loading, or `/compare` preloads every corpus.
- Chart gotchas (openchart quirks, `axisScale()`) are in `.agents/rules/frontend-gotchas.md`.
- Glossary terms stay out of the sitemap; Learn topics go in.
- Instrumentation needs a test that it is *called*, not just that it works. `web-vitals.ts` was fully implemented and had 35 passing tests, but nothing ever called `initWebVitals`, so the site reported zero performance data for months while CI stayed green. Unit tests that import a module and call it directly cannot catch a missing caller. `web-vitals.build.test.ts` guards the wiring and the code split against `dist/`.
- `startWebVitals` reports through the analytics stub rather than awaiting the PostHog SDK. LCP and FCP settle before the SDK finishes loading, so waiting drops exactly the metrics worth having; the stub queues and replays them (see `analytics.ts`).
- `web-vitals` must stay a dynamic `import()`, and the starter lives in its own `startWebVitals.ts`. `main.tsx` is the entry bundle, so importing `web-vitals.ts` from it drags `initWebVitals` and `captureWebVital` in too; the separate module keeps all of it in the lazy chunk. The entry runs under 1 kB of headroom against its 140 kB budget, and CI measures ~0.2 kB higher than a local macOS build, so leave real margin rather than landing at 139.9 kB.
- Do not dynamically `import()` a module that `main.tsx` already imports statically. Doing that to `analytics.ts` made the bundler split it into a shared chunk and modulepreload it onto the critical path, defeating the deferred loading that module exists for. The bundle budget does not catch this (total size barely moves); `web-vitals.build.test.ts` asserts against the preload list instead.
