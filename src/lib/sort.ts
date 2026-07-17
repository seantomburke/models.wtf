import type { Model, BenchmarkId } from '../data/index.ts'

export type SortDirection = 'asc' | 'desc'

export interface SortConfig {
  column: string | null
  direction: SortDirection
}

/**
 * Sorts models by the specified column, with undefined scores always sorted to the end.
 * Columns: 'name', 'inputPrice', 'outputPrice', 'context', or benchmark ID (e.g., 'swe-bench-verified')
 */
export function sortModels(models: Model[], config: SortConfig): Model[] {
  if (!config.column) return models

  const sorted = [...models]
  const isAsc = config.direction === 'asc'

  sorted.sort((a, b) => {
    let aVal: number | string | null | undefined
    let bVal: number | string | null | undefined
    let aUndefined = false
    let bUndefined = false

    // Determine which values to compare
    if (config.column === 'name') {
      aVal = a.name.toLowerCase()
      bVal = b.name.toLowerCase()
    } else if (config.column === 'inputPrice') {
      aVal = a.inputPricePerMTok
      bVal = b.inputPricePerMTok
    } else if (config.column === 'outputPrice') {
      aVal = a.outputPricePerMTok
      bVal = b.outputPricePerMTok
    } else if (config.column === 'context') {
      aVal = a.contextWindowTokens
      bVal = b.contextWindowTokens
    } else {
      // Treat as benchmark score (BenchmarkId)
      aVal = a.scores[config.column as BenchmarkId]
      bVal = b.scores[config.column as BenchmarkId]
    }

    // Undefined scores always sort to the end
    aUndefined = aVal === undefined || aVal === null
    bUndefined = bVal === undefined || bVal === null

    if (aUndefined && bUndefined) return 0
    if (aUndefined) return 1
    if (bUndefined) return -1

    // Both defined: normal comparison
    if (aVal! < bVal!) return isAsc ? -1 : 1
    if (aVal! > bVal!) return isAsc ? 1 : -1
    return 0
  })

  return sorted
}

/**
 * Toggle sort direction if same column, otherwise set direction to 'asc'.
 * Useful for header click handlers.
 */
export function toggleSort(current: SortConfig, newColumn: string): SortConfig {
  if (current.column === newColumn) {
    return {
      column: newColumn,
      direction: current.direction === 'asc' ? 'desc' : 'asc',
    }
  }
  return {
    column: newColumn,
    direction: 'asc',
  }
}
