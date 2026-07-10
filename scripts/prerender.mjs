/**
 * Prerenders every route in routeMeta to a static HTML file in dist/,
 * so GitHub Pages serves real 200s (issue #15) and crawlers see per-route
 * titles, descriptions, and content.
 *
 * Runs after `vite build` (client) + `vite build --ssr` (server bundle).
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname } from 'node:path'
import { render, routeMeta } from '../dist-server/entry-server.js'

const esc = (s) =>
  s.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;')

const template = readFileSync('dist/index.html', 'utf8')

// 404 fallback for routes we did NOT prerender: keep the EMPTY root so the
// client renders from scratch (no hydration mismatch against wrong content).
writeFileSync('dist/404.html', template)

let count = 0
for (const { path, title, description } of routeMeta) {
  const body = await render(path)
  const out = template
    .replace(/<title>[^<]*<\/title>/, `<title>${esc(title)}</title>`)
    .replace(/(name="description"[\s\S]*?content=")[^"]*(")/, `$1${esc(description)}$2`)
    .replace('<div id="root"></div>', `<div id="root">${body}</div>`)
  if (!out.includes(`<div id="root">${body}</div>`) || !out.includes(esc(title))) {
    throw new Error(`prerender injection failed for ${path}`)
  }
  const file = path === '/' ? 'dist/index.html' : `dist${path}/index.html`
  mkdirSync(dirname(file), { recursive: true })
  writeFileSync(file, out)
  count++
}
console.log(`✓ prerendered ${count} routes (+ empty-root 404.html fallback)`)
