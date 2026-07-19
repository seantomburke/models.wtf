import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { NextWordPredictor } from './NextWordPredictor'

test('starts empty and offers the sentence-opening words with counts', () => {
  render(<NextWordPredictor />)
  expect(screen.getByTestId('sentence')).toHaveTextContent(/empty/i)
  expect(screen.getByRole('heading', { name: /how does a sentence start/i })).toBeInTheDocument()
  // "the" opens 6 of the 9 training sentences.
  expect(screen.getByRole('button', { name: 'the: 67%, seen 6 times' })).toBeInTheDocument()
})

test('clicking a prediction appends it and re-predicts from the new last word', async () => {
  const user = userEvent.setup()
  render(<NextWordPredictor />)
  await user.click(screen.getByRole('button', { name: /^the:/i }))
  expect(screen.getByTestId('sentence')).toHaveTextContent('the')
  expect(screen.getByRole('heading', { name: /what comes after "the"/i })).toBeInTheDocument()
  // "cat" follows "the" three times in the corpus.
  expect(screen.getByRole('button', { name: /^cat:.*seen 3 times/i })).toBeInTheDocument()
})

test('always picking the favorite completes a sentence deterministically', async () => {
  const user = userEvent.setup()
  render(<NextWordPredictor />)
  await user.click(screen.getByRole('button', { name: /always pick the favorite/i }))
  // Greedy decoding gets stuck in the parrot loop the topic text describes.
  expect(screen.getByTestId('sentence')).toHaveTextContent(
    'the cat ate my cat ate my cat ate my cat ate.',
  )
  expect(screen.queryByRole('heading', { name: /what comes after/i })).not.toBeInTheDocument()
})

test('reset clears the sentence', async () => {
  const user = userEvent.setup()
  render(<NextWordPredictor />)
  await user.click(screen.getByRole('button', { name: /always pick the favorite/i }))
  await user.click(screen.getByRole('button', { name: /reset/i }))
  expect(screen.getByTestId('sentence')).toHaveTextContent(/empty/i)
})
