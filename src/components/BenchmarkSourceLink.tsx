interface BenchmarkSourceLinkProps {
  sourceUrl?: string
  benchmarkName: string
  className?: string
}

export function BenchmarkSourceLink({
  sourceUrl,
  benchmarkName,
  className = '',
}: BenchmarkSourceLinkProps) {
  if (!sourceUrl) {
    return null
  }

  return (
    <a
      href={sourceUrl}
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
