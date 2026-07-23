import { render, screen, fireEvent } from '@testing-library/react'
import { BayesNextWord } from './BayesNextWord'

const pick = (word: string) =>
  fireEvent.click(screen.getByRole('button', { name: new RegExp(`^Pick "${word}"`) }))

test('starts with a uniform topic belief and the corpus-count first words', () => {
  render(<BayesNextWord />)
  expect(screen.getByRole('meter', { name: /topic is weather/ })).toHaveAttribute('aria-valuenow', '50')
  expect(screen.getByRole('meter', { name: /topic is cooking/ })).toHaveAttribute('aria-valuenow', '50')
  // Both corpora open 5 of 8 sentences with "the": P = 5/8 = 62.5%.
  expect(screen.getByRole('button', { name: 'Pick "the": probability 63%' })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Pick "a": probability 38%' })).toBeInTheDocument()
})

test('a topic-neutral word leaves the belief at 50/50', () => {
  render(<BayesNextWord />)
  pick('the')
  expect(screen.getByTestId('bayes-sentence')).toHaveTextContent('the')
  expect(screen.getByRole('meter', { name: /topic is weather/ })).toHaveAttribute('aria-valuenow', '50')
})

test('picking "rain" collapses the belief to weather, exactly as Bayes\' theorem says', () => {
  render(<BayesNextWord />)
  pick('the')
  pick('rain')
  expect(screen.getByRole('meter', { name: /topic is weather/ })).toHaveAttribute('aria-valuenow', '100')
  expect(screen.getByRole('meter', { name: /topic is cooking/ })).toHaveAttribute('aria-valuenow', '0')
  // With the topic pinned, the weather bigram takes over: rain → fell, always.
  expect(screen.getByRole('button', { name: 'Pick "fell": probability 100%' })).toBeInTheDocument()
})

test('"cold" only nudges the belief, and the word after it settles the topic', () => {
  render(<BayesNextWord />)
  pick('a')
  // "cold" appears in both corpora (2 weather sentences, 1 cooking), so the
  // belief moves to 2/3 weather without committing.
  pick('cold')
  expect(screen.getByRole('meter', { name: /topic is weather/ })).toHaveAttribute('aria-valuenow', '67')
  expect(screen.getByRole('meter', { name: /topic is cooking/ })).toHaveAttribute('aria-valuenow', '33')
  // "wind" is weather-only, so it finishes the job "cold" only started.
  pick('wind')
  expect(screen.getByRole('meter', { name: /topic is weather/ })).toHaveAttribute('aria-valuenow', '100')
  expect(screen.getByRole('meter', { name: /topic is cooking/ })).toHaveAttribute('aria-valuenow', '0')
})

test('start over clears the sentence and resets the belief', () => {
  render(<BayesNextWord />)
  pick('the')
  pick('rain')
  fireEvent.click(screen.getByRole('button', { name: /start over/i }))
  expect(screen.getByText(/pick a first word/i)).toBeInTheDocument()
  expect(screen.getByRole('meter', { name: /topic is weather/ })).toHaveAttribute('aria-valuenow', '50')
})
