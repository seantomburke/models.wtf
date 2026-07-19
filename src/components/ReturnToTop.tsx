import { useState, useEffect } from 'react'

export function ReturnToTop() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 200)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (!visible) return null

  return (
    <button
      onClick={scrollToTop}
      className="fixed bottom-8 right-8 z-40 flex items-center justify-center w-10 h-10 rounded-lg bg-accent-deep text-white shadow-lg transition-all duration-200 hover:bg-accent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-deep dark:focus:ring-offset-gray-900"
      aria-label="Return to top"
      title="Return to top (press Ctrl+Home)"
      type="button"
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <polyline points="18 15 12 9 6 15" />
      </svg>
    </button>
  )
}
