import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HallucinationDemo } from './HallucinationDemo'
import { PROMPTS, candidatesFor } from './hallucinationModel'

test('shows the first prompt with probability bars and no truth tags yet', () => {
  render(<HallucinationDemo />)
  expect(
    screen.getByRole('heading', { name: /what the model predicts after "the capital of france is"/i }),
  ).toBeInTheDocument()
  // Candidates show only the model's likelihood before the reveal.
  expect(screen.getByRole('listitem', { name: 'Paris: 96%' })).toBeInTheDocument()
  expect(screen.queryByText(/^true$/)).not.toBeInTheDocument()
  expect(screen.queryByText(/^false$/)).not.toBeInTheDocument()
})

test('revealing the answers tags each candidate as true, false, or unverifiable', async () => {
  const user = userEvent.setup()
  render(<HallucinationDemo />)
  await user.click(screen.getByRole('button', { name: /check the answers against reality/i }))
  expect(screen.getByRole('listitem', { name: 'Paris: 96%, true' })).toBeInTheDocument()
  expect(screen.getByRole('listitem', { name: 'Lyon: 2%, false' })).toBeInTheDocument()
  expect(screen.getByRole('listitem', { name: 'located: 1%, unverifiable' })).toBeInTheDocument()
  // The lesson panel replaces the reveal button.
  expect(screen.getByRole('heading', { name: /what the tags show/i })).toBeInTheDocument()
  expect(
    screen.queryByRole('button', { name: /check the answers against reality/i }),
  ).not.toBeInTheDocument()
})

test('the Australia prompt puts the wrong city on top with the biggest bar', async () => {
  const user = userEvent.setup()
  render(<HallucinationDemo />)
  await user.click(screen.getByRole('button', { name: /the capital of australia is/i }))
  await user.click(screen.getByRole('button', { name: /check the answers against reality/i }))

  const items = screen.getAllByRole('listitem')
  // The model's favorite is Sydney, which is false; the true answer ranks second.
  expect(items[0]).toHaveAccessibleName('Sydney: 58%, false')
  expect(items[1]).toHaveAccessibleName('Canberra: 31%, true')
})

test('switching prompts hides the tags again until the reader re-checks', async () => {
  const user = userEvent.setup()
  render(<HallucinationDemo />)
  await user.click(screen.getByRole('button', { name: /check the answers against reality/i }))
  expect(screen.getByRole('listitem', { name: 'Paris: 96%, true' })).toBeInTheDocument()

  await user.click(screen.getByRole('button', { name: /a famous 2019 study/i }))
  expect(
    screen.getByRole('heading', { name: /what the model predicts after "a famous 2019 study/i }),
  ).toBeInTheDocument()
  // Fresh prompt, fresh reveal: tags are hidden and the button is back.
  expect(screen.getByRole('listitem', { name: 'sleep: 34%' })).toBeInTheDocument()
  expect(
    screen.getByRole('button', { name: /check the answers against reality/i }),
  ).toBeInTheDocument()
})

test('the fake-study prompt marks every candidate unverifiable', async () => {
  const user = userEvent.setup()
  render(<HallucinationDemo />)
  await user.click(screen.getByRole('button', { name: /a famous 2019 study/i }))
  await user.click(screen.getByRole('button', { name: /check the answers against reality/i }))
  for (const item of screen.getAllByRole('listitem')) {
    expect(item).toHaveAccessibleName(/unverifiable$/)
  }
})

test('candidatesFor sorts by probability and each prompt sums to roughly 1', () => {
  for (const p of PROMPTS) {
    const cands = candidatesFor(p.id)
    const probs = cands.map((c) => c.prob)
    expect(probs).toEqual([...probs].sort((a, b) => b - a))
    const total = probs.reduce((a, b) => a + b, 0)
    expect(total).toBeGreaterThan(0.98)
    expect(total).toBeLessThanOrEqual(1.001)
  }
  expect(candidatesFor('missing-prompt')).toEqual([])
})
