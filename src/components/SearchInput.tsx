import { useState, useCallback } from 'react'

export interface SearchInputProps {
  onSearch: (query: string) => void
  placeholder?: string
  className?: string
}

export function SearchInput({
  onSearch,
  placeholder = 'Search models, providers...',
  className = '',
}: SearchInputProps) {
  const [query, setQuery] = useState('')

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value
      setQuery(value)
      onSearch(value)
    },
    [onSearch],
  )

  const handleClear = useCallback(() => {
    setQuery('')
    onSearch('')
  }, [onSearch])

  return (
    <div className={`relative ${className}`}>
      <input
        type="text"
        value={query}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full rounded-lg border border-line bg-surface px-4 py-2 text-sm placeholder-fg-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
        aria-label="Search models"
      />
      {query && (
        <button
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-fg-muted hover:text-fg"
          aria-label="Clear search"
        >
          ✕
        </button>
      )}
    </div>
  )
}
