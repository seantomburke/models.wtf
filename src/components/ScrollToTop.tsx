import { useEffect, useRef } from 'react'
import { useLocation, useNavigationType } from 'react-router-dom'

export function ScrollToTop() {
  const { pathname } = useLocation()
  const navigationType = useNavigationType()
  const previousPathname = useRef(pathname)

  useEffect(() => {
    const pathnameChanged = pathname !== previousPathname.current
    previousPathname.current = pathname
    // Only scroll on real route changes; query/hash updates (e.g. filter or
    // graph interactions using replace navigations) keep the scroll position.
    // POP is skipped so back/forward keeps the browser's scroll restoration.
    if (pathnameChanged && navigationType !== 'POP') {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
    }
  }, [pathname, navigationType])

  return null
}
