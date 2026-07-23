import { describe, it, expect } from 'vitest'
import {
  EPOCHS,
  GRID_SIZE,
  PIXEL_COUNT,
  TRAINING_RUN,
  TRAINING_SAMPLES_PER_CLASS,
  TRAINING_SET,
  buildTrainingSet,
  makeRandom,
  classifyWithLearnedWeights,
  predictWith,
  trainGradientDescent,
} from './gradientDescent'

describe('makeRandom', () => {
  it('is deterministic for a given seed and produces values in [0, 1)', () => {
    const a = makeRandom(42)
    const b = makeRandom(42)
    for (let i = 0; i < 50; i++) {
      const v = a()
      expect(v).toBe(b())
      expect(v).toBeGreaterThanOrEqual(0)
      expect(v).toBeLessThan(1)
    }
  })

  it('produces different streams for different seeds', () => {
    expect(makeRandom(1)()).not.toBe(makeRandom(2)())
  })
})

describe('training set', () => {
  it('provides 25 seeded examples for each label', () => {
    expect(TRAINING_SET).toHaveLength(TRAINING_SAMPLES_PER_CLASS * 2)
    expect(TRAINING_SET.filter((example) => example.target === 1)).toHaveLength(TRAINING_SAMPLES_PER_CLASS)
    expect(TRAINING_SET.filter((example) => example.target === 0)).toHaveLength(TRAINING_SAMPLES_PER_CLASS)
  })

  it('has balanced 3 and E examples, each 64 pixels wide', () => {
    expect(TRAINING_SET.length).toBeGreaterThanOrEqual(10)
    for (const ex of TRAINING_SET) {
      expect(ex.pixels).toHaveLength(PIXEL_COUNT)
      expect([0, 1]).toContain(ex.target)
    }
    const threes = TRAINING_SET.filter((ex) => ex.target === 1).length
    expect(threes).toBe(TRAINING_SET.length - threes)
  })

  it('is deterministic for a seed and different across seeds', () => {
    expect(buildTrainingSet(123)).toEqual(buildTrainingSet(123))
    const a = buildTrainingSet(123).map((ex) => ex.pixels)
    const b = buildTrainingSet(456).map((ex) => ex.pixels)
    expect(a).not.toEqual(b)
  })

  it('draws connected strokes with no isolated noise pixels', () => {
    const neighbours = (pixels: boolean[], index: number) => {
      const row = Math.floor(index / GRID_SIZE)
      const col = index % GRID_SIZE
      let count = 0
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue
          const r = row + dr
          const c = col + dc
          if (r >= 0 && r < GRID_SIZE && c >= 0 && c < GRID_SIZE && pixels[r * GRID_SIZE + c]) count++
        }
      }
      return count
    }
    for (const ex of TRAINING_SET) {
      for (let i = 0; i < PIXEL_COUNT; i++) {
        if (ex.pixels[i]) expect(neighbours(ex.pixels, i)).toBeGreaterThan(0)
      }
    }
  })

  it('gives every glyph the telltale spine of its own letter', () => {
    // An E's leftmost inked column is a solid vertical stroke; a 3's is not —
    // its left side is just the bar tips. That structural difference is what
    // makes the drawings read as letters rather than noise.
    const columnRuns = (pixels: boolean[], col: number) => {
      const rows: number[] = []
      for (let row = 0; row < GRID_SIZE; row++) {
        if (pixels[row * GRID_SIZE + col]) rows.push(row)
      }
      return rows
    }
    for (const ex of TRAINING_SET) {
      let leftCol = 0
      while (leftCol < GRID_SIZE && columnRuns(ex.pixels, leftCol).length === 0) leftCol++
      const rows = columnRuns(ex.pixels, leftCol)
      const solid = rows.length === rows[rows.length - 1] - rows[0] + 1 && rows.length >= 6
      if (ex.target === 0) {
        expect(solid).toBe(true)
      } else {
        expect(rows.length).toBeLessThanOrEqual(4)
      }
    }
  })

  it('varies enough that the model has something to learn', () => {
    const unique = new Set(TRAINING_SET.map((ex) => ex.pixels.map((p) => (p ? 1 : 0)).join('')))
    expect(unique.size).toBeGreaterThan(TRAINING_SET.length * 0.8)
    // Drawings move around the grid: not every sample lights the same columns.
    const firstInk = (ex: { pixels: boolean[] }) =>
      Math.min(...ex.pixels.map((p, i) => (p ? i % GRID_SIZE : GRID_SIZE)))
    const leftEdges = new Set(TRAINING_SET.map(firstInk))
    expect(leftEdges.size).toBeGreaterThan(1)
  })
})

describe('trainGradientDescent', () => {
  it('records one snapshot per epoch plus the random starting point', () => {
    expect(TRAINING_RUN.history).toHaveLength(EPOCHS + 1)
    expect(TRAINING_RUN.lossCurve).toHaveLength(EPOCHS + 1)
    TRAINING_RUN.history.forEach((snap, i) => {
      expect(snap.epoch).toBe(i)
      expect(snap.weights).toHaveLength(PIXEL_COUNT)
      expect(Number.isFinite(snap.loss)).toBe(true)
      expect(snap.accuracy).toBeGreaterThanOrEqual(0)
      expect(snap.accuracy).toBeLessThanOrEqual(1)
      expect(Number.isFinite(snap.bias)).toBe(true)
    })
    expect(TRAINING_RUN.finalWeights).toEqual(TRAINING_RUN.history[EPOCHS].weights)
    expect(TRAINING_RUN.bias).toBe(TRAINING_RUN.history[EPOCHS].bias)
  })

  it('starts from small random weights, not from the answer', () => {
    for (const w of TRAINING_RUN.initialWeights) {
      expect(Math.abs(w)).toBeLessThan(0.31)
    }
    // A random start cannot already classify the training set.
    const start = TRAINING_RUN.history[0]
    expect(start.loss).toBeGreaterThan(0.4)
  })

  it('drives the loss down and keeps it going down', () => {
    const { lossCurve } = TRAINING_RUN
    expect(lossCurve[lossCurve.length - 1]).toBeLessThan(lossCurve[0] * 0.4)

    // Full-batch gradient descent at this learning rate should never step uphill.
    for (let i = 1; i < lossCurve.length; i++) {
      expect(lossCurve[i]).toBeLessThanOrEqual(lossCurve[i - 1] + 1e-9)
    }
  })

  it('classifies every training pattern correctly once trained', () => {
    const { finalWeights, bias } = TRAINING_RUN
    for (const ex of TRAINING_SET) {
      const p = predictWith(finalWeights, bias, ex.pixels)
      expect(p >= 0.5 ? 1 : 0).toBe(ex.target)
    }
    expect(TRAINING_RUN.history[EPOCHS].accuracy).toBe(1)
  })

  it('turns the learned run into drawable E-vs-3 predictions', () => {
    const three = TRAINING_SET.find((example) => example.label === 'Clean 3')!
    const e = TRAINING_SET.find((example) => example.label === 'Clean E')!
    expect(
      classifyWithLearnedWeights(TRAINING_RUN.finalWeights, TRAINING_RUN.bias, three.pixels)
        .prediction
    ).toBe('3')
    expect(
      classifyWithLearnedWeights(TRAINING_RUN.finalWeights, TRAINING_RUN.bias, e.pixels).prediction
    ).toBe('E')
  })

  it('converges: the weights stop moving much by the end', () => {
    const { history } = TRAINING_RUN
    const move = (a: number, b: number) =>
      history[a].weights.reduce((sum, w, i) => sum + Math.abs(w - history[b].weights[i]), 0)
    const early = move(1, 0)
    const late = move(EPOCHS, EPOCHS - 1)
    expect(late).toBeLessThan(early)
  })

  it('is reproducible for the same seed and different for another', () => {
    const a = trainGradientDescent({ seed: 7, epochs: 20 })
    const b = trainGradientDescent({ seed: 7, epochs: 20 })
    expect(a.finalWeights).toEqual(b.finalWeights)
    expect(a.lossCurve).toEqual(b.lossCurve)

    const c = trainGradientDescent({ seed: 8, epochs: 20 })
    expect(c.initialWeights).not.toEqual(a.initialWeights)
  })

  it('learns faster with a bigger learning rate', () => {
    const slow = trainGradientDescent({ epochs: 25, learningRate: 0.05 })
    const fast = trainGradientDescent({ epochs: 25, learningRate: 0.5 })
    expect(fast.lossCurve[25]).toBeLessThan(slow.lossCurve[25])
  })

  it('rejects invalid training and prediction inputs with useful boundaries', () => {
    expect(() => trainGradientDescent({ seed: Number.NaN })).toThrow(/Seed/)
    expect(() => trainGradientDescent({ seed: Number.MAX_VALUE })).toThrow(/Seed/)
    expect(() => trainGradientDescent({ epochs: -1 })).toThrow(/Epochs/)
    expect(() => trainGradientDescent({ learningRate: 0 })).toThrow(/Learning rate/)
    expect(() => trainGradientDescent({ data: [] })).toThrow(/must not be empty/)
    expect(() =>
      trainGradientDescent({
        data: [{ label: 'broken', pixels: [true], target: 1 }],
      })
    ).toThrow(/64 pixels/)
    expect(() => classifyWithLearnedWeights([1], 0, [true])).toThrow(/64 weights and pixels/)
  })
})
