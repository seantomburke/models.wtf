import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { DigitClassifier } from './DigitClassifier'
import {
  DIGITS,
  DIGIT_SEGMENTS,
  HIDDEN_WEIGHTS,
  OUTPUT_WEIGHTS,
  PIXEL_COUNT,
  SEGMENTS,
  SEGMENT_COUNT,
  classifyDigit,
  digitPattern,
} from './digitClassifierModel'

describe('digitClassifierModel', () => {
  it('has 7 stroke detectors with disjoint pixels', () => {
    expect(SEGMENTS).toHaveLength(SEGMENT_COUNT)
    const seen = new Set<number>()
    for (const seg of SEGMENTS) {
      for (const i of seg.pixels) {
        expect(seen.has(i)).toBe(false)
        seen.add(i)
      }
    }
  })

  it('has one hidden-weight row per detector and one output-weight row per digit', () => {
    expect(HIDDEN_WEIGHTS).toHaveLength(SEGMENT_COUNT)
    for (const row of HIDDEN_WEIGHTS) expect(row).toHaveLength(PIXEL_COUNT)
    expect(OUTPUT_WEIGHTS).toHaveLength(10)
    for (const row of OUTPUT_WEIGHTS) expect(row).toHaveLength(SEGMENT_COUNT)
  })

  it.each(DIGITS.map((d) => [d]))('classifies the example %i decisively', (digit) => {
    const result = classifyDigit(digitPattern(digit))
    expect(result.prediction).toBe(digit)
    expect(result.confidence).toBeGreaterThan(0.9)
  })

  it('produces probabilities that sum to 1', () => {
    const result = classifyDigit(digitPattern(4))
    expect(result.probs.reduce((a, b) => a + b, 0)).toBeCloseTo(1)
  })

  it('fires exactly the drawn strokes in the hidden layer', () => {
    const result = classifyDigit(digitPattern(7))
    result.hidden.forEach((h, j) => {
      if (DIGIT_SEGMENTS[7].includes(j)) {
        expect(h).toBeGreaterThan(0.9)
      } else {
        expect(h).toBeLessThan(0.1)
      }
    })
  })

  it('loses confidence when a stroke goes missing', () => {
    const complete = classifyDigit(digitPattern(8))
    const pixels = digitPattern(8)
    // Erase the middle bar: the drawing now matches a 0 better than an 8.
    for (const i of SEGMENTS[3].pixels) pixels[i] = false
    const damaged = classifyDigit(pixels)
    expect(damaged.prediction).toBe(0)
    expect(damaged.probs[8]).toBeLessThan(complete.probs[8])
  })
})

describe('DigitClassifier', () => {
  it('renders the drawing grid with 64 pixels', () => {
    render(<DigitClassifier />)
    expect(screen.getByLabelText('Pixel 0')).toBeInTheDocument()
    expect(screen.getByLabelText(`Pixel ${PIXEL_COUNT - 1}`)).toBeInTheDocument()
  })

  it('shows all seven stroke detectors with their names', () => {
    render(<DigitClassifier />)
    for (const seg of SEGMENTS) {
      expect(screen.getByRole('img', { name: `${seg.name} detector weights` })).toBeInTheDocument()
    }
  })

  it('shows the network diagram with three layers', () => {
    render(<DigitClassifier />)
    expect(
      screen.getByRole('img', {
        name: 'Neural network with 64 pixel inputs, 7 stroke detectors, and 10 digit outputs',
      })
    ).toBeInTheDocument()
  })

  it('disables the run button until something is drawn', () => {
    render(<DigitClassifier />)
    const runButton = screen.getByRole('button', { name: /Run the network/ })
    expect(runButton).toBeDisabled()

    fireEvent.click(screen.getByRole('button', { name: 'Example: 3' }))
    expect(runButton).toBeEnabled()
  })

  it('predicts 5 from the example 5 drawing', () => {
    render(<DigitClassifier />)
    fireEvent.click(screen.getByRole('button', { name: 'Example: 5' }))
    expect(screen.getByText('5', { selector: '.text-2xl' })).toBeInTheDocument()
  })
})
