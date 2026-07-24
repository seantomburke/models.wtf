import { act, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, expect, test, vi } from 'vitest'
import { PositionAttentionLab } from './PositionAttentionLab'

// Pin prefers-reduced-motion so generation reveals the whole sentence at once,
// which keeps the assertion synchronous. The animated path is exercised below.
function stubReducedMotion(matches: boolean) {
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: matches && query.includes('prefers-reduced-motion'),
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
    onchange: null,
  }))
}

afterEach(() => vi.unstubAllGlobals())

test('shows position-specific predictions and generation controls', async () => {
  stubReducedMotion(true)
  const user = userEvent.setup()
  render(<PositionAttentionLab />)
  expect(screen.getByLabelText('subject predictions')).toHaveTextContent('ignores')
  expect(screen.getByLabelText('object predictions')).toHaveTextContent('.')
  await user.click(screen.getByRole('button', { name: 'Alice as subject' }))
  expect(screen.getByLabelText('subject predictions')).toHaveTextContent('greets')
  await user.click(screen.getByRole('button', { name: 'Generate' }))
  expect(screen.getByTestId('generated-sentence')).toHaveTextContent(/Bob ignores Alice\./)
})

test('offers Charlie as a subject', () => {
  stubReducedMotion(true)
  render(<PositionAttentionLab />)
  expect(screen.getByRole('button', { name: 'Charlie as subject' })).toBeInTheDocument()
})

test('reveals the generated sentence one word at a time', () => {
  stubReducedMotion(false)
  vi.useFakeTimers()
  try {
    render(<PositionAttentionLab />)
    fireEvent.click(screen.getByRole('button', { name: 'Generate' }))
    // First word only after one tick, with a walkthrough of the input it read.
    act(() => { vi.advanceTimersByTime(700) })
    expect(screen.getByTestId('generated-sentence')).toHaveTextContent(/^Bob/)
    expect(screen.getByTestId('generated-sentence')).not.toHaveTextContent('Alice')
    expect(screen.getByTestId('generation-step')).toHaveTextContent(/picks .*Bob/)
    // The rest of the words fill in on later ticks.
    act(() => { vi.advanceTimersByTime(3000) })
    expect(screen.getByTestId('generated-sentence')).toHaveTextContent(/Bob ignores Alice\./)
  } finally {
    vi.useRealTimers()
  }
})
