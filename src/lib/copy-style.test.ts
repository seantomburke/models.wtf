import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'

/**
 * Enforces the hard bans in .agents/rules/writing-style.md across the repo:
 *
 * 1. No em dashes (U+2014) or en dashes (U+2013) anywhere: prose, UI strings,
 *    code comments, docs. The one exception is the standalone em dash used as
 *    an empty-cell placeholder glyph (the dash by itself in a string literal or
 *    JSX cell), which is data display rather than prose.
 * 2. No same-sentence "X, not Y" contrast framing in user-facing prose
 *    surfaces. State the claim directly; if the contrast is essential, give
 *    the negation its own sentence.
 *
 * scripts/check-agent-config.mjs covers the agent guidance docs; this test
 * covers the application source and content.
 */

const ROOT = join(__dirname, '..', '..')

/** Directories the dash scan walks. */
const SCAN_DIRS = ['src', 'scripts']
const SCAN_EXTENSIONS = /\.(ts|tsx|mjs|css|md|html)$/

// Written as escapes so this file itself carries no literal dash characters.
const EM_DASH = '\u2014'
const EN_DASH = '\u2013'
const ANY_DASH = new RegExp(`[${EM_DASH}${EN_DASH}]`)

/**
 * Lines allowed to contain an em dash: the standalone placeholder glyph in
 * its recognized shapes (an empty-cell marker in a string literal or JSX
 * cell), including the detection literal in check-agent-config.mjs.
 */
const PLACEHOLDER_GLYPH = new RegExp(`(['"\`])${EM_DASH}\\1|>${EM_DASH}<`, 'g')

/** Prose surfaces the negation-contrast heuristic runs over. */
const PROSE_FILES = [
  'src/data/glossary.ts',
  'src/data/faqs.ts',
  'src/data/models.ts',
  'src/data/benchmarks.ts',
  'src/data/releases.ts',
  'src/data/providers.ts',
  'src/pages/learn/topics.ts',
  'src/pages/learn/topicProse.ts',
  'src/lib/routeMeta.ts',
  'src/lib/quiz.ts',
]

/**
 * ", not X" and "not just X but Y" in a string literal. The heuristic only
 * looks inside quoted strings so code (negations in conditions, comments
 * about behavior) never trips it.
 */
const CONTRAST_PATTERNS = [/,\s+not\s+[a-z"']/i, /\bnot\s+(?:just|only|merely|simply)\b[^.!?]*\bbut\b/i]

/**
 * Deliberate negations where the contrast carries essential meaning and has
 * no direct restatement. Keyed by an exact substring of the allowed sentence.
 * Keep this list short; every entry needs a reason.
 */
const ALLOWED_CONTRASTS: string[] = [
  // "closed-book, not tool-assisted" style protocol qualifiers in score
  // provenance notes are factual disambiguation, added here if ever needed.
]

function walk(dir: string): string[] {
  const out: string[] = []
  for (const entry of readdirSync(dir)) {
    if (entry === 'node_modules' || entry === 'dist') continue
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) out.push(...walk(full))
    else if (SCAN_EXTENSIONS.test(entry)) out.push(full)
  }
  return out
}

test('no em or en dashes outside the placeholder glyph', () => {
  const violations: string[] = []
  for (const dir of SCAN_DIRS) {
    for (const file of walk(join(ROOT, dir))) {
      const lines = readFileSync(file, 'utf8').split('\n')
      lines.forEach((line, i) => {
        if (!ANY_DASH.test(line)) return
        // A line whose only dashes are placeholder glyphs is fine.
        const stripped = line.replace(PLACEHOLDER_GLYPH, '')
        if (ANY_DASH.test(stripped)) {
          violations.push(`${file.slice(ROOT.length + 1)}:${i + 1} ${line.trim().slice(0, 90)}`)
        }
      })
    }
  }
  expect(violations).toEqual([])
})

/** Extract the contents of every string literal in a source file. */
function stringLiterals(source: string): Array<{ text: string; line: number }> {
  const out: Array<{ text: string; line: number }> = []
  const re = /(['"`])((?:\\.|(?!\1)[^\\\n])*)\1/g
  const lineOf = (index: number) => source.slice(0, index).split('\n').length
  for (const m of source.matchAll(re)) {
    if (m[2].length > 20) out.push({ text: m[2], line: lineOf(m.index) })
  }
  return out
}

test('prose surfaces avoid same-sentence contrast framing', () => {
  const violations: string[] = []
  for (const rel of PROSE_FILES) {
    const source = readFileSync(join(ROOT, rel), 'utf8')
    for (const { text, line } of stringLiterals(source)) {
      if (ALLOWED_CONTRASTS.some((allowed) => text.includes(allowed))) continue
      for (const pattern of CONTRAST_PATTERNS) {
        if (pattern.test(text)) {
          violations.push(`${rel}:${line} "${text.slice(0, 90)}"`)
          break
        }
      }
    }
  }
  expect(violations).toEqual([])
})
