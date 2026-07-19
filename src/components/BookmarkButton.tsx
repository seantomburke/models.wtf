interface BookmarkButtonProps {
  isBookmarked: boolean
  onClick: () => void
  aria?: string
}

export function BookmarkButton({ isBookmarked, onClick, aria }: BookmarkButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={aria || (isBookmarked ? 'Remove bookmark' : 'Add bookmark')}
      title={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
      className={`inline-flex items-center justify-center w-6 h-6 rounded transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-deep ${
        isBookmarked
          ? 'text-yellow-500 hover:text-yellow-600'
          : 'text-fg-muted hover:text-fg'
      }`}
    >
      <span aria-hidden className="text-lg">
        {isBookmarked ? '★' : '☆'}
      </span>
    </button>
  )
}
