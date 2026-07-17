import { Link } from 'react-router-dom'
import { usePageMeta } from '../lib/meta.ts'

interface PlaceholderProps {
  title: string
  metaTitle: string
  description: string
  isNotFound?: boolean
  pathname?: string
}

/** Stand-in for "under construction" feature pages or 404 not-found pages. */
export function Placeholder({
  title,
  metaTitle,
  description,
  isNotFound = false,
  pathname,
}: PlaceholderProps) {
  usePageMeta({
    title: metaTitle,
    description,
    pathname,
  })
  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
      <p className="mt-4 leading-relaxed text-fg-secondary">{description}</p>
      {isNotFound ? (
        <p className="mt-6">
          <Link
            to="/"
            className="inline-block rounded-lg bg-accent-deep px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-accent"
          >
            Back to home
          </Link>
        </p>
      ) : (
        <p className="mt-6 rounded-lg border border-line bg-surface-raised px-4 py-3 text-sm text-fg-muted">
          This page is under construction. It's coming in an upcoming release.
        </p>
      )}
    </div>
  )
}
