import { describe, it, expect, afterEach, vi } from 'vitest'
import { render, screen, fireEvent, cleanup, act, within } from '@testing-library/react'
import { SwipeLabelDeck, SWIPE_THRESHOLD } from './SwipeLabelDeck'
import type { ComponentProps } from 'react'

const card = { id: 0, name: 'Training 3 #2', pixels: Array(64).fill(false) }

/** Render the deck with sensible defaults so each test overrides only what it probes. */
function renderDeck(overrides: Partial<ComponentProps<typeof SwipeLabelDeck>> = {}) {
  return render(
    <SwipeLabelDeck
      card={card}
      upcoming={[]}
      remaining={3}
      onLabel={() => {}}
      onDelete={() => {}}
      onAddYourOwn={() => {}}
      {...overrides}
    />
  )
}

afterEach(() => {
  cleanup()
  vi.useRealTimers()
  vi.restoreAllMocks()
})

/** Drag the face card from (0,0) by (dx,dy) and release, as one pointer. */
function swipe(dx: number, dy: number) {
  const face = screen.getByTestId('swipe-card')
  fireEvent.pointerDown(face, { button: 0, pointerId: 1, clientX: 0, clientY: 0 })
  fireEvent.pointerMove(face, { pointerId: 1, clientX: dx / 2, clientY: dy / 2 })
  fireEvent.pointerMove(face, { pointerId: 1, clientX: dx, clientY: dy })
  fireEvent.pointerUp(face, { pointerId: 1, clientX: dx, clientY: dy })
}

/** Let the fly-off animation finish so the queued action fires. */
function settle() {
  act(() => {
    vi.advanceTimersByTime(200)
  })
}

describe('SwipeLabelDeck', () => {
  it('labels 3 on a swipe right', () => {
    vi.useFakeTimers()
    const onLabel = vi.fn()
    const onDelete = vi.fn()
    renderDeck({ onLabel, onDelete })

    swipe(SWIPE_THRESHOLD + 20, 5)
    settle()

    expect(onLabel).toHaveBeenCalledWith('3')
    expect(onDelete).not.toHaveBeenCalled()
  })

  it('labels E on a swipe left', () => {
    vi.useFakeTimers()
    const onLabel = vi.fn()
    renderDeck({ onLabel })

    swipe(-(SWIPE_THRESHOLD + 20), -10)
    settle()

    expect(onLabel).toHaveBeenCalledWith('E')
  })

  it('deletes on a swipe up', () => {
    vi.useFakeTimers()
    const onLabel = vi.fn()
    const onDelete = vi.fn()
    renderDeck({ onLabel, onDelete })

    swipe(4, -(SWIPE_THRESHOLD + 20))
    settle()

    expect(onDelete).toHaveBeenCalledOnce()
    expect(onLabel).not.toHaveBeenCalled()
  })

  it('does nothing when the drag is released under the threshold', () => {
    vi.useFakeTimers()
    const onLabel = vi.fn()
    const onDelete = vi.fn()
    renderDeck({ onLabel, onDelete })

    swipe(SWIPE_THRESHOLD / 2, 0)
    settle()

    expect(onLabel).not.toHaveBeenCalled()
    expect(onDelete).not.toHaveBeenCalled()
  })

  it('abandons the drag on pointercancel', () => {
    vi.useFakeTimers()
    const onLabel = vi.fn()
    renderDeck({ onLabel })

    const face = screen.getByTestId('swipe-card')
    fireEvent.pointerDown(face, { button: 0, pointerId: 1, clientX: 0, clientY: 0 })
    fireEvent.pointerMove(face, { pointerId: 1, clientX: 200, clientY: 0 })
    fireEvent.pointerCancel(face, { pointerId: 1 })
    fireEvent.pointerUp(face, { pointerId: 1, clientX: 200, clientY: 0 })
    settle()

    expect(onLabel).not.toHaveBeenCalled()
  })

  it('fires the same actions from the accessible buttons', () => {
    vi.useFakeTimers()
    const onLabel = vi.fn()
    const onDelete = vi.fn()
    renderDeck({ onLabel, onDelete })

    fireEvent.click(screen.getByRole('button', { name: 'E' }))
    settle()
    expect(onLabel).toHaveBeenCalledWith('E')

    fireEvent.click(screen.getByRole('button', { name: '3' }))
    settle()
    expect(onLabel).toHaveBeenCalledWith('3')

    fireEvent.click(screen.getByRole('button', { name: 'Delete' }))
    settle()
    expect(onDelete).toHaveBeenCalledOnce()
  })

  it('commits immediately without animation under reduced motion', () => {
    vi.spyOn(window, 'matchMedia').mockImplementation(
      (query: string) =>
        ({
          matches: query.includes('prefers-reduced-motion'),
          media: query,
          onchange: null,
          addEventListener: () => {},
          removeEventListener: () => {},
          addListener: () => {},
          removeListener: () => {},
          dispatchEvent: () => true,
        }) as unknown as MediaQueryList
    )
    const onLabel = vi.fn()
    renderDeck({ onLabel })

    fireEvent.click(screen.getByRole('button', { name: '3' }))
    expect(onLabel).toHaveBeenCalledWith('3')
  })

  it('can delete even the last remaining card', () => {
    vi.useFakeTimers()
    const onDelete = vi.fn()
    renderDeck({ remaining: 0, onDelete })

    fireEvent.click(screen.getByRole('button', { name: 'Delete' }))
    settle()

    expect(onDelete).toHaveBeenCalledOnce()
    expect(screen.getByRole('button', { name: 'E' })).toBeEnabled()
  })

  it('shows the all-done state and disables every button with no card', () => {
    renderDeck({ card: null, remaining: 0 })
    expect(screen.getByText(/Every remaining drawing has a label/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'E' })).toBeDisabled()
    expect(screen.getByRole('button', { name: '3' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Delete' })).toBeDisabled()
  })

  it('names the face card for screen readers', () => {
    renderDeck({ remaining: 1 })
    expect(
      screen.getByRole('img', { name: 'Training 3 #2, an unlabelled 8 by 8 drawing' })
    ).toBeInTheDocument()
  })

  it('shows the upcoming queue on the conveyor strip', () => {
    const upcoming = [1, 2, 3].map((id) => ({
      id,
      name: `Training E #${id}`,
      pixels: Array(64).fill(false),
    }))
    renderDeck({ upcoming })
    const strip = screen.getByTestId('conveyor-strip')
    expect(within(strip).getAllByTestId('conveyor-card')).toHaveLength(3)
  })

  it('renders no conveyor when nothing is queued behind the face card', () => {
    renderDeck({ upcoming: [] })
    expect(screen.queryByTestId('conveyor-strip')).not.toBeInTheDocument()
  })

  it('invites drawing your own from the all-done state', () => {
    const onAddYourOwn = vi.fn()
    renderDeck({ card: null, upcoming: [], remaining: 0, onAddYourOwn })
    expect(screen.getByText(/Do you want to add your own\?/)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Draw your own' }))
    expect(onAddYourOwn).toHaveBeenCalledOnce()
  })
})
