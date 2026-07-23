import { Link } from 'react-router-dom'
import { releases, type ReleaseType } from '../../data/index.ts'

// Duplicated from WhatsNew rather than shared: the mapping is tiny and each
// surface can evolve its own labels independently.
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

interface Props {
  modelId: string
}

export function ModelReleaseHistory({ modelId }: Props) {
  const history = releases
    // filter() copies, so this sort() never touches the shared module array.
    .filter((r) => r.modelId === modelId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  if (history.length === 0) {
    return null
  }

  return (
    <section>
      <h2 className="text-2xl font-bold text-fg mb-6">
        Release History
      </h2>
      <div className="space-y-4">
        {history.map((release) => (
          <article
            key={release.id}
            className="rounded-lg border border-line bg-surface-raised p-4 sm:p-5"
          >
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${releaseTypeColors[release.type]}`}
              >
                {releaseTypeLabels[release.type]}
              </span>
              <span className="text-xs font-medium text-fg-muted">{formatReleaseDate(release.date)}</span>
            </div>
            <h3 className="mt-2 text-lg font-semibold text-fg">{release.title}</h3>
            <p className="mt-1 leading-relaxed text-fg-secondary">{release.description}</p>
            {release.link && (
              <div className="mt-2">
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
          </article>
        ))}
      </div>
      <div className="mt-4">
        <Link
          to="/whats-new"
          className="text-sm font-medium text-accent-deep hover:underline"
        >
          See all updates →
        </Link>
      </div>
    </section>
  )
}
