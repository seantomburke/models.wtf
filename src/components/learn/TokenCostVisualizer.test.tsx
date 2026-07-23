import { render, screen, fireEvent } from '@testing-library/react'
import {
  TokenCostVisualizer,
  SCENARIOS,
  wordsToTokens,
  costForTokens,
  formatDollars,
  INPUT_RATE_PER_MILLION,
  OUTPUT_RATE_PER_MILLION,
} from './TokenCostVisualizer'

test('token math follows the 4/3 words-to-tokens rule of thumb', () => {
  expect(wordsToTokens(3)).toBe(4)
  expect(wordsToTokens(3000)).toBe(4000)
  expect(costForTokens(1_000_000, INPUT_RATE_PER_MILLION)).toBe(2)
  expect(costForTokens(1_000_000, OUTPUT_RATE_PER_MILLION)).toBe(8)
})

test('formats tiny costs with enough decimals to stay visible', () => {
  expect(formatDollars(0.00006)).toBe('$0.000060')
  expect(formatDollars(0.0192)).toBe('$0.0192')
  expect(formatDollars(0)).toBe('$0.000000')
})

test('renders the first scenario by default with both panels and a receipt', () => {
  render(<TokenCostVisualizer />)

  expect(screen.getByText('What you send')).toBeInTheDocument()
  expect(screen.getByText('What comes back')).toBeInTheDocument()

  const quick = SCENARIOS[0]
  const inputTokens = wordsToTokens(quick.inputWords)
  const outputTokens = wordsToTokens(quick.outputWords)
  expect(screen.getByText(`${inputTokens.toLocaleString()} input tokens`)).toBeInTheDocument()
  expect(screen.getByText(`${outputTokens.toLocaleString()} output tokens`)).toBeInTheDocument()

  const expectedTotal =
    costForTokens(inputTokens, INPUT_RATE_PER_MILLION) +
    costForTokens(outputTokens, OUTPUT_RATE_PER_MILLION)
  expect(screen.getByTestId('total-cost')).toHaveTextContent(formatDollars(expectedTotal))
})

test('picking a scenario updates the token counts and the receipt', () => {
  render(<TokenCostVisualizer />)

  fireEvent.click(screen.getByRole('button', { name: 'Document summary' }))

  const summary = SCENARIOS.find((s) => s.id === 'document-summary')!
  const inputTokens = wordsToTokens(summary.inputWords)
  const outputTokens = wordsToTokens(summary.outputWords)
  expect(screen.getByText(`${inputTokens.toLocaleString()} input tokens`)).toBeInTheDocument()
  expect(screen.getByText(summary.description)).toBeInTheDocument()
  expect(screen.getByTestId('input-cost')).toHaveTextContent(
    formatDollars(costForTokens(inputTokens, INPUT_RATE_PER_MILLION)),
  )
  expect(screen.getByTestId('output-cost')).toHaveTextContent(
    formatDollars(costForTokens(outputTokens, OUTPUT_RATE_PER_MILLION)),
  )
  expect(screen.getByRole('button', { name: 'Document summary' })).toHaveAttribute(
    'aria-pressed',
    'true',
  )
})

test('output tokens cost more than the same number of input tokens', () => {
  render(<TokenCostVisualizer />)

  // Drag both sliders to the same word count. The output side of the receipt
  // must show the larger charge because output is metered at a higher rate.
  fireEvent.change(screen.getByLabelText('Words you send'), { target: { value: '600' } })
  fireEvent.change(screen.getByLabelText('Words that come back'), { target: { value: '600' } })

  const tokens = wordsToTokens(600)
  const inputCost = costForTokens(tokens, INPUT_RATE_PER_MILLION)
  const outputCost = costForTokens(tokens, OUTPUT_RATE_PER_MILLION)
  expect(outputCost).toBeGreaterThan(inputCost)
  expect(screen.getByTestId('input-cost')).toHaveTextContent(formatDollars(inputCost))
  expect(screen.getByTestId('output-cost')).toHaveTextContent(formatDollars(outputCost))
  expect(screen.getByTestId('total-cost')).toHaveTextContent(formatDollars(inputCost + outputCost))
})

test('moving a slider deselects the scenario buttons', () => {
  render(<TokenCostVisualizer />)

  expect(screen.getByRole('button', { name: 'Quick question' })).toHaveAttribute(
    'aria-pressed',
    'true',
  )

  fireEvent.change(screen.getByLabelText('Words you send'), { target: { value: '1000' } })

  for (const scenario of SCENARIOS) {
    expect(screen.getByRole('button', { name: scenario.label })).toHaveAttribute(
      'aria-pressed',
      'false',
    )
  }
  expect(screen.getByText(`${wordsToTokens(1000).toLocaleString()} input tokens`)).toBeInTheDocument()
})

test('token stacks expose their counts to assistive tech', () => {
  render(<TokenCostVisualizer />)

  const quick = SCENARIOS[0]
  expect(
    screen.getByRole('img', { name: `${wordsToTokens(quick.inputWords).toLocaleString()} tokens` }),
  ).toBeInTheDocument()
  expect(
    screen.getByRole('img', { name: `${wordsToTokens(quick.outputWords).toLocaleString()} tokens` }),
  ).toBeInTheDocument()
})
