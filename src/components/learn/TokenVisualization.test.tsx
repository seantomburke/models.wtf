import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { TokenVisualization } from './TokenVisualization'

test('highlights each real BPE token piece once the tokenizer loads', async () => {
  render(<TokenVisualization />)

  // SSR-safe fallback: the sentence renders as plain text immediately.
  expect(screen.getByText('Understanding tokenization')).toBeInTheDocument()

  // After the tokenizer chunk loads, the word splits into highlighted pieces.
  await waitFor(
    () => expect(screen.getByTitle('Token 3: "ization"')).toBeInTheDocument(),
    { timeout: 10000 },
  )
  expect(screen.getByTitle('Token 2: " token"')).toHaveTextContent('token')
  expect(screen.getAllByText(/^\d+ tokens$/).length).toBeGreaterThan(0)
})

test('tokenizes custom text typed into the try-it input', async () => {
  render(<TokenVisualization />)
  const input = screen.getByLabelText('Try your own text')

  fireEvent.change(input, { target: { value: 'unbelievably' } })

  await waitFor(
    () => expect(screen.getByTitle('Token 1: "un"')).toBeInTheDocument(),
    { timeout: 10000 },
  )
  // Both the "Understanding tokenization" example and the custom text are 3 tokens.
  expect(screen.getAllByText('3 tokens')).toHaveLength(2)

  // Clearing the input hides the highlight panel instead of showing 0 tokens.
  fireEvent.change(input, { target: { value: '' } })
  expect(screen.queryByTitle('Token 1: "un"')).not.toBeInTheDocument()
})
