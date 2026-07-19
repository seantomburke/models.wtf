import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { PixelClassifier } from './PixelClassifier'
import {
  PIXEL_COUNT,
  RAW_WEIGHTS,
  WEIGHTS,
  classify,
  patternE,
  patternThree,
} from './pixelClassifierModel'

describe('pixelClassifierModel', () => {
  it('has one weight per pixel', () => {
    expect(RAW_WEIGHTS).toHaveLength(PIXEL_COUNT)
    expect(WEIGHTS).toHaveLength(PIXEL_COUNT)
  })

  it('squashes weights into 0-1 with 0.5 as neutral', () => {
    for (let i = 0; i < PIXEL_COUNT; i++) {
      expect(WEIGHTS[i]).toBeGreaterThanOrEqual(0)
      expect(WEIGHTS[i]).toBeLessThanOrEqual(1)
      if (RAW_WEIGHTS[i] === 0) expect(WEIGHTS[i]).toBe(0.5)
      if (RAW_WEIGHTS[i] > 0) expect(WEIGHTS[i]).toBeGreaterThan(0.5)
      if (RAW_WEIGHTS[i] < 0) expect(WEIGHTS[i]).toBeLessThan(0.5)
    }
  })

  it('classifies the example 3 as a 3 with high confidence', () => {
    const result = classify(patternThree())
    expect(result.prediction).toBe('3')
    expect(result.confidence).toBeGreaterThan(0.8)
    expect(result.probThree + result.probE).toBeCloseTo(1)
  })

  it('classifies the example E as an E with high confidence', () => {
    const result = classify(patternE())
    expect(result.prediction).toBe('E')
    expect(result.confidence).toBeGreaterThan(0.8)
  })

  it('is maximally uncertain on an empty grid', () => {
    const result = classify(Array(PIXEL_COUNT).fill(false))
    expect(result.probThree).toBeCloseTo(0.5)
    expect(result.probE).toBeCloseTo(0.5)
  })
})

describe('PixelClassifier', () => {
  it('renders the drawing grid with 64 pixels', () => {
    render(<PixelClassifier />)
    expect(screen.getByLabelText('Pixel 0')).toBeInTheDocument()
    expect(screen.getByLabelText(`Pixel ${PIXEL_COUNT - 1}`)).toBeInTheDocument()
  })

  it('shows the 64 weights as a heatmap with a legend', () => {
    render(<PixelClassifier />)
    expect(screen.getByText("The classifier's 64 weights")).toBeInTheDocument()
    expect(screen.getByText(/ink here says "3"/)).toBeInTheDocument()
    expect(screen.getByText(/ink here says "E"/)).toBeInTheDocument()
  })

  it('shows the network diagram with 64 inputs and 2 outputs', () => {
    render(<PixelClassifier />)
    expect(
      screen.getByRole('img', {
        name: 'Neural network with 64 pixel inputs connected to two outputs, 3 and E',
      })
    ).toBeInTheDocument()
  })

  it('disables the run button until something is drawn', () => {
    render(<PixelClassifier />)
    const runButton = screen.getByRole('button', { name: /Run the network/ })
    expect(runButton).toBeDisabled()

    fireEvent.click(screen.getByRole('button', { name: 'Example: 3' }))
    expect(runButton).toBeEnabled()
  })

  it('predicts 3 from the example 3 drawing', () => {
    render(<PixelClassifier />)
    fireEvent.click(screen.getByRole('button', { name: 'Example: 3' }))
    expect(screen.getByText('3', { selector: '.text-2xl' })).toBeInTheDocument()
  })
})
