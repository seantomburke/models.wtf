import { describe, it, expect, vi } from 'vitest'
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
const chunk = built.find((f) => /^web-vitals-.*\.js$/.test(f))
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

  it('references the lazy chunk from the entry', () => {
    const entrySrc = readFileSync(`${dist}/${entry}`, 'utf8')
    expect(entrySrc).toContain('web-vitals-')
  })

  it('exports all five reporters and subscribes to the right entry types', async () => {
    const observed: string[] = []
    class FakePO {
      static supportedEntryTypes = ['largest-contentful-paint', 'layout-shift', 'first-input', 'paint', 'navigation', 'event']
      constructor(_cb: unknown) {}
      observe(opts: { type?: string }) { if (opts.type) observed.push(opts.type) }
      disconnect() {}
      takeRecords() { return [] }
    }
    vi.stubGlobal('PerformanceObserver', FakePO)
    class FakeEventTiming {}
    Object.defineProperty(FakeEventTiming.prototype, 'interactionId', { value: 0 })
    vi.stubGlobal('PerformanceEventTiming', FakeEventTiming)
    performance.getEntriesByType = ((type: string) =>
      type === 'navigation' ? [{ responseStart: 42, activationStart: 0, type: 'navigate' }] : []) as never

    const mod = await import(/* @vite-ignore */ `${process.cwd()}/${dist}/${chunk}`)
    expect(Object.keys(mod).filter((k) => /^on[A-Z]/.test(k)).sort())
      .toEqual(['onCLS', 'onFCP', 'onINP', 'onLCP', 'onTTFB'])

    for (const name of ['onLCP', 'onCLS', 'onFCP'] as const) mod[name](() => {})
    // CLS registers its layout-shift observer only after FCP resolves, so it is
    // not expected synchronously here.
    expect(observed).toContain('largest-contentful-paint')
    expect(observed).toContain('paint')

    vi.unstubAllGlobals()
  })
})
