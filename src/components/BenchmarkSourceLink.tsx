interface BenchmarkSourceLinkProps {
  sourceUrl?: string
  benchmarkName: string
  className?: string
  children?: React.ReactNode
  variant?: 'badge' | 'wrapper'
}

function addUtmSource(url: string): string {
  const urlObj = new URL(url)
  urlObj.searchParams.set('utm_source', 'www.models.fyi')
  return urlObj.toString()
}

export function BenchmarkSourceLink({
  sourceUrl,
  benchmarkName,
  className = '',
  children,
  variant = 'badge',
}: BenchmarkSourceLinkProps) {
  if (!sourceUrl) {
    return children || null
  }

  const urlWithUtm = addUtmSource(sourceUrl)

  if (variant === 'wrapper') {
    return (
      <a
        href={urlWithUtm}
        target="_blank"
        rel="noopener noreferrer"
        className={`transition-colors duration-150 hover:text-accent-deep ${className}`}
        aria-label={`View ${benchmarkName} source`}
        title={`View ${benchmarkName} source`}
      >
        {children}
      </a>
    )
  }

  return (
    <a
      href={urlWithUtm}
      target="_blank"
      rel="noopener noreferrer"
      className={`ml-1 inline-flex items-center gap-0.5 text-[10px] font-medium text-fg-muted transition-colors duration-150 hover:text-accent-deep ${className}`}
      aria-label={`View ${benchmarkName} source`}
      title={`View ${benchmarkName} source`}
    >
      source <span className="text-[8px]">↗</span>
    </a>
  )
}
