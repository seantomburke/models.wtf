import { render, screen, fireEvent } from '@testing-library/react'
import { describe, test, expect, vi } from 'vitest'
import { ShortcutsDialog } from './ShortcutsDialog'
import type { Shortcut } from '../lib/keyboard-shortcuts'

describe('ShortcutsDialog', () => {
  const mockShortcuts: Shortcut[] = [
    {
      id: 'help',
      keys: ['?'],
      label: '?',
      description: 'Show keyboard shortcuts',
      action: vi.fn(),
    },
    {
      id: 'compare',
      keys: ['g', 'c'],
      label: 'g c',
      description: 'Go to Compare',
      action: vi.fn(),
    },
  ]

  const mockOnClose = vi.fn()

  test('renders nothing when closed', () => {
    const { container } = render(
      <ShortcutsDialog isOpen={false} onClose={mockOnClose} shortcuts={mockShortcuts} />,
    )
    expect(container.firstChild).toBeNull()
  })

  test('renders dialog when open', () => {
    render(
      <ShortcutsDialog isOpen={true} onClose={mockOnClose} shortcuts={mockShortcuts} />,
    )
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  test('displays all shortcuts', () => {
    render(
      <ShortcutsDialog isOpen={true} onClose={mockOnClose} shortcuts={mockShortcuts} />,
    )
    expect(screen.getByText('Show keyboard shortcuts')).toBeInTheDocument()
    expect(screen.getByText('Go to Compare')).toBeInTheDocument()
  })

  test('displays correct keyboard labels', () => {
    render(
      <ShortcutsDialog isOpen={true} onClose={mockOnClose} shortcuts={mockShortcuts} />,
    )
    expect(screen.getByText('?')).toBeInTheDocument()
    expect(screen.getByText('g c')).toBeInTheDocument()
  })

  test('closes when close button is clicked', () => {
    render(
      <ShortcutsDialog isOpen={true} onClose={mockOnClose} shortcuts={mockShortcuts} />,
    )
    const closeButton = screen.getByLabelText('Close shortcuts dialog')
    fireEvent.click(closeButton)
    expect(mockOnClose).toHaveBeenCalled()
  })

  test('closes when backdrop is clicked', () => {
    const { container } = render(
      <ShortcutsDialog isOpen={true} onClose={mockOnClose} shortcuts={mockShortcuts} />,
    )
    const backdrop = container.querySelector('[role="presentation"]')
    if (backdrop) {
      fireEvent.click(backdrop)
      expect(mockOnClose).toHaveBeenCalled()
    }
  })

  test('closes when Escape key is pressed', () => {
    render(
      <ShortcutsDialog isOpen={true} onClose={mockOnClose} shortcuts={mockShortcuts} />,
    )
    fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' })
    expect(mockOnClose).toHaveBeenCalled()
  })

  test('has correct aria attributes', () => {
    render(
      <ShortcutsDialog isOpen={true} onClose={mockOnClose} shortcuts={mockShortcuts} />,
    )
    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveAttribute('aria-modal', 'true')
    expect(dialog).toHaveAttribute('aria-labelledby', 'shortcuts-title')
  })

  test('title has correct id', () => {
    render(
      <ShortcutsDialog isOpen={true} onClose={mockOnClose} shortcuts={mockShortcuts} />,
    )
    const title = screen.getByText('Keyboard shortcuts')
    expect(title).toHaveAttribute('id', 'shortcuts-title')
  })

  test('does not propagate click events from dialog content', () => {
    mockOnClose.mockClear()
    const { container } = render(
      <ShortcutsDialog isOpen={true} onClose={mockOnClose} shortcuts={mockShortcuts} />,
    )
    const dialog = container.querySelector('[role="dialog"]')
    if (dialog) {
      fireEvent.click(dialog)
      expect(mockOnClose).not.toHaveBeenCalled()
    }
  })
})
