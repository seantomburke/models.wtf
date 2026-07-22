#!/usr/bin/env node

/**
 * Generate an Atom feed (dist/feed.xml) from the release log in
 * src/data/releases.ts, so readers can subscribe to model releases and
 * pricing changes instead of re-visiting /whats-new by hand.
 *
 * Runs as part of the build after prerender.mjs, importing the compiled
 * server bundle like generate-sitemap.mjs does. The feed-building logic
 * lives in src/lib/feed.ts (unit-tested in src/lib/feed.test.ts).
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { releases, buildAtomFeed } from '../dist-server/entry-server.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(__dirname, '..')

function main() {
  try {
    const distDir = path.resolve(projectRoot, 'dist')
    if (!fs.existsSync(distDir)) fs.mkdirSync(distDir, { recursive: true })

    const xml = buildAtomFeed(releases)
    // Guard the invariants a feed reader depends on before writing anything.
    const entryCount = (xml.match(/<entry>/g) ?? []).length
    if (entryCount !== releases.length) {
      throw new Error(`feed has ${entryCount} entries for ${releases.length} releases`)
    }
    if (/<(id|title|updated)>\s*<\//.test(xml)) {
      throw new Error('feed contains an empty required Atom element')
    }

    const feedPath = path.resolve(distDir, 'feed.xml')
    fs.writeFileSync(feedPath, xml, 'utf-8')
    console.log(`✓ Generated Atom feed: ${feedPath} (${entryCount} entries)`)
  } catch (error) {
    console.error('✗ Error generating feed:', error.message)
    process.exit(1)
  }
}

main()
