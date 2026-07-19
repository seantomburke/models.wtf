import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BenchmarkCell } from './BenchmarkCell'
import type { Benchmark } from '../data/types'
import type { ProvenanceDisplay } from '../lib/scoreProvenance'

const mockBenchmark: Benchmark = {
  id: 'gpqa-diamond',
  name: 'Test Benchmark',
  eli5: 'A test benchmark for testing',
  unit: '%',
  category: 'Reasoning',
  sourceUrl: 'https://example.com/test',
  sourceOrganization: 'Test Org',
}

const independentProvenance: ProvenanceDisplay = {
  kind: 'independent',
  label: 'independent run',
  detail: 'Independently measured by vals.ai.',
}

const providerProvenance: ProvenanceDisplay = {
  kind: 'provider',
  label: 'provider-reported',
  detail: 'Provider-reported; no independent run recorded yet.',
}

const divergingProvenance: ProvenanceDisplay = {
  kind: 'provider-diverging',
  label: 'provider-reported',
  detail: 'Provider-reported; an independent run by tbench.ai (Codex) lands at 75.7%.',
}

describe('BenchmarkCell', () => {
  it('renders score with percentage', () => {
    render(<BenchmarkCell benchmark={mockBenchmark} score={85.3} isBest={false} />)
    expect(screen.getByText('85.3%')).toBeInTheDocument()
  })

  it('renders dash for undefined score', () => {
    render(<BenchmarkCell benchmark={mockBenchmark} score={undefined} isBest={false} />)
    expect(screen.getByText('—')).toBeInTheDocument()
  })

  it('shows best score styling', () => {
    const { container } = render(
      <BenchmarkCell benchmark={mockBenchmark} score={95.0} isBest={true} />,
    )
    const td = container.querySelector('td')
    expect(td).toHaveClass('text-accent-deep')
    expect(td).toHaveClass('font-semibold')
  })

  it('renders green dot for independently measured scores', () => {
    render(
      <BenchmarkCell
        benchmark={mockBenchmark}
        score={75.0}
        isBest={false}
        provenance={independentProvenance}
      />,
    )
    const badge = screen.getByTitle('Independently measured by vals.ai.')
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveClass('bg-emerald-500')
  })

  it('renders neutral dot for provider-reported scores', () => {
    render(
      <BenchmarkCell
        benchmark={mockBenchmark}
        score={80.0}
        isBest={false}
        provenance={providerProvenance}
      />,
    )
    const badge = screen.getByTitle('Provider-reported; no independent run recorded yet.')
    expect(badge).toHaveClass('bg-slate-400')
  })

  it('renders amber dot when an independent run diverges', () => {
    render(
      <BenchmarkCell
        benchmark={mockBenchmark}
        score={84.7}
        isBest={false}
        provenance={divergingProvenance}
      />,
    )
    const badge = screen.getByTitle(
      'Provider-reported; an independent run by tbench.ai (Codex) lands at 75.7%.',
    )
    expect(badge).toHaveClass('bg-amber-500')
  })

  it('has proper accessibility labels', () => {
    render(<BenchmarkCell benchmark={mockBenchmark} score={88.5} isBest={false} />)
    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('aria-label')
  })

  it('renders without source URL', () => {
    const benchmarkWithoutSource = { ...mockBenchmark, sourceUrl: undefined }
    render(<BenchmarkCell benchmark={benchmarkWithoutSource} score={75.0} isBest={false} />)
    expect(screen.getByText('75.0%')).toBeInTheDocument()
  })

  it('displays benchmark name with source URL', () => {
    render(<BenchmarkCell benchmark={mockBenchmark} score={90.0} isBest={false} />)
    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('title', expect.stringContaining('Test Benchmark'))
  })

  it('no dot without provenance', () => {
    const { container } = render(
      <BenchmarkCell benchmark={mockBenchmark} score={75.0} isBest={false} />,
    )
    expect(screen.getByText('75.0%')).toBeInTheDocument()
    expect(container.querySelector('span.rounded-full')).toBeNull()
  })
})
