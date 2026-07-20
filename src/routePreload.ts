type RouteModule = Record<string, unknown>
export type RetryableRouteLoader<T extends RouteModule = RouteModule> = (() => Promise<T>) & {
  loaded: () => T | undefined
}
type RouteLoader = RetryableRouteLoader

function retryable<T extends RouteModule>(loader: () => Promise<T>): RetryableRouteLoader<T> {
  let pending: Promise<T> | undefined
  let value: T | undefined

  const load = () => {
    pending ??= loader().catch((error: unknown) => {
      pending = undefined
      throw error
    })
    return pending.then((module) => {
      value = module
      return module
    })
  }

  load.loaded = () => value
  return load
}

export const routeLoaders = {
  graph: retryable(() => import('./pages/Graph.tsx').then((m) => ({ default: m.Graph }))),
  calculator: retryable(() =>
    import('./pages/Calculator.tsx').then((m) => ({ default: m.Calculator })),
  ),
  search: retryable(() => import('./pages/Search.tsx').then((m) => ({ default: m.Search }))),
  compare: retryable(() => import('./pages/Compare.tsx').then((m) => ({ default: m.Compare }))),
  quiz: retryable(() => import('./pages/Quiz.tsx').then((m) => ({ default: m.Quiz }))),
  learn: retryable(() => import('./pages/learn/Learn.tsx').then((m) => ({ default: m.Learn }))),
  learnTopic: retryable(() =>
    import('./pages/learn/LearnTopic.tsx').then((m) => ({ default: m.LearnTopic })),
  ),
  faq: retryable(() => import('./pages/FAQ.tsx').then((m) => ({ default: m.FAQ }))),
  glossary: retryable(() =>
    import('./pages/Glossary.tsx').then((m) => ({ default: m.Glossary })),
  ),
  whatsNew: retryable(() =>
    import('./pages/WhatsNew.tsx').then((m) => ({ default: m.WhatsNew })),
  ),
  models: retryable(() =>
    import('./pages/models/ModelsIndex.tsx').then((m) => ({ default: m.ModelsIndex })),
  ),
  modelDetail: retryable(() =>
    import('./pages/models/ModelDetail.tsx').then((m) => ({ default: m.ModelDetail })),
  ),
  notFound: retryable(() =>
    import('./pages/NotFound.tsx').then((m) => ({ default: m.NotFound })),
  ),
} as const

function routePath(pathname: string, baseUrl: string): string {
  const base = baseUrl.replace(/\/$/, '')
  const withoutBase = base && pathname.startsWith(base) ? pathname.slice(base.length) : pathname
  return `/${withoutBase}`.replace(/\/{2,}/g, '/').replace(/\/$/, '') || '/'
}

export function routeLoaderFor(pathname: string, baseUrl = '/'): RouteLoader | undefined {
  const path = routePath(pathname, baseUrl)

  if (path === '/') return undefined
  if (path === '/graph') return routeLoaders.graph
  if (path === '/calculator') return routeLoaders.calculator
  if (path === '/search') return routeLoaders.search
  if (path === '/compare') return routeLoaders.compare
  if (path === '/quiz') return routeLoaders.quiz
  if (path === '/learn') return routeLoaders.learn
  if (path.startsWith('/learn/')) return routeLoaders.learnTopic
  if (path === '/faq') return routeLoaders.faq
  if (path === '/glossary') return routeLoaders.glossary
  if (path === '/whats-new') return routeLoaders.whatsNew
  if (path === '/models') return routeLoaders.models
  if (path.startsWith('/models/')) return routeLoaders.modelDetail
  return routeLoaders.notFound
}

/**
 * Keep prerendered content on screen until the current route chunk is ready.
 *
 * The app intentionally client-renders instead of hydrating. Mounting before a
 * lazy route resolves would therefore replace the complete static page with a
 * tiny Suspense fallback and cause a large layout shift on every direct visit.
 */
export async function preloadInitialRoute(pathname: string, baseUrl = '/'): Promise<void> {
  await routeLoaderFor(pathname, baseUrl)?.()
}
