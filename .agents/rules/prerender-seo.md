# Prerender and SEO

Every route is prerendered at build time by `scripts/prerender.mjs`. SEO artifacts (meta tags, OG images, sitemap, feed) all derive from `src/lib/routeMeta.ts`.

## Head tag injection

- The prerenderer INJECTS head tags and its guard asserts they exist in the output. Never regex-substitute existing tags; substitution fails silently when the source drifts.
- Vite keeps `index.html`'s meta description (it only reformats it). The prerenderer must strip it before injecting the per-route one, or every page ships two. When auditing, count tags per file in `dist/`; do not trust the first regex match.
- Prerender guards must DECODE HTML entities before comparing expected strings.
- Audit `dist/` HTML files, never the live client-rendered DOM.

## Suspense and hidden content

- A Suspense boundary rendering under SSR can make pages prerender as a loading shell. Layout uses `ClientSuspense`; `prerender.mjs` guards it.
- Collapsed content must stay mounted or it disappears from prerendered HTML (the FAQ accordion once prerendered 23 questions and 0 answers). Clip with max-height plus `inert`.
- React 19 coerces `hidden="until-found"` to plain `hidden` (display:none, kills find-in-page). Use a max-height clip instead.
- Prerender runs without a browser: no `window` access at module scope in anything routeMeta or a prerendered page imports at the top level.

## Derived artifacts

- Every route gets a unique build-time OG PNG. `ogImageKey` is the shared key function; the generator fails the build on drift. Fonts are committed, never fetched.
- The sitemap is rebuilt from routeMeta and copied to `public/`. Adding a route or Learn topic requires a sitemap rebuild.
- `/feed.xml` is generated from `releases.ts` via the entry-server; the autodiscovery link is guarded by prerender.
- The link checker in CI guards against dead internal links.
