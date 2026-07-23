/**
 * File key for a route's OpenGraph image, shared between routeMeta.ts (which
 * writes the og:image URL into every page head) and
 * scripts/generate-og-images.mjs (which renders dist/og/<key>.png at build
 * time). One function on both sides means the URL and the file can never
 * drift; the generator also asserts every routeMeta image resolves to a file
 * it wrote.
 */
export function ogImageKey(path: string): string {
  return path === '/' ? 'home' : path.replace(/^\//, '').replaceAll('/', '-')
}
