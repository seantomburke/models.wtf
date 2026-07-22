import type { Benchmark } from '../data/types.ts'

/** Formats a score with its benchmark's own unit rather than assuming percent. */
export function formatBenchmarkScore(score: number, benchmark: Benchmark): string {
  return benchmark.unit === '%' ? `${score.toFixed(1)}%` : `${score.toFixed(1)} pts`
}
