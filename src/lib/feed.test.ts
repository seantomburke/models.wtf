import { buildAtomFeed } from './feed'
import { releases } from '../data/releases'
import { routeMeta, SITE_URL } from './routeMeta'
import type { Release } from '../data/releases'

test('the real release log builds a feed with one entry per release, newest first', () => {
  const xml = buildAtomFeed(releases)
  expect(xml.match(/<entry>/g)).toHaveLength(releases.length)

  const dates = [...xml.matchAll(/<published>(\d{4}-\d{2}-\d{2})T00:00:00Z<\/published>/g)].map(
    (m) => m[1],
  )
  expect(dates).toHaveLength(releases.length)
  const sorted = [...dates].sort((a, b) => b.localeCompare(a))
  expect(dates).toEqual(sorted)
})

test('required Atom elements are present and non-empty', () => {
  const xml = buildAtomFeed(releases)
  expect(xml).toContain('<feed xmlns="http://www.w3.org/2005/Atom">')
  expect(xml).toContain(`<link rel="self" href="${SITE_URL}/feed.xml" />`)
  expect(xml).toMatch(/<updated>\d{4}-\d{2}-\d{2}T00:00:00Z<\/updated>/)
  // No empty <id>, <title>, or <updated> anywhere.
  expect(xml).not.toMatch(/<(id|title|updated)>\s*<\//)
})

test('every entry links to a route that actually prerenders', () => {
  const xml = buildAtomFeed(releases)
  const prerendered = new Set(routeMeta.map((r) => r.path))
  const links = [...xml.matchAll(/<link rel="alternate" href="([^"]+)" \/>/g)].map((m) => m[1])
  expect(links.length).toBeGreaterThan(0)
  for (const link of links) {
    const path = link.replace(SITE_URL, '').replace(/\/$/, '') || '/'
    expect(prerendered).toContain(path)
  }
})

test('titles and descriptions with markup characters are escaped', () => {
  const spiky: Release[] = [
    {
      id: 'spiky',
      type: 'update',
      title: 'Faster & <cheaper> "models"',
      description: 'Now with <script> & more',
      date: '2026-07-01',
    },
  ]
  const xml = buildAtomFeed(spiky)
  expect(xml).toContain('Faster &amp; &lt;cheaper&gt; &quot;models&quot;')
  expect(xml).toContain('Now with &lt;script&gt; &amp; more')
  expect(xml).not.toContain('<script>')
})

test('a model release links to its model page; a general release links to /whats-new', () => {
  const pair: Release[] = [
    { id: 'a', modelId: 'claude-opus-4-8', type: 'new', title: 'A', description: 'a', date: '2026-07-02' },
    { id: 'b', type: 'feature', title: 'B', description: 'b', date: '2026-07-01' },
  ]
  const xml = buildAtomFeed(pair)
  expect(xml).toContain(`<link rel="alternate" href="${SITE_URL}/models/claude-opus-4-8/" />`)
  expect(xml).toContain(`<link rel="alternate" href="${SITE_URL}/whats-new/" />`)
})

test('an external announcement link becomes rel="related"', () => {
  const withLink: Release[] = [
    {
      id: 'x',
      type: 'new',
      title: 'X',
      description: 'x',
      date: '2026-07-01',
      link: 'https://example.com/announcement?a=1&b=2',
    },
  ]
  const xml = buildAtomFeed(withLink)
  expect(xml).toContain('<link rel="related" href="https://example.com/announcement?a=1&amp;b=2" />')
})

test('an empty release log refuses to build', () => {
  expect(() => buildAtomFeed([])).toThrow(/empty/)
})

test('a malformed date refuses to build', () => {
  const bad: Release[] = [
    { id: 'bad', type: 'new', title: 'Bad', description: 'bad', date: 'July 1, 2026' },
  ]
  expect(() => buildAtomFeed(bad)).toThrow(/not a valid/)
})
