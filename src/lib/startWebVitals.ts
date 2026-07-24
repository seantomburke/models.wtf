/**
 * Kick off Core Web Vitals reporting.
 *
 * Deliberately its own module, and deliberately tiny. `main.tsx` is the entry
 * bundle, which runs within ~1 kB of its budget (scripts/check-bundle-budget.mjs),
 * so anything it imports statically is paid for by every visitor on first paint.
 * Importing `web-vitals.ts` from there instead would pull `initWebVitals`, the
 * reporter plumbing, and `captureWebVital` into the entry; behind this dynamic
 * import they all land in the lazy chunk with the library.
 *
 * `analytics.ts` is imported statically on purpose. `main.tsx` already depends
 * on it, so it costs nothing extra here, whereas importing it dynamically makes
 * the bundler split it into a shared chunk that then gets modulepreloaded onto
 * the critical path, which is precisely what that module exists to avoid.
 */
import { getAnalyticsClient } from './analytics.ts'

let started = false

/**
 * Load the reporters and begin sending metrics. Call once, after first paint.
 *
 * Reporting goes through the analytics stub rather than awaiting the PostHog
 * SDK: LCP and FCP settle before the SDK finishes loading, so waiting would
 * drop exactly the metrics worth having. The stub queues them and `analytics.ts`
 * replays the queue once the real client is live.
 *
 * Failure is silent by design. Performance telemetry is never load-bearing, so
 * a blocked or failed chunk must not surface to the visitor.
 */
export function startWebVitals(): void {
  if (started || typeof window === 'undefined') return
  started = true

  void Promise.all([import('web-vitals'), import('./web-vitals.ts')])
    .then(([{ onLCP, onINP, onCLS, onTTFB, onFCP }, { initWebVitals }]) => {
      initWebVitals(getAnalyticsClient(), { onLCP, onINP, onCLS, onTTFB, onFCP })
    })
    .catch(() => {
      // An ad blocker or flaky network shouldn't break the page.
    })
}
