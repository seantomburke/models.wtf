import { describe, it, expect } from 'vitest'
import { provenanceFor } from './scoreProvenance'
import { models } from '../data/models'
import type { Model } from '../data/types'

const baseModel: Model = {
  id: 'test-model',
  name: 'Test Model',
  providerId: 'openai',
  tier: 'flagship',
  openSource: false,
  inputPricePerMTok: 1,
  outputPricePerMTok: 5,
  contextWindowTokens: 100_000,
  reasoning: true,
  internetAccess: false,
  scores: { 'terminal-bench': 84.7 },
  blurb: 'A test model for provenance tests.',
}

describe('provenanceFor', () => {
  it('defaults to provider-reported when no provenance entry exists', () => {
    const result = provenanceFor(baseModel, 'terminal-bench')
    expect(result.kind).toBe('provider')
    expect(result.detail).toBe('Provider-reported; no independent run recorded yet.')
  })

  it('labels independent runs with their runner', () => {
    const model: Model = {
      ...baseModel,
      scoreProvenance: { 'terminal-bench': { source: 'independent', runner: 'vals.ai' } },
    }
    const result = provenanceFor(model, 'terminal-bench')
    expect(result.kind).toBe('independent')
    expect(result.detail).toBe('Independently measured by vals.ai.')
  })

  it('surfaces diverging independent runs of provider-reported scores', () => {
    const model: Model = {
      ...baseModel,
      scoreProvenance: {
        'terminal-bench': {
          source: 'provider',
          independentScore: 75.7,
          independentRunner: 'tbench.ai (Codex)',
        },
      },
    }
    const result = provenanceFor(model, 'terminal-bench')
    expect(result.kind).toBe('provider-diverging')
    expect(result.detail).toBe(
      'Provider-reported; an independent run by tbench.ai (Codex) lands at 75.7%.',
    )
  })

  it('marks equal independent runs as reproduced', () => {
    const model: Model = {
      ...baseModel,
      scoreProvenance: {
        'terminal-bench': {
          source: 'provider',
          independentScore: 84.7,
          independentRunner: 'NIST CAISI',
        },
      },
    }
    const result = provenanceFor(model, 'terminal-bench')
    expect(result.kind).toBe('provider-reproduced')
    expect(result.detail).toBe(
      'Provider-reported and independently reproduced by NIST CAISI.',
    )
  })

  it('every dataset provenance entry has a matching score', () => {
    for (const m of models) {
      for (const bench of Object.keys(m.scoreProvenance ?? {})) {
        expect(m.scores, `${m.id} ${bench}`).toHaveProperty(bench)
      }
    }
  })

  it('the dataset flags known provider-vs-independent divergences', () => {
    const luna = models.find((m) => m.id === 'gpt-5-6-luna')!
    expect(provenanceFor(luna, 'terminal-bench').kind).toBe('provider-diverging')

    const deepseek = models.find((m) => m.id === 'deepseek-v4-pro')!
    expect(provenanceFor(deepseek, 'gpqa-diamond').kind).toBe('provider-reproduced')
  })
})
