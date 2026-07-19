import type { BenchmarkId, Model } from '../data/types.ts'

export type ProvenanceKind =
  | 'independent'
  | 'provider'
  | 'provider-diverging'
  | 'provider-reproduced'

export interface ProvenanceDisplay {
  kind: ProvenanceKind
  /** Short badge text, e.g. "independent run" or "provider-reported". */
  label: string
  /** Full sentence for tooltips and detail rows. */
  detail: string
}

/**
 * Resolves the displayed sourcing for one of a model's benchmark scores.
 * Scores without a scoreProvenance entry are provider-published (the
 * dataset default documented in src/data/models.ts).
 */
export function provenanceFor(model: Model, benchmarkId: BenchmarkId): ProvenanceDisplay {
  const prov = model.scoreProvenance?.[benchmarkId]
  const score = model.scores[benchmarkId]

  if (prov?.source === 'independent') {
    return {
      kind: 'independent',
      label: 'independent run',
      detail: prov.runner
        ? `Independently measured by ${prov.runner}.`
        : 'Independently measured.',
    }
  }

  if (prov?.independentScore !== undefined) {
    if (prov.independentScore === score) {
      return {
        kind: 'provider-reproduced',
        label: 'independently reproduced',
        detail: `Provider-reported and independently reproduced by ${prov.independentRunner}.`,
      }
    }
    return {
      kind: 'provider-diverging',
      label: 'provider-reported',
      detail: `Provider-reported; an independent run by ${prov.independentRunner} lands at ${prov.independentScore}%.`,
    }
  }

  return {
    kind: 'provider',
    label: 'provider-reported',
    detail: 'Provider-reported; no independent run recorded yet.',
  }
}
