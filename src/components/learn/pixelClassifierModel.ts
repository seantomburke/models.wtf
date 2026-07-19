/**
 * A real (tiny) single-layer classifier that tells "3" from "E" on an 8x8 grid.
 *
 * The 64 weights come straight from the two reference patterns: a pixel only a
 * 3 uses gets a positive weight, a pixel only an E uses gets a negative weight,
 * and pixels the two shapes share (or neither uses) stay neutral. Squashing a
 * weight through sigmoid maps it to 0–1, which is what the weight heatmap shows:
 * 1 = green (evidence for 3), 0 = red (evidence for E), 0.5 = transparent.
 */

export const GRID_SIZE = 8
export const PIXEL_COUNT = GRID_SIZE * GRID_SIZE

function emptyGrid(): boolean[] {
  return Array(PIXEL_COUNT).fill(false)
}

export function patternThree(): boolean[] {
  const p = emptyGrid()
  // Top bar
  for (let col = 1; col < 6; col++) p[col] = true
  // Top-right curve
  p[1 * GRID_SIZE + 6] = true
  p[2 * GRID_SIZE + 6] = true
  // Middle bar
  for (let col = 2; col < 6; col++) p[4 * GRID_SIZE + col] = true
  // Bottom-right curve
  p[5 * GRID_SIZE + 6] = true
  p[6 * GRID_SIZE + 6] = true
  // Bottom bar
  for (let col = 1; col < 6; col++) p[7 * GRID_SIZE + col] = true
  return p
}

export function patternE(): boolean[] {
  const p = emptyGrid()
  // Left edge, two pixels wide
  for (let row = 0; row < GRID_SIZE; row++) {
    p[row * GRID_SIZE] = true
    p[row * GRID_SIZE + 1] = true
  }
  // Top, middle, and bottom bars
  for (let col = 1; col < 6; col++) p[col] = true
  for (let col = 1; col < 6; col++) p[4 * GRID_SIZE + col] = true
  for (let col = 1; col < 6; col++) p[7 * GRID_SIZE + col] = true
  return p
}

export function sigmoid(x: number): number {
  return 1 / (1 + Math.exp(-x))
}

const three = patternThree()
const e = patternE()

/** +1 where only a 3 has ink, -1 where only an E has ink, 0 where they agree. */
export const RAW_WEIGHTS: number[] = three.map((on, i) => (on ? 1 : 0) - (e[i] ? 1 : 0))

/** The same weights squashed through sigmoid into 0–1 for display. */
export const WEIGHTS: number[] = RAW_WEIGHTS.map((w) => sigmoid(w * 2))

export interface Classification {
  prediction: '3' | 'E'
  /** Probability of the winning class, 0.5–1. */
  confidence: number
  probThree: number
  probE: number
  /** Raw weighted sum before sigmoid. Positive favors 3, negative favors E. */
  score: number
}

const SCORE_SCALE = 0.6

export function classify(pixels: boolean[]): Classification {
  const score = pixels.reduce((sum, on, i) => sum + (on ? RAW_WEIGHTS[i] : 0), 0)
  const probThree = sigmoid(score * SCORE_SCALE)
  const probE = 1 - probThree
  return {
    prediction: probThree >= probE ? '3' : 'E',
    confidence: Math.max(probThree, probE),
    probThree,
    probE,
    score,
  }
}
