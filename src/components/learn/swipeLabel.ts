/**
 * The label/skip state machine behind the swipe deck in the training lab.
 *
 * Pure data, no React, no DOM: the deck component translates pointer gestures
 * and button presses into these three actions, and this module decides what
 * they mean. Keeping it pure makes the labelling rules unit-testable without
 * simulating a single pointer event.
 *
 * The deck walks a queue of card indices. Labelling a card removes it from the
 * queue; skipping moves it to the back so it comes around again. Cards can also
 * be sent back to the queue (relabelling), which is how "remove" works in the
 * labelled tray.
 */

export type SwipeLabel = 'E' | '3'

/** Which way each gesture goes, in one place so UI and logic agree. */
export const SWIPE_DIRECTIONS = {
  left: 'E',
  right: '3',
  up: 'skip',
} as const

export interface SwipeDeckState {
  /** Card indices still waiting for a label, front of the deck first. */
  queue: number[]
  /** The label each already-judged card received. */
  labels: Record<number, SwipeLabel>
}

/** A fresh deck over `count` cards, none labelled. */
export function createDeck(count: number): SwipeDeckState {
  return { queue: Array.from({ length: count }, (_, index) => index), labels: {} }
}

/** The card currently facing the user, or null when everything is labelled. */
export function currentCard(state: SwipeDeckState): number | null {
  return state.queue.length > 0 ? state.queue[0] : null
}

/** How many cards have received a label. */
export function labelledCount(state: SwipeDeckState): number {
  return Object.keys(state.labels).length
}

/** Label the front card and remove it from the deck. No-op on an empty deck. */
export function labelCurrent(state: SwipeDeckState, label: SwipeLabel): SwipeDeckState {
  const card = currentCard(state)
  if (card === null) return state
  return {
    queue: state.queue.slice(1),
    labels: { ...state.labels, [card]: label },
  }
}

/**
 * Skip the front card: it goes to the back of the deck so it comes around
 * again. With one card left this is a no-op — there is nowhere to hide.
 */
export function skipCurrent(state: SwipeDeckState): SwipeDeckState {
  if (state.queue.length < 2) return state
  return { ...state, queue: [...state.queue.slice(1), state.queue[0]] }
}

/** Send a labelled card back into the deck to be judged again. */
export function unlabelCard(state: SwipeDeckState, card: number): SwipeDeckState {
  if (!(card in state.labels)) return state
  const labels = { ...state.labels }
  delete labels[card]
  return { queue: [card, ...state.queue], labels }
}

/**
 * Add a brand-new card (a custom drawing) to the front of the deck, so it is
 * the very next thing the user labels with the same swipe or buttons.
 */
export function addCard(state: SwipeDeckState, card: number): SwipeDeckState {
  if (state.queue.includes(card) || card in state.labels) return state
  return { ...state, queue: [card, ...state.queue] }
}

/**
 * Label many cards in one stroke (the shortcut buttons). Cards for which
 * `labelFor` returns null — a custom drawing whose truth only its author
 * knows — stay in the queue.
 */
export function labelAll(
  state: SwipeDeckState,
  labelFor: (card: number) => SwipeLabel | null
): SwipeDeckState {
  const labels = { ...state.labels }
  const queue: number[] = []
  for (const card of state.queue) {
    const label = labelFor(card)
    if (label === null) queue.push(card)
    else labels[card] = label
  }
  return { queue, labels }
}

/**
 * Turn a completed drag into an action, or null when the gesture was too small
 * to mean anything. Horizontal wins ties so a sloppy diagonal flick still
 * labels rather than skips.
 */
export function resolveSwipe(
  dx: number,
  dy: number,
  threshold: number
): SwipeLabel | 'skip' | null {
  if (Math.abs(dx) >= threshold && Math.abs(dx) >= Math.abs(dy)) {
    return dx > 0 ? SWIPE_DIRECTIONS.right : SWIPE_DIRECTIONS.left
  }
  if (dy <= -threshold) return SWIPE_DIRECTIONS.up
  return null
}
