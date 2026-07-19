#!/usr/bin/env node

/**
 * Generate sitemap.xml for all hardcoded routes in the Models.fyi static site.
 * Runs as part of the build process after prerender.mjs.
 *
 * Routes included:
 * - / (home)
 * - /compare
 * - /graph
 * - /calculator
 * - /quiz
 * - /learn
 * - /learn/:slug for each Learn topic
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { routeMeta, canonicalUrl } from '../dist-server/entry-server.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(__dirname, '..')

/**
 * Build the complete sitemap XML.
 */
function generateSitemap() {
  const buildDate = new Date().toISOString().split('T')[0] // YYYY-MM-DD

  // Use routeMeta to get all routes dynamically
  // Define changefreq based on route type
  const getChangefreq = (path) => {
    if (path === '/') return 'weekly'
    if (path.startsWith('/learn/')) return 'monthly'
    return 'monthly'
  }

  // Define all routes from routeMeta: [path, changefreq]
  const routes = routeMeta.map(r => [r.path, getChangefreq(r.path)])

  // Build XML entries
  const urlEntries = routes.map(([path, changefreq]) => {
    // Trailing-slash form: GitHub Pages 301s the slashless URL, and sitemap
    // entries must be the URLs that return 200 (see canonicalUrl).
    const loc = canonicalUrl(path)
    return `  <url>
    <loc>${loc}</loc>
    <lastmod>${buildDate}</lastmod>
    <changefreq>${changefreq}</changefreq>
  </url>`
  }).join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>`

  return xml
}

/**
 * Main entry point: write sitemap to dist/sitemap.xml
 */
function main() {
  try {
    const distDir = path.resolve(projectRoot, 'dist')

    // Ensure dist directory exists
    if (!fs.existsSync(distDir)) {
      fs.mkdirSync(distDir, { recursive: true })
    }

    const sitemapPath = path.resolve(distDir, 'sitemap.xml')
    const sitemapContent = generateSitemap()

    fs.writeFileSync(sitemapPath, sitemapContent, 'utf-8')

    console.log(`✓ Generated sitemap: ${sitemapPath}`)
    console.log(`  Build date: ${new Date().toISOString().split('T')[0]}`)

  } catch (error) {
    console.error('✗ Error generating sitemap:', error.message)
    process.exit(1)
  }
}

main()
