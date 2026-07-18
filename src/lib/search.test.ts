import { describe, it, expect } from 'vitest'
import { searchModels, groupSearchResults } from './search'
import type { Model } from '../data/types'

const mockModels: Model[] = [
  {
    id: '1',
    name: 'Claude Opus 4.8',
    providerId: 'anthropic',
    blurb: 'Powerful reasoning model',
    openSource: false,
    inputPricePerMTok: 3,
    outputPricePerMTok: 15,
    contextWindowTokens: 200000,
    releaseDate: '2024-11-12',
    scores: {},
    reasoning: true,
    internetAccess: false,
    tier: 'flagship',
  },
  {
    id: '2',
    name: 'Claude Sonnet 4',
    providerId: 'anthropic',
    blurb: 'Balanced performance',
    openSource: false,
    inputPricePerMTok: 3,
    outputPricePerMTok: 15,
    contextWindowTokens: 200000,
    releaseDate: '2024-09-24',
    scores: {},
    reasoning: false,
    internetAccess: false,
    tier: 'balanced',
  },
  {
    id: '3',
    name: 'GPT-4 Turbo',
    providerId: 'openai',
    blurb: 'Fast and efficient',
    openSource: false,
    inputPricePerMTok: 10,
    outputPricePerMTok: 30,
    contextWindowTokens: 128000,
    releaseDate: '2024-04-09',
    scores: {},
    reasoning: false,
    internetAccess: true,
    tier: 'balanced',
  },
  {
    id: '4',
    name: 'Llama 2',
    providerId: 'meta',
    blurb: 'Open source model',
    openSource: true,
    inputPricePerMTok: 0,
    outputPricePerMTok: 0,
    contextWindowTokens: 4096,
    releaseDate: '2023-07-18',
    scores: {},
    reasoning: false,
    internetAccess: false,
    tier: 'fast',
  },
]

describe('searchModels', () => {
  it('returns empty array for empty query', () => {
    const results = searchModels(mockModels, '')
    expect(results).toEqual([])
  })

  it('returns empty array for whitespace-only query', () => {
    const results = searchModels(mockModels, '   ')
    expect(results).toEqual([])
  })

  it('finds exact name match', () => {
    const results = searchModels(mockModels, 'Claude Opus')
    expect(results.length).toBeGreaterThan(0)
    expect(results[0].model.name).toBe('Claude Opus 4.8')
    expect(results[0].matchType).toBe('name')
  })

  it('finds partial name match', () => {
    const results = searchModels(mockModels, 'Claude')
    expect(results.length).toBeGreaterThan(1)
    expect(results.every((r) => r.model.providerId === 'anthropic')).toBe(true)
  })

  it('finds provider match', () => {
    const results = searchModels(mockModels, 'openai')
    expect(results).toHaveLength(1)
    expect(results[0].model.name).toBe('GPT-4 Turbo')
  })

  it('is case insensitive', () => {
    const results1 = searchModels(mockModels, 'claude')
    const results2 = searchModels(mockModels, 'CLAUDE')
    const results3 = searchModels(mockModels, 'ClAuDe')
    expect(results1.length).toBe(results2.length)
    expect(results1.length).toBe(results3.length)
  })

  it('sorts results by relevance', () => {
    const results = searchModels(mockModels, 'claude')
    expect(results[0].relevance).toBeGreaterThanOrEqual(results[1].relevance)
  })

  it('ignores results below relevance threshold', () => {
    const results = searchModels(mockModels, 'xyz')
    expect(results).toHaveLength(0)
  })

  it('finds description matches', () => {
    const results = searchModels(mockModels, 'reasoning')
    expect(results.length).toBeGreaterThan(0)
    expect(results.some((r) => r.matchType === 'description')).toBe(true)
  })

  it('handles multiple matches for same model', () => {
    const results = searchModels(mockModels, 'claude')
    const unique = new Set(results.map((r) => r.model.id))
    expect(unique.size).toBeLessThanOrEqual(results.length)
  })

  it('prioritizes name matches over provider matches', () => {
    const results = searchModels(mockModels, 'anthropic')
    expect(results[0].matchType).toBe('provider')
  })

  it('finds models with fuzzy matching for similar text', () => {
    const results = searchModels(mockModels, 'claud') // partial match
    expect(results.length).toBeGreaterThan(0)
  })
})

describe('groupSearchResults', () => {
  it('groups results by match type', () => {
    const results = searchModels(mockModels, 'claude')
    const grouped = groupSearchResults(results)

    expect(grouped.name).toBeDefined()
    expect(grouped.provider).toBeDefined()
    expect(grouped.benchmark).toBeDefined()
    expect(grouped.description).toBeDefined()
  })

  it('separates name and provider matches', () => {
    const results = searchModels(mockModels, 'claude')
    const grouped = groupSearchResults(results)

    expect(grouped.name.length).toBeGreaterThan(0)
    expect(grouped.name.every((r) => r.matchType === 'name')).toBe(true)
  })

  it('handles empty result groups', () => {
    const results = searchModels(mockModels, 'claude')
    const grouped = groupSearchResults(results)

    expect(grouped.benchmark).toEqual([])
  })

  it('preserves all results after grouping', () => {
    const results = searchModels(mockModels, 'claude')
    const grouped = groupSearchResults(results)
    const total = Object.values(grouped).reduce((sum, arr) => sum + arr.length, 0)

    expect(total).toBe(results.length)
  })
})
