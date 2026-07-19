import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BookmarkButton } from './BookmarkButton'

describe('BookmarkButton', () => {
  it('renders unfilled star when not bookmarked', () => {
    render(<BookmarkButton isBookmarked={false} onClick={vi.fn()} />)
    const button = screen.getByRole('button')
    expect(button).toHaveTextContent('☆')
  })

  it('renders filled star when bookmarked', () => {
    render(<BookmarkButton isBookmarked={true} onClick={vi.fn()} />)
    const button = screen.getByRole('button')
    expect(button).toHaveTextContent('★')
  })

  it('calls onClick when clicked', async () => {
    const onClick = vi.fn()
    render(<BookmarkButton isBookmarked={false} onClick={onClick} />)

    await userEvent.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('has correct aria label when not bookmarked', () => {
    render(<BookmarkButton isBookmarked={false} onClick={vi.fn()} />)
    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('aria-label', 'Add bookmark')
  })

  it('has correct aria label when bookmarked', () => {
    render(<BookmarkButton isBookmarked={true} onClick={vi.fn()} />)
    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('aria-label', 'Remove bookmark')
  })

  it('supports custom aria label', () => {
    render(<BookmarkButton isBookmarked={false} onClick={vi.fn()} aria="Custom label" />)
    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('aria-label', 'Custom label')
  })

  it('has hover and focus styles', () => {
    const { container } = render(<BookmarkButton isBookmarked={true} onClick={vi.fn()} />)
    const button = container.querySelector('button')
    expect(button).toHaveClass('hover:text-yellow-600')
    expect(button).toHaveClass('focus:ring-2')
  })
})
