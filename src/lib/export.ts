import { benchmarks, providerById, dataSourcedAt } from '../data/index.ts'
import type { Model, BenchmarkId } from '../data/index.ts'
import { formatPrice, formatTokens, formatDateForCSV } from './format.ts'

/**
 * Escape a string for CSV export per RFC 4180.
 * Enclose in quotes if the value contains comma, quote, newline, carriage return,
 * or leading/trailing whitespace. Double any internal quotes.
 */
function escapeCSV(value: string): string {
  const needsEscaping =
    value.includes(',') ||
    value.includes('"') ||
    value.includes('\n') ||
    value.includes('\r') ||
    value !== value.trim()

  if (needsEscaping) {
    return `"${value.replace(/"/g, '""')}"` // Escape quotes by doubling them
  }
  return value
}

/**
 * Convert a score to a CSV-friendly format.
 * Returns the numeric score or empty string for undefined scores.
 */
function formatScoreForCSV(score: number | undefined): string {
  return score !== undefined ? score.toFixed(1) : ''
}

/**
 * Generate CSV content for the comparison table.
 * Includes headers, all visible models, benchmarks, pricing, and context window data.
 *
 * @param visibleModels - Models to include in the export (filtered by user's current filter)
 * @returns CSV string ready for download
 */
export function generateComparisonCSV(visibleModels: Model[]): string {
  const lines: string[] = []

  // Build header row
  const headerRow: string[] = ['Model', 'Provider', 'Tier', 'Release Date']

  // Pre-build benchmark IDs array to avoid repeated array access
  const benchmarkIds = benchmarks.map((b) => b.id as BenchmarkId)

  // Add benchmark headers
  for (const benchmark of benchmarks) {
    headerRow.push(benchmark.name)
  }

  // Add pricing and context headers
  headerRow.push('Input Price (per 1M tokens)', 'Output Price (per 1M tokens)', 'Context Window')

  // Add capability headers
  headerRow.push('Reasoning', 'Web Access', 'Open Source', 'License')

  lines.push(headerRow.map(escapeCSV).join(','))

  // Build data rows
  for (const model of visibleModels) {
    const provider = providerById.get(model.providerId)
    const row: string[] = [
      model.name,
      provider?.name || 'Unknown',
      model.tier,
      formatDateForCSV(model.releaseDate),
    ]

    // Add benchmark scores using pre-built benchmark IDs
    for (const benchmarkId of benchmarkIds) {
      row.push(formatScoreForCSV(model.scores[benchmarkId]))
    }

    // Add pricing
    row.push(
      model.inputPricePerMTok !== null ? formatPrice(model.inputPricePerMTok) : 'Free',
      model.outputPricePerMTok !== null ? formatPrice(model.outputPricePerMTok) : 'Free',
    )

    // Add context window
    row.push(model.contextWindowTokens !== null ? formatTokens(model.contextWindowTokens) : '')

    // Add capabilities
    row.push(
      model.reasoning ? 'Yes' : 'No',
      model.internetAccess ? 'Yes' : 'No',
      model.openSource ? 'Yes' : 'No',
      model.license || '',
    )

    lines.push(row.map(escapeCSV).join(','))
  }

  // Add metadata footer
  lines.push('')
  lines.push(`"Data sourced: ${dataSourcedAt}"`)
  lines.push(`"Benchmark scores are provider-published evals where available, otherwise independent leaderboard runs."`)

  return lines.join('\n')
}

/**
 * Generate a filename for the export with today's date.
 * Format: models-comparison-YYYY-MM-DD.csv
 */
export function generateExportFilename(): string {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  return `models-comparison-${year}-${month}-${day}.csv`
}

/**
 * Trigger a CSV download in the browser.
 * Creates a blob and simulates a click on a temporary download link.
 *
 * @param csv - CSV content as a string
 * @param filename - Filename for the downloaded file
 */
export function downloadCSV(csv: string, filename: string): void {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)

  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  // Delay revocation to ensure download starts before URL is released
  setTimeout(() => {
    URL.revokeObjectURL(url)
  }, 100)
}

/**
 * Export the comparison table as a CSV file.
 * This is the main entry point for the export functionality.
 *
 * @param visibleModels - Models to include in the export
 */
export function exportComparison(visibleModels: Model[]): void {
  const csv = generateComparisonCSV(visibleModels)
  const filename = generateExportFilename()
  downloadCSV(csv, filename)
}
