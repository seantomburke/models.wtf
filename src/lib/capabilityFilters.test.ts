import { describe, it, expect } from 'vitest'
import { hasCapability, filterByCapabilities, capabilityOptions } from './capabilityFilters'
import { models as realModels } from '../data/index.ts'
import type { Model } from '../data/types.ts'

const mockModel = (overrides?: Partial<Model>): Model => ({
  id: 'test-model',
  name: 'Test Model',
  providerId: 'anthropic',
  tier: 'flagship',
  openSource: false,
  inputPricePerMTok: 5,
  outputPricePerMTok: 15,
  contextWindowTokens: 1_000_000,
  reasoning: true,
  internetAccess: true,
  scores: {},
  blurb: 'A test model',
  ...overrides,
})

describe('capabilityFilters', () => {
  it('exports capability options', () => {
    expect(capabilityOptions.length).toBe(3)
    expect(capabilityOptions[0].id).toBe('reasoning')
  })

  describe('hasCapability', () => {
    it('detects reasoning capability', () => {
      const model = mockModel({ reasoning: true })
      expect(hasCapability(model, 'reasoning')).toBe(true)

      const noReasoning = mockModel({ reasoning: false })
      expect(hasCapability(noReasoning, 'reasoning')).toBe(false)
    })

    it('detects vision capability', () => {
      const model = mockModel({ vision: true })
      expect(hasCapability(model, 'vision')).toBe(true)

      const noVision = mockModel({ vision: false })
      expect(hasCapability(noVision, 'vision')).toBe(false)

      const undefinedVision = mockModel({ vision: undefined })
      expect(hasCapability(undefinedVision, 'vision')).toBe(false)
    })

    it('detects web-search capability from internetAccess', () => {
      const model = mockModel({ internetAccess: true })
      expect(hasCapability(model, 'web-search')).toBe(true)

      const noInternet = mockModel({ internetAccess: false })
      expect(hasCapability(noInternet, 'web-search')).toBe(false)
    })

    it('detects image-generation capability', () => {
      const model = mockModel({ imageGeneration: true })
      expect(hasCapability(model, 'image-generation')).toBe(true)

      const noImageGen = mockModel({ imageGeneration: false })
      expect(hasCapability(noImageGen, 'image-generation')).toBe(false)
    })
  })

  describe('filterByCapabilities', () => {
    const models = [
      mockModel({
        id: 'reasoning-only',
        reasoning: true,
        internetAccess: false,
        vision: false,
      }),
      mockModel({
        id: 'web-search-only',
        reasoning: false,
        internetAccess: true,
        vision: false,
      }),
      mockModel({
        id: 'all-capabilities',
        reasoning: true,
        internetAccess: true,
        vision: true,
        imageGeneration: true,
      }),
      mockModel({
        id: 'basic-model',
        reasoning: false,
        internetAccess: false,
        vision: false,
      }),
    ]

    it('returns all models when no filters applied', () => {
      const filtered = filterByCapabilities(models, new Set())
      expect(filtered).toHaveLength(4)
    })

    it('filters by single capability', () => {
      const filtered = filterByCapabilities(models, new Set(['reasoning']))
      expect(filtered).toHaveLength(2) // reasoning-only and all-capabilities
      expect(filtered.map((m) => m.id)).toContain('reasoning-only')
      expect(filtered.map((m) => m.id)).toContain('all-capabilities')
    })

    it('filters by web-search capability', () => {
      const filtered = filterByCapabilities(models, new Set(['web-search']))
      expect(filtered).toHaveLength(2) // web-search-only and all-capabilities
    })

    it('filters by multiple capabilities (AND logic)', () => {
      const filtered = filterByCapabilities(models, new Set(['reasoning', 'vision']))
      expect(filtered).toHaveLength(1) // only all-capabilities has both
      expect(filtered[0].id).toBe('all-capabilities')
    })

    it('returns empty array when no models match', () => {
      // No mock pairs web search with image generation.
      const noMatch = filterByCapabilities(
        models.filter((m) => m.id !== 'all-capabilities'),
        new Set(['image-generation']),
      )
      expect(noMatch).toHaveLength(0)
    })
  })

  // Regression guard. Every filter chip on /compare must be satisfiable by the
  // real dataset — a chip no model matches silently empties the table. This is
  // the check that would have caught `vision`/`imageGeneration` going unset on
  // all 19 models. Deliberately imports the real data, not mocks.
  describe('capability options against the real dataset', () => {
    it.each(capabilityOptions.map((o) => o.id))('at least one real model has %s', (id) => {
      const matching = realModels.filter((model) => hasCapability(model, id))
      expect(matching.length).toBeGreaterThan(0)
    })

    it('offers no filter that would empty the comparison table', () => {
      const dead = capabilityOptions
        .filter((option) => !realModels.some((model) => hasCapability(model, option.id)))
        .map((option) => option.id)
      expect(dead).toEqual([])
    })
  })
})
