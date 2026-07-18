import { render, screen } from '@testing-library/react'
import { ModelSpecs } from './ModelSpecs'
import { models, benchmarks } from '../../data'

describe('ModelSpecs component', () => {
  test('renders pricing section', () => {
    const model = models[0]
    const relevantBenchmarks = benchmarks.filter((b) => model.scores[b.id] !== undefined)
    render(<ModelSpecs model={model} relevantBenchmarks={relevantBenchmarks} />)
    expect(screen.getByText(/Pricing/)).toBeInTheDocument()
    expect(screen.getByText(/Input tokens/)).toBeInTheDocument()
    expect(screen.getByText(/Output tokens/)).toBeInTheDocument()
  })

  test('renders capacity section', () => {
    const model = models[0]
    const relevantBenchmarks = benchmarks.filter((b) => model.scores[b.id] !== undefined)
    render(<ModelSpecs model={model} relevantBenchmarks={relevantBenchmarks} />)
    expect(screen.getByText(/Capacity/)).toBeInTheDocument()
    expect(screen.getByText(/Context window/)).toBeInTheDocument()
  })

  test('formats price correctly for null values', () => {
    const openSourceModel = models.find((m) => m.openSource && m.inputPricePerMTok === null)
    if (openSourceModel) {
      const relevantBenchmarks = benchmarks.filter((b) => openSourceModel.scores[b.id] !== undefined)
      const { container } = render(<ModelSpecs model={openSourceModel} relevantBenchmarks={relevantBenchmarks} />)
      expect(container.textContent).toContain('N/A')
    }
  })

  test('renders capability checklist', () => {
    const model = models[0]
    const relevantBenchmarks = benchmarks.filter((b) => model.scores[b.id] !== undefined)
    render(<ModelSpecs model={model} relevantBenchmarks={relevantBenchmarks} />)
    expect(screen.getByText(/Capabilities/)).toBeInTheDocument()
    expect(screen.getByText(/Reasoning & Planning/)).toBeInTheDocument()
    expect(screen.getByText(/Web Search/)).toBeInTheDocument()
    expect(screen.getByText(/Open Source/)).toBeInTheDocument()
  })

  test('renders top 5 benchmark scores', () => {
    const model = models[0]
    const relevantBenchmarks = benchmarks.filter((b) => model.scores[b.id] !== undefined)
    if (relevantBenchmarks.length > 0) {
      render(<ModelSpecs model={model} relevantBenchmarks={relevantBenchmarks} />)
      expect(screen.getByText(/Best Scores/)).toBeInTheDocument()
      // Should see at least one benchmark score
      const scores = screen.getAllByText(/%$/)
      expect(scores.length).toBeGreaterThan(0)
    }
  })

  test('shows max output tokens when available', () => {
    const modelWithMaxOutput = models.find((m) => m.maxOutputTokens !== undefined)
    if (modelWithMaxOutput) {
      const relevantBenchmarks = benchmarks.filter((b) => modelWithMaxOutput.scores[b.id] !== undefined)
      render(<ModelSpecs model={modelWithMaxOutput} relevantBenchmarks={relevantBenchmarks} />)
      expect(screen.getByText(/Max output/)).toBeInTheDocument()
    }
  })

  test('displays reasoning capability based on model data', () => {
    const reasoningModel = models.find((m) => m.reasoning)
    if (reasoningModel) {
      const relevantBenchmarks = benchmarks.filter((b) => reasoningModel.scores[b.id] !== undefined)
      const { container } = render(<ModelSpecs model={reasoningModel} relevantBenchmarks={relevantBenchmarks} />)
      // Should show checkmark for reasoning
      expect(container.textContent).toContain('Reasoning & Planning')
      expect(container.textContent).toContain('✓')
    }
  })
})
