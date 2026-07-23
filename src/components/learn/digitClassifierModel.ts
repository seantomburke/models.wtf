/**
 * A real (tiny) two-layer network that reads the digits 0-9 on an 8x8 grid.
 *
 * Layer 1 (64 pixels → 7 hidden neurons): each hidden neuron is a "stroke
 * detector". Its weights are 1/size on the pixels of one stroke (a bar or a
 * vertical line, laid out like a seven-segment display) and 0 everywhere
 * else, with a -0.5 bias. Squashed through a steep sigmoid, the neuron fires
 * (≈1) when most of its stroke is drawn and stays quiet (≈0) when it isn't.
 *
 * Layer 2 (7 hidden → 10 outputs): each digit output has weight +1 on the
 * strokes that digit uses and -1 on the strokes it doesn't. A lit stroke is
 * evidence for every digit that contains it and against every digit that
 * doesn't; a dark stroke is the reverse. Softmax turns the ten scores into
 * probabilities.
 */

export const GRID_SIZE = 8
export const PIXEL_COUNT = GRID_SIZE * GRID_SIZE
export const DIGITS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] as const

function px(row: number, col: number): number {
  return row * GRID_SIZE + col
}

function bar(row: number): number[] {
  return [px(row, 2), px(row, 3), px(row, 4), px(row, 5)]
}

function vertical(col: number, fromRow: number, toRow: number): number[] {
  const pixels: number[] = []
  for (let row = fromRow; row <= toRow; row++) pixels.push(px(row, col))
  return pixels
}

export interface StrokeSegment {
  /** Human name shown next to every colored mark. */
  name: string
  /** CSS custom property carrying this stroke's categorical color. */
  color: string
  /** Pixel indices this detector watches (weight 1/size each). */
  pixels: number[]
}

/** The 7 stroke detectors of the hidden layer, top-to-bottom. */
export const SEGMENTS: StrokeSegment[] = [
  { name: 'Top bar', color: 'var(--color-seg-1)', pixels: bar(0) },
  { name: 'Upper-left line', color: 'var(--color-seg-2)', pixels: vertical(1, 1, 3) },
  { name: 'Upper-right line', color: 'var(--color-seg-3)', pixels: vertical(6, 1, 3) },
  { name: 'Middle bar', color: 'var(--color-seg-4)', pixels: bar(3) },
  { name: 'Lower-left line', color: 'var(--color-seg-5)', pixels: vertical(1, 4, 6) },
  { name: 'Lower-right line', color: 'var(--color-seg-6)', pixels: vertical(6, 4, 6) },
  { name: 'Bottom bar', color: 'var(--color-seg-7)', pixels: bar(7) },
]

export const SEGMENT_COUNT = SEGMENTS.length

/** Which strokes make up each digit (indices into SEGMENTS). */
export const DIGIT_SEGMENTS: number[][] = [
  [0, 1, 2, 4, 5, 6], // 0
  [2, 5], // 1
  [0, 2, 3, 4, 6], // 2
  [0, 2, 3, 5, 6], // 3
  [1, 2, 3, 5], // 4
  [0, 1, 3, 5, 6], // 5
  [0, 1, 3, 4, 5, 6], // 6
  [0, 2, 5], // 7
  [0, 1, 2, 3, 4, 5, 6], // 8
  [0, 1, 2, 3, 5, 6], // 9
]

/** Layer-1 weights: [segment][pixel], 1/size inside the stroke, 0 outside. */
export const HIDDEN_WEIGHTS: number[][] = SEGMENTS.map((seg) => {
  const row = Array(PIXEL_COUNT).fill(0)
  for (const i of seg.pixels) row[i] = 1 / seg.pixels.length
  return row
})

/** Layer-2 weights: [digit][segment], +1 if the digit uses the stroke, -1 if not. */
export const OUTPUT_WEIGHTS: number[][] = DIGIT_SEGMENTS.map((segs) =>
  SEGMENTS.map((_, j) => (segs.includes(j) ? 1 : -1))
)

/** The reference drawing of a digit: the union of its strokes' pixels. */
export function digitPattern(digit: number): boolean[] {
  const pixels = Array(PIXEL_COUNT).fill(false)
  for (const j of DIGIT_SEGMENTS[digit]) {
    for (const i of SEGMENTS[j].pixels) pixels[i] = true
  }
  return pixels
}

export function sigmoid(x: number): number {
  return 1 / (1 + Math.exp(-x))
}

/** How sharply a stroke detector switches from off to on. */
const HIDDEN_STEEPNESS = 8
const HIDDEN_BIAS = -0.5

/**
 * Softmax temperature for the output layer. Scores sit at most ~2 apart
 * between a digit and its nearest rival, which left a perfect drawing of an
 * 8 at only ~66% confidence; sharpening the softmax keeps the ranking
 * identical but lets exact matches win decisively.
 */
const OUTPUT_STEEPNESS = 2

export interface DigitClassification {
  prediction: number
  /** Probability of the winning digit. */
  confidence: number
  /** Softmax probability per digit, indexed 0-9. */
  probs: number[]
  /** Hidden-layer activations per stroke detector, 0-1. */
  hidden: number[]
  /** Fraction of each stroke's pixels that are drawn, 0-1. */
  coverage: number[]
  /** Raw output scores before softmax. */
  scores: number[]
}

export function classifyDigit(pixels: boolean[]): DigitClassification {
  const coverage = SEGMENTS.map(
    (seg) => seg.pixels.filter((i) => pixels[i]).length / seg.pixels.length
  )
  const hidden = coverage.map((c) => sigmoid(HIDDEN_STEEPNESS * (c + HIDDEN_BIAS)))
  // Center activations to [-1, 1] so a quiet detector is evidence *against*
  // digits that need its stroke, not just an absence of evidence.
  const centered = hidden.map((h) => 2 * h - 1)
  const scores = OUTPUT_WEIGHTS.map((row) => row.reduce((sum, w, j) => sum + w * centered[j], 0))

  const max = Math.max(...scores)
  const exps = scores.map((s) => Math.exp(OUTPUT_STEEPNESS * (s - max)))
  const total = exps.reduce((a, b) => a + b, 0)
  const probs = exps.map((e) => e / total)

  let prediction = 0
  probs.forEach((p, d) => {
    if (p > probs[prediction]) prediction = d
  })

  return { prediction, confidence: probs[prediction], probs, hidden, coverage, scores }
}
