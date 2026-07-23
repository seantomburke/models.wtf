import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup, fireEvent } from '@testing-library/react'
import {
  ContextWindowVisualizer,
  CONTENT_BLOCKS,
  formatTokens,
  formatCost,
} from './ContextWindowVisualizer'

afterEach(cleanup)

describe('formatTokens', () => {
  it('renders thousands and millions compactly', () => {
    expect(formatTokens(500)).toBe('500')
    expect(formatTokens(4_000)).toBe('4K')
    expect(formatTokens(30_500)).toBe('30.5K')
    expect(formatTokens(1_000_000)).toBe('1M')
  })
})

describe('formatCost', () => {
  it('shows dollars for big totals and cents for small ones', () => {
    // 180K tokens at $3/1M = $0.54
    expect(formatCost(180_000)).toBe('$0.54')
    // 4K tokens at $3/1M = 1.2 cents
    expect(formatCost(4_000)).toBe('1.2¢')
    // 500 tokens at $3/1M = 0.15 cents
    expect(formatCost(500)).toBe('0.15¢')
  })
})

describe('ContextWindowVisualizer', () => {
  it('starts with the question and PDF in the window and shows their totals', () => {
    render(<ContextWindowVisualizer />)
    // 500 + 30,000 = 30.5K tokens
    expect(screen.getByText('30.5K')).toBeInTheDocument()
    const meter = screen.getByRole('img', { name: /30\.5K of 200K/ })
    expect(meter).toBeInTheDocument()
    // Cost: 30,500 / 1M * $3 = 9.15 cents
    expect(screen.getByText('9.2¢')).toBeInTheDocument()
  })

  it('adds tokens and cost when a block is toggled on', () => {
    render(<ContextWindowVisualizer />)
    fireEvent.click(screen.getByRole('button', { name: /Whole codebase/ }))
    // 500 + 30,000 + 150,000 = 180.5K
    expect(
      screen.getByRole('img', { name: /180\.5K of 200K/ })
    ).toBeInTheDocument()
    // 180,500 / 1M * $3 = $0.54
    expect(screen.getByText('$0.54')).toBeInTheDocument()
  })

  it('removes tokens when a block is toggled off', () => {
    render(<ContextWindowVisualizer />)
    fireEvent.click(screen.getByRole('button', { name: /One PDF report/ }))
    expect(screen.getByRole('img', { name: /500 of 200K/ })).toBeInTheDocument()
  })

  it('warns when the content overflows the window and clears on a bigger window', () => {
    render(<ContextWindowVisualizer />)
    fireEvent.click(screen.getByRole('button', { name: /Whole codebase/ }))
    fireEvent.click(screen.getByRole('button', { name: /A full book/ }))
    // 500 + 30K + 150K + 180K = 360.5K > 200K
    expect(screen.getByRole('alert')).toHaveTextContent(
      /more than the window can hold/
    )

    fireEvent.click(screen.getByRole('button', { name: /1M window/ }))
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(
      screen.getByRole('img', { name: /360\.5K of 1M/ })
    ).toBeInTheDocument()
  })

  it('shrinks the big blocks and the bill when trimming is turned on', () => {
    render(<ContextWindowVisualizer />)
    fireEvent.click(screen.getByRole('button', { name: /Whole codebase/ }))
    fireEvent.click(screen.getByRole('checkbox', { name: /Trim to what matters/ }))
    // Trimmed: 500 (question) + 2,000 (PDF) + 5,000 (codebase) = 7.5K
    expect(screen.getByRole('img', { name: /7\.5K of 200K/ })).toBeInTheDocument()
    // Savings: 180.5K full vs 7.5K trimmed = 173K fewer tokens
    expect(
      screen.getByText(/reads 173K fewer tokens/)
    ).toBeInTheDocument()
  })

  it('resolves an overflow by trimming instead of buying a bigger window', () => {
    render(<ContextWindowVisualizer />)
    fireEvent.click(screen.getByRole('button', { name: /A full book/ }))
    fireEvent.click(screen.getByRole('button', { name: /Whole codebase/ }))
    expect(screen.getByRole('alert')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('checkbox', { name: /Trim to what matters/ }))
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('marks toggled blocks as pressed for assistive tech', () => {
    render(<ContextWindowVisualizer />)
    const codebase = screen.getByRole('button', { name: /Whole codebase/ })
    expect(codebase).toHaveAttribute('aria-pressed', 'false')
    fireEvent.click(codebase)
    expect(codebase).toHaveAttribute('aria-pressed', 'true')
  })

  it('keeps every block cheaper or equal when trimmed', () => {
    for (const block of CONTENT_BLOCKS) {
      expect(block.trimmedTokens).toBeLessThanOrEqual(block.fullTokens)
    }
  })
})
