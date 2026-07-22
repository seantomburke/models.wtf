import { describe, it, expect } from 'vitest'
import {
  addCard,
  createDeck,
  currentCard,
  labelAll,
  labelCurrent,
  labelledCount,
  resolveSwipe,
  skipCurrent,
  unlabelCard,
} from './swipeLabel'

describe('swipe deck state machine', () => {
  it('starts with every card queued and nothing labelled', () => {
    const deck = createDeck(3)
    expect(deck.queue).toEqual([0, 1, 2])
    expect(currentCard(deck)).toBe(0)
    expect(labelledCount(deck)).toBe(0)
  })

  it('labels the front card and advances to the next', () => {
    let deck = createDeck(3)
    deck = labelCurrent(deck, '3')
    expect(deck.labels[0]).toBe('3')
    expect(currentCard(deck)).toBe(1)

    deck = labelCurrent(deck, 'E')
    expect(deck.labels[1]).toBe('E')
    expect(labelledCount(deck)).toBe(2)
  })

  it('ignores labelling once the deck is empty', () => {
    let deck = createDeck(1)
    deck = labelCurrent(deck, 'E')
    const after = labelCurrent(deck, '3')
    expect(after).toBe(deck)
    expect(currentCard(after)).toBeNull()
  })

  it('sends a skipped card to the back of the deck', () => {
    let deck = createDeck(3)
    deck = skipCurrent(deck)
    expect(deck.queue).toEqual([1, 2, 0])
    expect(labelledCount(deck)).toBe(0)
  })

  it('will not skip the last remaining card', () => {
    let deck = createDeck(2)
    deck = labelCurrent(deck, 'E')
    const after = skipCurrent(deck)
    expect(after.queue).toEqual(deck.queue)
  })

  it('a skipped card comes around again and can then be labelled', () => {
    let deck = createDeck(2)
    deck = skipCurrent(deck)
    deck = labelCurrent(deck, '3') // card 1
    deck = labelCurrent(deck, 'E') // card 0, back from its skip
    expect(deck.labels).toEqual({ 1: '3', 0: 'E' })
    expect(currentCard(deck)).toBeNull()
  })

  it('returns an unlabelled card to the front of the deck', () => {
    let deck = createDeck(2)
    deck = labelCurrent(deck, '3')
    deck = unlabelCard(deck, 0)
    expect(deck.queue).toEqual([0, 1])
    expect(deck.labels[0]).toBeUndefined()
  })

  it('ignores unlabelling a card that was never labelled', () => {
    const deck = createDeck(2)
    expect(unlabelCard(deck, 0)).toBe(deck)
  })

  it('adds a new card to the front so it is judged next', () => {
    let deck = createDeck(2)
    deck = addCard(deck, 2)
    expect(currentCard(deck)).toBe(2)
    expect(deck.queue).toEqual([2, 0, 1])
  })

  it('refuses to add a card the deck already knows about', () => {
    let deck = createDeck(2)
    expect(addCard(deck, 1)).toBe(deck)
    deck = labelCurrent(deck, 'E')
    expect(addCard(deck, 0)).toBe(deck)
  })

  it('labels the whole queue at once, leaving null-labelled cards queued', () => {
    let deck = createDeck(4)
    deck = labelCurrent(deck, 'E')
    deck = labelAll(deck, (card) => (card === 3 ? null : '3'))
    expect(deck.labels).toEqual({ 0: 'E', 1: '3', 2: '3' })
    expect(deck.queue).toEqual([3])
  })
})

describe('resolveSwipe', () => {
  const T = 60

  it('reads a decisive rightward drag as a 3', () => {
    expect(resolveSwipe(80, 10, T)).toBe('3')
  })

  it('reads a decisive leftward drag as an E', () => {
    expect(resolveSwipe(-90, -20, T)).toBe('E')
  })

  it('reads a decisive upward drag as a skip', () => {
    expect(resolveSwipe(5, -75, T)).toBe('skip')
  })

  it('lets horizontal win a diagonal flick', () => {
    expect(resolveSwipe(80, -80, T)).toBe('3')
    expect(resolveSwipe(-80, -80, T)).toBe('E')
  })

  it('ignores a drag below the threshold', () => {
    expect(resolveSwipe(30, -30, T)).toBeNull()
    expect(resolveSwipe(0, 0, T)).toBeNull()
  })

  it('never treats a downward drag as anything', () => {
    expect(resolveSwipe(0, 200, T)).toBeNull()
  })
})
