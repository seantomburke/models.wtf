# Performance and Bundle Budget

The site is a static SPA with ~62 prerendered routes. Bundle discipline is enforced in the build by `scripts/check-bundle-budget.mjs`. Verify bundle claims against `dist/` output, never against source alone.

## Route and chunk rules

- Every route except Home is loaded with `lazy()`. New pages follow the same pattern (see `src/App.tsx`).
- Nothing heavy may be imported top-level in `src/lib/routeMeta.ts` or `src/pages/learn/topics.ts`. Those modules ship on every route. Prose corpora (FAQ, glossary, releases, Learn prose) load lazily from the owning page.
- Keep content corpora imports out of `src/lib/search.ts`; otherwise `/compare` preloads them. `contentSearch.ts` owns lazy corpus loading.
- Audit `dist/` HTML modulepreloads after adding imports to shared modules.

## Heavy chunk gating

- A dynamic `import()` in a bare `useEffect` still downloads on mount. Gate heavy chunks (tokenizers, KaTeX, big data files) on IntersectionObserver visibility with an always-load fallback for environments without IO.
- A global scroll listener is not visibility gating. Above-the-fold content never scrolls, so it never loads. Use IntersectionObserver.

## Analytics

- Import PostHog only via `@posthog/react/slim` through `src/lib/analytics.ts`. The full entry re-exports posthog-js and re-bloats the bundle.
