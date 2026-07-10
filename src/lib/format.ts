/** "1M", "200K", "10M" — context windows in friendly units. */
export function formatTokens(tokens: number | null): string {
  if (tokens === null) return '—'
  if (tokens >= 1_000_000) {
    const m = tokens / 1_000_000
    return `${Number.isInteger(m) ? m : m.toFixed(2).replace(/0+$/, '').replace(/\.$/, '')}M`
  }
  return `${Math.round(tokens / 1_000)}K`
}

/** "$5", "$2.50" — price per 1M tokens. */
export function formatPrice(price: number | null): string {
  if (price === null) return 'Free*'
  return `$${Number.isInteger(price) ? price : price.toFixed(2)}`
}
