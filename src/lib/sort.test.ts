import { sortModels, toggleSort, type SortConfig } from './sort'
import { models } from '../data/index.ts'

describe('sortModels', () => {
  test('returns unchanged array when column is null', () => {
    const config: SortConfig = { column: null, direction: 'asc' }
    const sorted = sortModels(models, config)
    expect(sorted).toEqual(models)
  })

  test('sorts by model name alphabetically (asc)', () => {
    const config: SortConfig = { column: 'name', direction: 'asc' }
    const sorted = sortModels(models, config)
    for (let i = 1; i < sorted.length; i++) {
      expect(sorted[i].name.toLowerCase() >= sorted[i - 1].name.toLowerCase()).toBe(true)
    }
  })

  test('sorts by model name reverse alphabetically (desc)', () => {
    const config: SortConfig = { column: 'name', direction: 'desc' }
    const sorted = sortModels(models, config)
    for (let i = 1; i < sorted.length; i++) {
      expect(sorted[i].name.toLowerCase() <= sorted[i - 1].name.toLowerCase()).toBe(true)
    }
  })

  test('sorts by input price ascending', () => {
    const config: SortConfig = { column: 'inputPrice', direction: 'asc' }
    const sorted = sortModels(models, config)
    let lastPrice = -Infinity
    for (const m of sorted) {
      if (m.inputPricePerMTok !== null) {
        expect(m.inputPricePerMTok >= lastPrice).toBe(true)
        lastPrice = m.inputPricePerMTok
      }
    }
  })

  test('sorts by output price descending', () => {
    const config: SortConfig = { column: 'outputPrice', direction: 'desc' }
    const sorted = sortModels(models, config)
    let lastPrice = Infinity
    for (const m of sorted) {
      if (m.outputPricePerMTok !== null) {
        expect(m.outputPricePerMTok <= lastPrice).toBe(true)
        lastPrice = m.outputPricePerMTok
      }
    }
  })

  test('sorts by context window ascending', () => {
    const config: SortConfig = { column: 'context', direction: 'asc' }
    const sorted = sortModels(models, config)
    let lastContext = -Infinity
    for (const m of sorted) {
      if (m.contextWindowTokens !== null) {
        expect(m.contextWindowTokens >= lastContext).toBe(true)
        lastContext = m.contextWindowTokens
      }
    }
  })

  test('sorts by benchmark score (asc) and moves undefined to end', () => {
    const config: SortConfig = { column: 'swe-bench-verified', direction: 'asc' }
    const sorted = sortModels(models, config)
    let lastScore = -Infinity
    let seenUndefined = false
    for (const m of sorted) {
      const score = m.scores['swe-bench-verified']
      if (score === undefined) {
        seenUndefined = true
      } else {
        expect(seenUndefined).toBe(false) // No defined scores after undefined
        expect(score >= lastScore).toBe(true)
        lastScore = score
      }
    }
  })

  test('sorts by benchmark score (desc)', () => {
    const config: SortConfig = { column: 'gpqa-diamond', direction: 'desc' }
    const sorted = sortModels(models, config)
    let lastScore = Infinity
    let seenUndefined = false
    for (const m of sorted) {
      const score = m.scores['gpqa-diamond']
      if (score === undefined) {
        seenUndefined = true
      } else {
        expect(seenUndefined).toBe(false)
        expect(score <= lastScore).toBe(true)
        lastScore = score
      }
    }
  })

  test('preserves original array (returns copy)', () => {
    const config: SortConfig = { column: 'name', direction: 'asc' }
    const sorted = sortModels(models, config)
    expect(sorted).not.toBe(models)
  })
})

describe('toggleSort', () => {
  test('toggles direction when same column', () => {
    const current: SortConfig = { column: 'name', direction: 'asc' }
    const toggled = toggleSort(current, 'name')
    expect(toggled).toEqual({ column: 'name', direction: 'desc' })
  })

  test('sets column and resets to asc when different column', () => {
    const current: SortConfig = { column: 'name', direction: 'desc' }
    const toggled = toggleSort(current, 'inputPrice')
    expect(toggled).toEqual({ column: 'inputPrice', direction: 'asc' })
  })

  test('handles null column and sets to asc', () => {
    const current: SortConfig = { column: null, direction: 'asc' }
    const toggled = toggleSort(current, 'context')
    expect(toggled).toEqual({ column: 'context', direction: 'asc' })
  })
})
