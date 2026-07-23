import { useState } from 'react'

/**
 * Interactive picture of a context window as a capacity bar the reader fills
 * with content blocks. A live meter shows tokens used against the window size
 * and the estimated input cost, and a "trim to what matters" toggle shrinks
 * the big blocks to only the relevant snippets so the cost drop is visible.
 *
 * The lesson the reader should walk away with: the model reads every token
 * you send, you pay for every token it reads, and trimming or RAG keeps the
 * useful part while the bill shrinks.
 */

/** Representative input rate, dollars per one million tokens. */
export const RATE_PER_MILLION_TOKENS = 3

export interface ContentBlock {
  id: string
  label: string
  /** Tokens when the whole thing goes into the window. */
  fullTokens: number
  /** Tokens after trimming or RAG keeps only the relevant part. */
  trimmedTokens: number
  /** Shown in trim mode when the block shrank, to explain what remains. */
  trimmedLabel: string
  color: string
}

export const CONTENT_BLOCKS: ContentBlock[] = [
  {
    id: 'question',
    label: 'Your question',
    fullTokens: 500,
    trimmedTokens: 500,
    trimmedLabel: 'Your question',
    color: 'var(--color-seg-1, #0f766e)',
  },
  {
    id: 'history',
    label: 'Chat history',
    fullTokens: 4_000,
    trimmedTokens: 1_000,
    trimmedLabel: 'Recent messages only',
    color: 'var(--color-seg-2, #2563eb)',
  },
  {
    id: 'pdf',
    label: 'One PDF report',
    fullTokens: 30_000,
    trimmedTokens: 2_000,
    trimmedLabel: 'The 3 relevant pages',
    color: 'var(--color-seg-3, #d97706)',
  },
  {
    id: 'codebase',
    label: 'Whole codebase',
    fullTokens: 150_000,
    trimmedTokens: 5_000,
    trimmedLabel: 'The 4 files that matter',
    color: 'var(--color-seg-4, #dc2626)',
  },
  {
    id: 'book',
    label: 'A full book',
    fullTokens: 180_000,
    trimmedTokens: 3_000,
    trimmedLabel: 'The chapter you asked about',
    color: 'var(--color-seg-5, #7c3aed)',
  },
]

export const WINDOW_SIZES = [
  { label: '200K window', tokens: 200_000 },
  { label: '1M window', tokens: 1_000_000 },
]

export function formatTokens(tokens: number): string {
  if (tokens >= 1_000_000) {
    const millions = tokens / 1_000_000
    return `${Number.isInteger(millions) ? millions : millions.toFixed(1)}M`
  }
  if (tokens >= 1_000) {
    const thousands = tokens / 1_000
    return `${Number.isInteger(thousands) ? thousands : thousands.toFixed(1)}K`
  }
  return String(tokens)
}

export function formatCost(tokens: number): string {
  const dollars = (tokens / 1_000_000) * RATE_PER_MILLION_TOKENS
  if (dollars >= 0.1) return `$${dollars.toFixed(2)}`
  const cents = dollars * 100
  if (cents >= 1) return `${cents.toFixed(1)}¢`
  return `${cents.toFixed(2)}¢`
}

export function ContextWindowVisualizer() {
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(['question', 'pdf'])
  )
  const [windowTokens, setWindowTokens] = useState(WINDOW_SIZES[0].tokens)
  const [trimmed, setTrimmed] = useState(false)

  const activeBlocks = CONTENT_BLOCKS.filter((block) => selected.has(block.id))
  const tokensFor = (block: ContentBlock) =>
    trimmed ? block.trimmedTokens : block.fullTokens
  const usedTokens = activeBlocks.reduce((sum, block) => sum + tokensFor(block), 0)
  const fullTokensTotal = activeBlocks.reduce(
    (sum, block) => sum + block.fullTokens,
    0
  )
  const overflow = usedTokens > windowTokens
  const savings = fullTokensTotal - usedTokens

  const toggleBlock = (id: string) => {
    setSelected((current) => {
      const next = new Set(current)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-fg-secondary">
        This is a context window drawn as a capacity bar. You can add content
        blocks and watch how much of the window they fill, and how much the
        model would charge to read them at a typical rate of $
        {RATE_PER_MILLION_TOKENS} per 1M input tokens.
      </p>

      <div className="flex flex-wrap gap-2">
        {CONTENT_BLOCKS.map((block) => {
          const isOn = selected.has(block.id)
          return (
            <button
              key={block.id}
              type="button"
              aria-pressed={isOn}
              onClick={() => toggleBlock(block.id)}
              className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors motion-reduce:transition-none ${
                isOn
                  ? 'border-accent-deep bg-surface-raised text-fg'
                  : 'border-line bg-surface text-fg-secondary hover:border-line-strong'
              }`}
            >
              <span
                aria-hidden="true"
                className="mr-2 inline-block h-2.5 w-2.5 rounded-sm align-middle"
                style={{ backgroundColor: block.color, opacity: isOn ? 1 : 0.35 }}
              />
              {block.label}
              <span className="ml-2 text-xs text-fg-secondary">
                {formatTokens(trimmed ? block.trimmedTokens : block.fullTokens)}
              </span>
            </button>
          )
        })}
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div
          role="group"
          aria-label="Window size"
          className="flex overflow-hidden rounded-lg border border-line"
        >
          {WINDOW_SIZES.map((size) => (
            <button
              key={size.tokens}
              type="button"
              aria-pressed={windowTokens === size.tokens}
              onClick={() => setWindowTokens(size.tokens)}
              className={`px-3 py-1.5 text-sm font-medium transition-colors motion-reduce:transition-none ${
                windowTokens === size.tokens
                  ? 'bg-accent text-white'
                  : 'bg-surface text-fg-secondary hover:text-fg'
              }`}
            >
              {size.label}
            </button>
          ))}
        </div>

        <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-fg">
          <input
            type="checkbox"
            checked={trimmed}
            onChange={(e) => setTrimmed(e.target.checked)}
            className="h-4 w-4 accent-[var(--color-accent-deep)]"
          />
          Trim to what matters (RAG)
        </label>
      </div>

      <div className="space-y-2">
        <div
          role="img"
          aria-label={`Context window filled with ${formatTokens(usedTokens)} of ${formatTokens(windowTokens)} tokens`}
          className="relative h-12 w-full overflow-hidden rounded-lg border border-line bg-surface"
        >
          <div className="absolute inset-0 flex">
            {activeBlocks.map((block) => (
              <div
                key={block.id}
                title={`${block.label}: ${formatTokens(tokensFor(block))} tokens`}
                className="h-full transition-all duration-500 motion-reduce:transition-none"
                style={{
                  width: `${Math.min((tokensFor(block) / windowTokens) * 100, 100)}%`,
                  backgroundColor: block.color,
                  minWidth: tokensFor(block) > 0 ? '3px' : undefined,
                }}
              />
            ))}
          </div>
        </div>
        <p className="text-xs text-fg-secondary">
          Each colored slice is one content block. Empty space is capacity you
          could still use.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-line bg-surface p-3">
          <p className="text-xs text-fg-secondary">Tokens the model reads</p>
          <p className="text-lg font-semibold text-fg">
            {formatTokens(usedTokens)}{' '}
            <span className="text-sm font-normal text-fg-secondary">
              of {formatTokens(windowTokens)}
            </span>
          </p>
        </div>
        <div className="rounded-lg border border-line bg-surface p-3">
          <p className="text-xs text-fg-secondary">Estimated input cost</p>
          <p className="text-lg font-semibold text-fg">{formatCost(usedTokens)}</p>
        </div>
        <div className="rounded-lg border border-line bg-surface p-3">
          <p className="text-xs text-fg-secondary">Saved by trimming</p>
          <p className="text-lg font-semibold text-fg">
            {trimmed && savings > 0 ? formatCost(savings) : '—'}
          </p>
        </div>
      </div>

      {overflow && (
        <p
          role="alert"
          className="rounded-lg border border-line bg-surface-raised p-3 text-sm text-fg"
        >
          This is more than the window can hold. The model would reject the
          request or drop content. You can switch to the 1M window, or you can
          turn on trimming so only the relevant parts go in.
        </p>
      )}

      {trimmed && savings > 0 && !overflow && (
        <p className="text-sm text-fg-secondary">
          Trimming kept your question and the relevant snippets, and the answer
          quality stays the same for most questions. The bill dropped by{' '}
          {formatCost(savings)} because the model reads {formatTokens(savings)}{' '}
          fewer tokens.
        </p>
      )}
    </div>
  )
}
