import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import posthog from 'posthog-js'

export const usePostHogPageView = () => {
  const location = useLocation()

  useEffect(() => {
    posthog.capture('$pageview')
  }, [location])
}
