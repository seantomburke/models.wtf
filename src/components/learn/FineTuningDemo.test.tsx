import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FineTuningDemo } from './FineTuningDemo'
import { SCENARIOS, APPROACH_LABEL } from './fineTuningModel'

test('starts on the first scenario and recommends prompting it', () => {
  render(<FineTuningDemo />)
  expect(
    screen.getByRole('group', { name: /task choices/i }),
  ).toBeInTheDocument()
  expect(
    screen.getByLabelText(/prompt it: a few lines of instruction/i),
  ).toBeInTheDocument()
})

test('the cost ladder marks the recommended approach as current', () => {
  render(<FineTuningDemo />)
  const ladder = screen.getByRole('list', { name: /approaches by upfront cost/i })
  const current = ladder.querySelector('[aria-current="true"]')
  expect(current).not.toBeNull()
  expect(current).toHaveTextContent(/prompt it/i)
})

test('picking a high-volume narrow task recommends fine-tuning', async () => {
  const user = userEvent.setup()
  render(<FineTuningDemo />)

  await user.click(screen.getByRole('button', { name: /millions of legal clauses/i }))
  expect(
    screen.getByLabelText(/fine-tune: the task is narrow, the volume is huge/i),
  ).toBeInTheDocument()
  // The prompting recommendation is gone.
  expect(
    screen.queryByLabelText(/prompt it: a few lines of instruction/i),
  ).not.toBeInTheDocument()
})

test('picking a docs task recommends retrieval', async () => {
  const user = userEvent.setup()
  render(<FineTuningDemo />)

  await user.click(screen.getByRole('button', { name: /answers from your own docs/i }))
  expect(
    screen.getByLabelText(/add retrieval: the model never read your handbook/i),
  ).toBeInTheDocument()
})

test('every scenario has a labelled recommendation', async () => {
  const user = userEvent.setup()
  render(<FineTuningDemo />)

  for (const scenario of SCENARIOS) {
    await user.click(screen.getByRole('button', { name: scenario.name }))
    const name = `${APPROACH_LABEL[scenario.approach]}: ${scenario.reason}`
    expect(screen.getByLabelText(name)).toBeInTheDocument()
  }
})
