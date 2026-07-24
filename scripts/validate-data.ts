/**
 * Sanity-checks the static data layer. Runs in CI and after every refresh:
 *   npm run validate
 *
 * TypeScript already enforces the schema shape; this catches what types
 * can't: broken references, duplicates, and implausible values.
 */
import { benchmarks, models, providers, releases, dataSourcedAt } from '../src/data/index.ts'

const errors: string[] = []
const fail = (msg: string) => errors.push(msg)

/**
 * Most benchmarks are percentages, so a value outside 0-100 means a typo or a
 * misread column. Rating-style benchmarks (`unit: 'points'`, such as GDPval-AA,
 * an Elo with a human expert anchored at 1000) are not percentages, so they get
 * a range wide enough to catch nonsense without rejecting a legitimate rating.
 */
const unitByBenchmark = new Map(benchmarks.map((b) => [b.id as string, b.unit]))
const scoreRange = (bench: string): [number, number] =>
  unitByBenchmark.get(bench) === 'points' ? [0, 3000] : [0, 100]

// ─── Referential integrity ─────────────────────────────────────
const providerIds = new Set(providers.map((p) => p.id))
const benchmarkIds = new Set(benchmarks.map((b) => b.id))

for (const m of models) {
  if (!providerIds.has(m.providerId)) {
    fail(`${m.id}: unknown provider "${m.providerId}"`)
  }
  for (const key of Object.keys(m.scores)) {
    if (!benchmarkIds.has(key as never)) {
      fail(`${m.id}: score for unknown benchmark "${key}"`)
    }
  }
  for (const [bench, prov] of Object.entries(m.scoreProvenance ?? {})) {
    if (!(bench in m.scores)) {
      fail(`${m.id}: provenance for "${bench}" but no score`)
    }
    if (prov.source === 'independent') {
      if (!prov.runner) fail(`${m.id}: independent ${bench} score missing runner`)
      if (prov.independentScore !== undefined) {
        fail(`${m.id}: ${bench} is already independent; independentScore is for provider-reported scores`)
      }
    }
    if (prov.independentScore !== undefined) {
      const [lo, hi] = scoreRange(bench)
      if (prov.independentScore < lo || prov.independentScore > hi) {
        fail(`${m.id}: ${bench} independentScore ${prov.independentScore} out of ${lo}-${hi} range`)
      }
      if (!prov.independentRunner) {
        fail(`${m.id}: ${bench} independentScore missing independentRunner`)
      }
    }
  }
}

// ─── Releases ──────────────────────────────────────────────────
const modelIds = new Set(models.map((m) => m.id))
for (const r of releases) {
  if (r.modelId && !modelIds.has(r.modelId)) {
    fail(`release "${r.id}": unknown model "${r.modelId}"`)
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(r.date)) fail(`release "${r.id}": bad date "${r.date}"`)
  // A launch announcement must agree with the catalog's release date.
  if (r.type === 'new' && r.modelId) {
    const m = models.find((model) => model.id === r.modelId)
    if (m?.releaseDate && m.releaseDate !== r.date) {
      fail(`release "${r.id}": dated ${r.date} but ${r.modelId} released ${m.releaseDate}`)
    }
  }
}

// ─── Uniqueness ────────────────────────────────────────────────
for (const [label, ids] of [
  ['model', models.map((m) => m.id)],
  ['provider', providers.map((p) => p.id)],
  ['benchmark', benchmarks.map((b) => b.id)],
  ['release', releases.map((r) => r.id)],
] as const) {
  const seen = new Set<string>()
  for (const id of ids) {
    if (seen.has(id)) fail(`duplicate ${label} id "${id}"`)
    seen.add(id)
  }
}

// ─── Value sanity ──────────────────────────────────────────────
for (const m of models) {
  for (const [bench, score] of Object.entries(m.scores)) {
    const [lo, hi] = scoreRange(bench)
    if (score < lo || score > hi) fail(`${m.id}: ${bench} score ${score} out of ${lo}-${hi} range`)
  }
  if (m.inputPricePerMTok !== null && m.inputPricePerMTok <= 0) {
    fail(`${m.id}: non-positive input price`)
  }
  if (m.outputPricePerMTok !== null && m.outputPricePerMTok <= 0) {
    fail(`${m.id}: non-positive output price`)
  }
  // Open-weight models are priced null (self-hosted); closed models must have prices.
  if (!m.openSource && (m.inputPricePerMTok === null || m.outputPricePerMTok === null)) {
    fail(`${m.id}: closed model missing pricing`)
  }
  if (m.openSource && !m.license) fail(`${m.id}: open-source model missing license`)
  if (m.contextWindowTokens !== null && m.contextWindowTokens < 1000) {
    fail(`${m.id}: implausible context window ${m.contextWindowTokens}`)
  }
  if (!m.blurb || m.blurb.length < 20) fail(`${m.id}: blurb missing or too short`)
}

// ─── Coverage ──────────────────────────────────────────────────
if (models.length < 10) fail(`only ${models.length} models; expected the full lineup`)
if (!models.some((m) => m.openSource)) fail('no open-source models in dataset')
for (const b of benchmarks) {
  if (!models.some((m) => b.id in m.scores)) {
    fail(`benchmark "${b.id}" has no scores from any model`)
  }
}
if (!/^\d{4}-\d{2}-\d{2}$/.test(dataSourcedAt)) fail(`bad dataSourcedAt "${dataSourcedAt}"`)

// ─── Report ────────────────────────────────────────────────────
if (errors.length > 0) {
  console.error(`✗ data validation failed (${errors.length} error${errors.length > 1 ? 's' : ''}):`)
  for (const e of errors) console.error(`  - ${e}`)
  process.exit(1)
}
console.log(
  `✓ data valid: ${models.length} models, ${providers.length} providers, ${benchmarks.length} benchmarks, ${releases.length} releases (sourced ${dataSourcedAt})`,
)
