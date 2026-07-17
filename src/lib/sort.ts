import type { Model, BenchmarkId } from '../data/index.ts'

export type SortDirection = 'asc' | 'desc'

export interface SortConfig {
  column: string | null
  direction: SortDirection
}

/**
 * Sorts models by the specified column, with undefined scores always sorted to the end.
 * Columns: 'name', 'inputPrice', 'outputPrice', 'context', or benchmark ID (e.g., 'swe-bench-verified')
 *
 * Pre-builds a getValue function outside the sort loop for O(n log n) instead of O(n log n * column checks).
 */
export function sortModels(models: Model[], config: SortConfig): Model[] {
  if (!config.column) return models

  const sorted = [...models]
  const isAsc = config.direction === 'asc'
  const column = config.column

  // Build getValue function once, outside the sort loop
  const getValue = (model: Model): number | string | null | undefined => {
    if (column === 'name') {
      return model.name.toLowerCase()
    } else if (column === 'inputPrice') {
      return model.inputPricePerMTok
    } else if (column === 'outputPrice') {
      return model.outputPricePerMTok
    } else if (column === 'context') {
      return model.contextWindowTokens
    } else {
      // Treat as benchmark score (BenchmarkId)
      return model.scores[column as BenchmarkId]
    }
  }

  sorted.sort((a, b) => {
    const aVal = getValue(a)
    const bVal = getValue(b)

    // Undefined scores always sort to the end
    const aUndefined = aVal === undefined || aVal === null
    const bUndefined = bVal === undefined || bVal === null

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
