import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SceneNextWord } from './SceneNextWord'

/** Open a slot's dropdown and return a within-scope over its options. */
async function openSlot(user: ReturnType<typeof userEvent.setup>, name: RegExp) {
  const trigger = screen.getByRole('button', { name })
  await user.click(trigger)
  const listbox = screen.getByRole('listbox')
  return within(listbox)
}

test('starts with a first-word slot offering the sentence-opening words', async () => {
  const user = userEvent.setup()
  render(<SceneNextWord />)
  const first = await openSlot(user, /first word: pick the next word/i)
  // Alice and Bob both open sentences in the starter corpus.
  expect(first.getByRole('option', { name: /^Alice:/i })).toBeInTheDocument()
  expect(first.getByRole('option', { name: /^Bob:/i })).toBeInTheDocument()
})

test('after Bob the model most favors the unfriendly verb', async () => {
  const user = userEvent.setup()
  render(<SceneNextWord />)
  const first = await openSlot(user, /first word: pick/i)
  await user.click(first.getByRole('option', { name: /^Bob:/i }))

  const next = await openSlot(user, /next word: pick/i)
  const options = next.getAllByRole('option').map((el) => el.getAttribute('aria-label') ?? '')
  // "ignores" is the top (first) option after Bob, and "greets" is offered too.
  expect(options[0]).toMatch(/^ignores:/)
  expect(options.some((o) => /^greets:/.test(o))).toBe(true)
})

test('the meaning map is present and labeled for screen readers', () => {
  render(<SceneNextWord />)
  expect(screen.getByRole('img', { name: /map of every word/i })).toBeInTheDocument()
})

test('the starter map shows four words and expanding adds Charlie and sees', async () => {
  const user = userEvent.setup()
  render(<SceneNextWord />)
  const map = screen.getByRole('img', { name: /map of every word/i })
  // Starter vocabulary: four words, no Charlie or sees yet.
  expect(within(map).getByText('Alice')).toBeInTheDocument()
  expect(within(map).queryByText('Charlie')).not.toBeInTheDocument()

  await user.click(screen.getByRole('button', { name: /add charlie/i }))
  expect(within(map).getByText('Charlie')).toBeInTheDocument()
  expect(within(map).getByText('sees')).toBeInTheDocument()
})

test('reset clears the built sentence', async () => {
  const user = userEvent.setup()
  render(<SceneNextWord />)
  const first = await openSlot(user, /first word: pick/i)
  await user.click(first.getByRole('option', { name: /^Alice:/i }))
  // A word chip now exists.
  expect(screen.getByRole('button', { name: /word 1: Alice/i })).toBeInTheDocument()

  await user.click(screen.getByRole('button', { name: /^reset$/i }))
  expect(screen.queryByRole('button', { name: /word 1:/i })).not.toBeInTheDocument()
})
