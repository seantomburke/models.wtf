import type { Model } from '../data/types'

export interface SearchResult {
  model: Model
  matchType: 'name' | 'provider' | 'benchmark' | 'description'
  relevance: number
}

function computeLevenshtein(a: string, b: string): number {
  const dp: number[][] = Array(a.length + 1)
    .fill(null)
    .map(() => Array(b.length + 1).fill(0))

  for (let i = 0; i <= a.length; i++) dp[i][0] = i
  for (let j = 0; j <= b.length; j++) dp[0][j] = j

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1]
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1])
      }
    }
  }

  return dp[a.length][b.length]
}

function fuzzyMatch(query: string, text: string): number {
  const q = query.toLowerCase()
  const t = text.toLowerCase()

  if (t.includes(q)) return 100 // Exact substring match
  if (t.startsWith(q)) return 90 // Starts with
  if (t.split(' ').some((word) => word.startsWith(q))) return 80 // Word start

  const distance = computeLevenshtein(q, t)
  const maxLen = Math.max(q.length, t.length)
  const similarity = Math.max(0, (maxLen - distance) / maxLen)

  return Math.round(similarity * 70)
}

export function searchModels(models: Model[], query: string): SearchResult[] {
  if (!query.trim()) return []

  const results: SearchResult[] = []
  const q = query.toLowerCase()

  for (const model of models) {
    const nameScore = fuzzyMatch(query, model.name)
    const providerScore = fuzzyMatch(query, model.providerId)

    let bestScore = Math.max(nameScore, providerScore)
    let matchType: SearchResult['matchType'] = nameScore > providerScore ? 'name' : 'provider'

    // Check for blurb/description matches
    if (model.blurb && model.blurb.toLowerCase().includes(q)) {
      if (80 > bestScore) {
        bestScore = 80
        matchType = 'description'
      }
    }

    // Add result if there's a meaningful match
    if (bestScore > 30) {
      results.push({
        model,
        matchType,
        relevance: bestScore,
      })
    }
  }

  // Sort by relevance (descending)
  return results.sort((a, b) => b.relevance - a.relevance)
}

export function groupSearchResults(
  results: SearchResult[],
): Record<SearchResult['matchType'], SearchResult[]> {
  return {
    name: results.filter((r) => r.matchType === 'name'),
    provider: results.filter((r) => r.matchType === 'provider'),
    benchmark: results.filter((r) => r.matchType === 'benchmark'),
    description: results.filter((r) => r.matchType === 'description'),
  }
}
