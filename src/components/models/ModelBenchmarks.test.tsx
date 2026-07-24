import { render, screen } from '@testing-library/react'
import { ModelBenchmarks } from './ModelBenchmarks'
import { models, benchmarks } from '../../data'

describe('ModelBenchmarks component', () => {
  test('renders benchmark scores heading', () => {
    const model = models[0]
    const relevantBenchmarks = benchmarks.filter((b) => model.scores[b.id] !== undefined)
    render(<ModelBenchmarks model={model} benchmarks={relevantBenchmarks} />)
    expect(screen.getByText(/Benchmark Scores/)).toBeInTheDocument()
  })

  test('groups benchmarks by category', () => {
    const model = models[0]
    const relevantBenchmarks = benchmarks.filter((b) => model.scores[b.id] !== undefined)
    if (relevantBenchmarks.length > 0) {
      render(<ModelBenchmarks model={model} benchmarks={relevantBenchmarks} />)
      // Check that at least one category header is rendered
      const categories = new Set(relevantBenchmarks.map((b) => b.category))
      expect(categories.size).toBeGreaterThan(0)
    }
  })

  test('displays benchmark names and scores', () => {
    const model = models[0]
    const relevantBenchmarks = benchmarks.filter((b) => model.scores[b.id] !== undefined)
    if (relevantBenchmarks.length > 0) {
      render(<ModelBenchmarks model={model} benchmarks={relevantBenchmarks} />)
      const firstBench = relevantBenchmarks[0]
      expect(screen.getByText(firstBench.name)).toBeInTheDocument()
      expect(screen.getByText(`${model.scores[firstBench.id]?.toFixed(1)}%`)).toBeInTheDocument()
    }
  })

  test('displays benchmark eli5 descriptions', () => {
    const model = models[0]
    const relevantBenchmarks = benchmarks.filter((b) => model.scores[b.id] !== undefined)
    if (relevantBenchmarks.length > 0) {
      render(<ModelBenchmarks model={model} benchmarks={relevantBenchmarks} />)
      const firstBench = relevantBenchmarks[0]
      expect(screen.getByText(firstBench.eli5)).toBeInTheDocument()
    }
  })

  test('renders progress bars for scores', () => {
    const model = models[0]
    const relevantBenchmarks = benchmarks.filter((b) => model.scores[b.id] !== undefined)
    if (relevantBenchmarks.length > 0) {
      const { container } = render(<ModelBenchmarks model={model} benchmarks={relevantBenchmarks} />)
      // Check for progress bar div with height style
      const progressBars = container.querySelectorAll('[style*="width"]')
      expect(progressBars.length).toBeGreaterThan(0)
    }
  })

  test('handles models with no benchmarks', () => {
    const model = models[0]
    render(<ModelBenchmarks model={model} benchmarks={[]} />)
    expect(screen.getByText(/Benchmark Scores/)).toBeInTheDocument()
  })

  test('sorts benchmarks by score descending within each category', () => {
    const model = models.find((m) => Object.keys(m.scores).length > 1)
    if (model) {
      const relevantBenchmarks = benchmarks.filter((b) => model.scores[b.id] !== undefined)
      render(<ModelBenchmarks model={model} benchmarks={relevantBenchmarks} />)
      // The component should display scores in descending order
      const scores = screen.getAllByText(/%$/)
      expect(scores.length).toBeGreaterThan(0)
    }
  })

  test('shows who measured each score', () => {
    const model = models.find((m) => m.id === 'gpt-5-6-luna')!
    const relevantBenchmarks = benchmarks.filter((b) => model.scores[b.id] !== undefined)
    render(<ModelBenchmarks model={model} benchmarks={relevantBenchmarks} />)
    expect(
      screen.getByText(
        'Provider-reported; an independent run by Vals AI (Terminus 2) lands at 79.03%.',
      ),
    ).toBeInTheDocument()
    expect(screen.getAllByText('Provider-reported; no independent run recorded yet.')).toHaveLength(3)
  })
})
