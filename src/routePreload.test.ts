import { describe, expect, it } from 'vitest'
import { preloadInitialRoute, routeLoaderFor, routeLoaders } from './routePreload.ts'

describe('route preloading', () => {
  it.each([
    ['/models.fyi/compare/', routeLoaders.compare],
    ['/models.fyi/learn/what-is-an-llm/', routeLoaders.learnTopic],
    ['/models.fyi/models/claude-sonnet-5/', routeLoaders.modelDetail],
    ['/models.fyi/missing/', routeLoaders.notFound],
  ])('selects the initial chunk for %s', (pathname, expected) => {
    expect(routeLoaderFor(pathname, '/models.fyi/')).toBe(expected)
  })

  it('does not delay the eagerly loaded home page', async () => {
    expect(routeLoaderFor('/models.fyi/', '/models.fyi/')).toBeUndefined()
    await expect(preloadInitialRoute('/models.fyi/', '/models.fyi/')).resolves.toBeUndefined()
  })

  it('loads a direct-entry route before the app mounts', async () => {
    await expect(preloadInitialRoute('/models.fyi/faq/', '/models.fyi/')).resolves.toBeUndefined()
  })
})
