import { expect, test } from 'vitest'
import { benchmarks } from '../data/benchmarks.ts'
import { formatBenchmarkScore } from './benchmarkScore.ts'

test('formats percentages and points with their actual units', () => {
  const percent = benchmarks.find((benchmark) => benchmark.id === 'gpqa-diamond')!
  const points = benchmarks.find((benchmark) => benchmark.id === 'aa-intelligence-index')!

  expect(formatBenchmarkScore(92.6, percent)).toBe('92.6%')
  expect(formatBenchmarkScore(60, points)).toBe('60.0 pts')
})
