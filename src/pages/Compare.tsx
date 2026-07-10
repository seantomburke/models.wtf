import { useMemo, useState } from 'react'
import { usePageMeta } from '../lib/meta.ts'
import { formatPrice, formatTokens } from '../lib/format.ts'
import { benchmarks, models, providers, dataSourcedAt } from '../data/index.ts'
import type { ProviderId } from '../data/index.ts'

type Filter = 'all' | 'open-source' | ProviderId

const providerById = new Map(providers.map((p) => [p.id, p]))

export function Compare() {
  usePageMeta(
    'Compare AI models — Models.fyi',
    'Every flagship AI model side by side: benchmark scores, prices, and context windows from OpenAI, Anthropic, Google, xAI, and open source — explained in plain language.',
  )

  const [filter, setFilter] = useState<Filter>('all')

  const visible = useMemo(() => {
    if (filter === 'all') return models
    if (filter === 'open-source') return models.filter((m) => m.openSource)
    return models.filter((m) => m.providerId === filter)
  }, [filter])

  // Best published score per benchmark among the visible models.
  const bestScores = useMemo(() => {
    const best: Partial<Record<string, number>> = {}
    for (const b of benchmarks) {
      const scores = visible.map((m) => m.scores[b.id]).filter((s): s is number => s !== undefined)
      if (scores.length > 0) best[b.id] = Math.max(...scores)
    }
    return best
  }, [visible])

  const filters: Array<{ id: Filter; label: string }> = [
    { id: 'all', label: 'All' },
    ...providers
      .filter((p) => !p.openSource)
      .map((p) => ({ id: p.id as Filter, label: p.name })),
    { id: 'open-source', label: 'Open source' },
  ]

  return (
    <div className="space-y-6">
      <div className="max-w-2xl">
        <h1 className="text-3xl font-semibold tracking-tight">Compare models</h1>
        <p className="mt-3 leading-relaxed text-fg-secondary">
          Higher is better on every test, and the <span className="font-medium text-accent-deep">best published score</span>{' '}
          in each column is highlighted. A “—” means no reliable published score — not a zero.
        </p>
      </div>

      <details className="rounded-xl border border-line bg-surface-raised">
        <summary className="cursor-pointer select-none px-4 py-3 text-sm font-medium text-fg-secondary transition-colors duration-150 hover:text-fg">
          What do these tests actually measure?
        </summary>
        <dl className="space-y-3 border-t border-line px-4 py-4">
          {benchmarks.map((b) => (
            <div key={b.id}>
              <dt className="text-sm font-semibold">{b.name}</dt>
              <dd className="mt-0.5 max-w-2xl text-sm leading-relaxed text-fg-secondary">
                {b.eli5}
              </dd>
            </div>
          ))}
        </dl>
      </details>

      <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter by provider">
        {filters.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => setFilter(id)}
            aria-pressed={filter === id}
            className={`rounded-lg px-3 py-1.5 text-sm transition-colors duration-150 ${
              filter === id
                ? 'bg-accent-soft font-medium text-accent-deep'
                : 'border border-line text-fg-secondary hover:border-line-strong hover:text-fg'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto rounded-xl border border-line bg-surface-raised">
        <table className="w-full min-w-[56rem] text-sm">
          <thead>
            <tr className="border-b border-line text-left">
              <th className="sticky left-0 bg-surface-raised px-4 py-3 font-medium text-fg-muted">
                Model
              </th>
              {benchmarks.map((b) => (
                <th
                  key={b.id}
                  title={b.eli5}
                  className="px-3 py-3 text-right font-medium text-fg-muted"
                >
                  {b.name}
                </th>
              ))}
              <th className="px-3 py-3 text-right font-medium text-fg-muted" title="USD per 1M input / output tokens">
                Price in/out
              </th>
              <th className="px-3 py-3 text-right font-medium text-fg-muted" title="How much text the model can consider at once">
                Context
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {visible.map((m) => {
              const provider = providerById.get(m.providerId)
              return (
                <tr key={m.id}>
                  <td className="sticky left-0 bg-surface-raised px-4 py-3">
                    <div className="font-medium text-fg">{m.name}</div>
                    <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-fg-muted">
                      <span
                        className="inline-block h-2 w-2 rounded-full"
                        style={{ backgroundColor: provider?.color }}
                        aria-hidden
                      />
                      {provider?.name}
                      {m.reasoning && (
                        <span title="Reasoning model: thinks before answering" aria-label="Reasoning model">
                          🧠
                        </span>
                      )}
                      {m.internetAccess && (
                        <span title="Assistant has live web access" aria-label="Internet access">
                          🌐
                        </span>
                      )}
                      {m.openSource && (
                        <span className="rounded bg-accent-soft px-1 py-0.5 text-[10px] font-medium text-accent-deep">
                          open
                        </span>
                      )}
                    </div>
                  </td>
                  {benchmarks.map((b) => {
                    const score = m.scores[b.id]
                    const isBest = score !== undefined && score === bestScores[b.id]
                    return (
                      <td
                        key={b.id}
                        className={`px-3 py-3 text-right font-mono tabular-nums ${
                          score === undefined
                            ? 'text-fg-faint'
                            : isBest
                              ? 'font-semibold text-accent-deep'
                              : 'text-fg-secondary'
                        }`}
                      >
                        {score === undefined ? '—' : `${score.toFixed(1)}%`}
                      </td>
                    )
                  })}
                  <td className="px-3 py-3 text-right font-mono tabular-nums text-fg-secondary">
                    {formatPrice(m.inputPricePerMTok)} / {formatPrice(m.outputPricePerMTok)}
                  </td>
                  <td className="px-3 py-3 text-right font-mono tabular-nums text-fg-secondary">
                    {formatTokens(m.contextWindowTokens)}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-fg-muted">
        *Open-source models are free to download and run yourself; hosted-API pricing varies by
        vendor. Scores are provider-published evals collected {dataSourcedAt}.
      </p>
    </div>
  )
}
