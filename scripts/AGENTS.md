# Build Pipeline Guidance (scripts/)

Extends the root `AGENTS.md`. Everything here runs during `npm run build` or CI.

- `prerender.mjs`, `generate-og-images.mjs`, `generate-sitemap.mjs`, and `generate-feed.mjs` all derive from `src/lib/routeMeta.ts` (feed from `releases.ts`). Change titles or routes there and the artifacts follow. The invariants (inject-then-assert, entity decoding, OG key drift, description stripping) are documented in `.agents/rules/prerender-seo.md`.
- `check-bundle-budget.mjs` fails the build when shared chunks grow past budget. See `.agents/rules/performance-budget.md` before adding imports to shared modules.
- `check-agent-config.mjs` (`npm run check:agents`) keeps vendor adapter files pointed at canonical `.agents/` sources, validates skill and rule references in every `AGENTS.md`, and enforces the repo-wide em dash ban in guidance docs.
- `check-links.mjs` guards against dead internal links in `dist/`.
- `validate-data.ts` validates the data modules.
