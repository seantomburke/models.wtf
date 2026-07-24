import { describe, it, expect } from 'vitest'
import { readFileSync, existsSync, readdirSync } from 'node:fs'

/**
 * Guards the *built* output, not the source: web-vitals must ship in its own
 * lazy chunk and stay out of the entry bundle. The entry has <1 kB of headroom
 * against its budget, so a stray top-level import here is a real regression.
 *
 * Skips when dist/ is absent so `npm test` works without a prior build.
 */
const dist = 'dist/assets'
const built = existsSync(dist) ? readdirSync(dist) : []
// Two chunks match `web-vitals-*`: the library itself and our own module that
// wraps it. Pick the library, the one that *exports* the reporters (our wrapper
// merely mentions them in its code).
const chunk = built.find(
  (f) =>
    /^web-vitals-.*\.js$/.test(f) &&
    /export\{[^}]*\bas onLCP\b/.test(readFileSync(`${dist}/${f}`, 'utf8')),
)
const entry = built.find((f) => /^index-.*\.js$/.test(f))

describe.runIf(chunk && entry)('built web-vitals chunk', () => {
  it('is code-split into its own chunk', () => {
    expect(chunk).toBeDefined()
  })

  it('keeps PerformanceObserver machinery out of the entry bundle', () => {
    const entrySrc = readFileSync(`${dist}/${entry}`, 'utf8')
    for (const probe of ['largest-contentful-paint', 'layout-shift', 'first-input', 'PerformanceObserver']) {
      expect(entrySrc, `"${probe}" leaked into the entry bundle`).not.toContain(probe)
    }
  })

  it('loads the chunk via a dynamic import from the entry', () => {
    const entrySrc = readFileSync(`${dist}/${entry}`, 'utf8')
    expect(entrySrc).toMatch(/import\([`'"][^`'"]*web-vitals-[^`'"]*[`'"]\)/)
  })

  it('does not modulepreload web-vitals onto the critical path', () => {
    expect(readFileSync('dist/index.html', 'utf8')).not.toContain('web-vitals')
  })

  it('does not drag analytics onto the critical path', () => {
    // Importing analytics.ts dynamically from startWebVitals.ts made the
    // bundler split it into a shared chunk that got modulepreloaded, defeating
    // the deferred-loading design in analytics.ts. Keep that import static.
    expect(readFileSync('dist/index.html', 'utf8')).not.toMatch(/modulepreload[^>]*analytics-/)
  })

  it('ships all five reporters and observes the expected entry types', () => {
    const chunkSrc = readFileSync(`${dist}/${chunk}`, 'utf8')

    // The bundler mangles local names but keeps the export bindings, so assert
    // against the export statement rather than importing the file: loading it
    // here goes through Vite, which re-resolves it to the entry chunk.
    const exported = chunkSrc.match(/export\{([^}]*\bas onLCP\b[^}]*)\}/)?.[1] ?? ''
    for (const reporter of ['onCLS', 'onFCP', 'onINP', 'onLCP', 'onTTFB']) {
      expect(exported, `${reporter} missing from the built chunk`).toContain(reporter)
    }

    for (const entryType of ['largest-contentful-paint', 'layout-shift', 'paint', 'event']) {
      expect(chunkSrc, `${entryType} observer missing`).toContain(entryType)
    }
  })
})
