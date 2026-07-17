import { render, screen } from '@testing-library/react'
import { BenchmarkSourceLink } from './BenchmarkSourceLink'

describe('BenchmarkSourceLink', () => {
  it('renders nothing when no sourceUrl is provided', () => {
    const { container } = render(
      <BenchmarkSourceLink benchmarkName="GPQA Diamond" />,
    )
    expect(container.firstChild).toBeNull()
  })

  it('renders link with source URL', () => {
    render(
      <BenchmarkSourceLink
        sourceUrl="https://github.com/princeton-nlp/SWE-bench"
        benchmarkName="SWE-bench Verified"
      />,
    )

    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', 'https://github.com/princeton-nlp/SWE-bench')
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('displays "source ↗" text', () => {
    render(
      <BenchmarkSourceLink
        sourceUrl="https://example.com"
        benchmarkName="Test Bench"
      />,
    )

    expect(screen.getByText('source')).toBeInTheDocument()
    expect(screen.getByText('↗')).toBeInTheDocument()
  })

  it('sets proper accessibility attributes', () => {
    render(
      <BenchmarkSourceLink
        sourceUrl="https://huggingface.co/datasets/Idavidrein/gpqa"
        benchmarkName="GPQA Diamond"
      />,
    )

    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('aria-label', 'View GPQA Diamond source')
    expect(link).toHaveAttribute('title', 'View GPQA Diamond source')
  })

  it('applies custom className', () => {
    const { container } = render(
      <BenchmarkSourceLink
        sourceUrl="https://example.com"
        benchmarkName="Test Bench"
        className="custom-class"
      />,
    )

    const link = container.querySelector('a')
    expect(link).toHaveClass('custom-class')
  })

  it('applies correct styling classes', () => {
    const { container } = render(
      <BenchmarkSourceLink
        sourceUrl="https://example.com"
        benchmarkName="Test Bench"
      />,
    )

    const link = container.querySelector('a')
    expect(link).toHaveClass(
      'ml-1',
      'inline-flex',
      'text-fg-muted',
      'hover:text-accent-deep',
    )
  })

  it('handles multiple benchmark sources on same page', () => {
    const { container } = render(
      <div>
        <BenchmarkSourceLink
          sourceUrl="https://github.com/princeton-nlp/SWE-bench"
          benchmarkName="SWE-bench Verified"
        />
        <BenchmarkSourceLink
          sourceUrl="https://huggingface.co/datasets/Idavidrein/gpqa"
          benchmarkName="GPQA Diamond"
        />
      </div>,
    )

    const links = container.querySelectorAll('a')
    expect(links).toHaveLength(2)
  })

  it('opens link in new tab with security attributes', () => {
    render(
      <BenchmarkSourceLink
        sourceUrl="https://example.com/benchmark"
        benchmarkName="Example Benchmark"
      />,
    )

    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('includes proper arrow styling for external link indicator', () => {
    const { container } = render(
      <BenchmarkSourceLink
        sourceUrl="https://example.com"
        benchmarkName="Test Bench"
      />,
    )

    const arrow = container.querySelector('span')
    expect(arrow).toHaveTextContent('↗')
    expect(arrow).toHaveClass('text-[8px]')
  })
})
