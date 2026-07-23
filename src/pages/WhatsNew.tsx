import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { usePageMeta } from '../lib/meta.ts'
import { metaFor, provideCorpus } from '../lib/routeMeta.ts'
import { releases, models, providerById, type ReleaseType } from '../data/index.ts'
import { ProviderLogo } from '../components/ProviderLogo.tsx'
import { Breadcrumb } from '../components/Breadcrumb.tsx'

const releaseTypeLabels: Record<ReleaseType, string> = {
  new: '🆕 New',
  update: '🔄 Update',
  'price-change': '💰 Price',
  feature: '✨ Feature',
}

const releaseTypeColors: Record<ReleaseType, string> = {
  new: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  update: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  'price-change': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  feature: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
}

function getRelativeDate(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  const ago = (count: number, unit: string) =>
    `${count} ${unit}${count === 1 ? '' : 's'} ago`

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return ago(diffDays, 'day')
  if (diffDays < 30) return ago(Math.floor(diffDays / 7), 'week')
  if (diffDays < 365) return ago(Math.floor(diffDays / 30), 'month')
  return ago(Math.floor(diffDays / 365), 'year')
}

// Release dates are date-only strings ("2026-07-15"), which parse as midnight
// UTC, so format in UTC and viewers west of Greenwich won't see the prior day.
function formatReleaseDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  })
}

// This page already loads the release feed to render it, so it supplies the
// entries the /whats-new JSON-LD needs, keeping them out of other bundles.
provideCorpus({ releases })

export function WhatsNew() {
  const [filter, setFilter] = useState<ReleaseType | 'all'>('all')

  const meta = metaFor('/whats-new')
  usePageMeta({
    title: meta.title,
    description: meta.description,
    pathname: '/whats-new',
    structuredData: meta.structuredData,
  })

  const sortedReleases = useMemo(() => {
    // Copy before sorting; sort() in place would mutate the shared module array.
    return [...releases].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [])

  const filtered = useMemo(() => {
    if (filter === 'all') return sortedReleases
    return sortedReleases.filter((r) => r.type === filter)
  }, [filter, sortedReleases])

  const filterOptions: Array<{ type: ReleaseType | 'all'; label: string }> = [
    { type: 'all', label: 'All' },
    { type: 'new', label: 'New Models' },
    { type: 'update', label: 'Updates' },
    { type: 'price-change', label: 'Pricing' },
    { type: 'feature', label: 'Features' },
  ]

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { name: 'Home', path: '/' },
          { name: "What's New" },
        ]}
        className="mb-4"
      />

      <div className="max-w-3xl">
        <h1 className="text-3xl font-semibold tracking-tight">What's new</h1>
        <p className="mt-3 leading-relaxed text-fg-secondary">
          Latest model releases, feature announcements, and pricing updates. Check back regularly to stay informed about
          the latest developments in AI models.
        </p>
        <a
          href={`${import.meta.env.BASE_URL}feed.xml`}
          className="mt-3 inline-flex min-h-6 items-center gap-1.5 text-sm font-medium text-accent-deep hover:text-accent-deep/80 transition-colors duration-150"
        >
          <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor" aria-hidden="true">
            <path d="M2 13a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0Zm-.5-5.5a1 1 0 0 1 1-1A7.5 7.5 0 0 1 10 14a1 1 0 1 1-2 0 5.5 5.5 0 0 0-5.5-5.5 1 1 0 0 1-1-1Zm0-4.5a1 1 0 0 1 1-1A12 12 0 0 1 14.5 14a1 1 0 1 1-2 0A10 10 0 0 0 2.5 4a1 1 0 0 1-1-1Z" />
          </svg>
          Subscribe to the feed
        </a>
      </div>

      <div className="flex flex-wrap gap-2">
        {filterOptions.map(({ type, label }) => (
          <button
            key={type}
            type="button"
            onClick={() => setFilter(type)}
            aria-pressed={filter === type}
            className={`inline-flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-deep ${
              filter === type
                ? 'bg-accent-soft text-accent-deep'
                : 'border border-line text-fg-secondary hover:border-line-strong hover:text-fg'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filtered.length > 0 ? (
          filtered.map((release) => {
            const model = release.modelId ? models.find((m) => m.id === release.modelId) : null
            const provider = model ? providerById.get(model.providerId) : null

            return (
              <article
                key={release.id}
                className="rounded-lg border border-line bg-surface-raised p-4 transition-colors duration-150 hover:border-line-strong sm:p-6"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${releaseTypeColors[release.type]}`}
                      >
                        {releaseTypeLabels[release.type]}
                      </span>
                      {model && provider && (
                        <Link
                          to={`/models/${model.id}`}
                          className="flex items-center gap-1.5 text-fg-muted hover:text-accent-deep transition-colors duration-150"
                        >
                          <ProviderLogo providerId={model.providerId} size={14} />
                          <span className="text-xs font-medium">{model.name}</span>
                        </Link>
                      )}
                    </div>
                    <h2 className="mt-2 text-lg font-semibold text-fg">{release.title}</h2>
                    <p className="mt-1 text-xs text-fg-muted">{formatReleaseDate(release.date)}</p>
                    <p className="mt-2 leading-relaxed text-fg-secondary">{release.description}</p>
                    {release.link && (
                      <div className="mt-3">
                        <a
                          href={release.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex min-h-6 items-center text-sm font-medium text-accent-deep hover:text-accent-deep/80 transition-colors duration-150"
                        >
                          Read more →
                        </a>
                      </div>
                    )}
                  </div>
                  <div className="whitespace-nowrap text-xs font-medium text-fg-muted sm:text-right">
                    {getRelativeDate(release.date)}
                  </div>
                </div>
              </article>
            )
          })
        ) : (
          <div className="rounded-lg border border-line bg-surface-raised p-6 text-center">
            <p className="text-fg-secondary">No releases found for the selected filter.</p>
          </div>
        )}
      </div>
    </div>
  )
}
