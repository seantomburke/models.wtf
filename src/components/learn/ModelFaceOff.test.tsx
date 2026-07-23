import { render, screen, within } from '@testing-library/react'
import {
  ModelFaceOff,
  ClaudeVsGptFaceOff,
  ClaudeVsGeminiFaceOff,
  GrokVsGptFaceOff,
} from './ModelFaceOff'
import { claudeVsGpt, claudeVsGemini, grokVsGpt } from './modelFaceOffData'

test('renders both contenders with their makers', () => {
  render(<ModelFaceOff config={claudeVsGpt} />)
  expect(screen.getByText('Claude')).toBeInTheDocument()
  expect(screen.getByText('Anthropic')).toBeInTheDocument()
  expect(screen.getByText('GPT')).toBeInTheDocument()
  expect(screen.getByText('OpenAI')).toBeInTheDocument()
})

test('renders every dimension as a duel row with two bars sized by score', () => {
  const { container } = render(<ModelFaceOff config={claudeVsGpt} />)

  const rows = container.querySelectorAll('li')
  expect(rows).toHaveLength(claudeVsGpt.dimensions.length)

  claudeVsGpt.dimensions.forEach((dim, i) => {
    const row = rows[i]
    expect(within(row).getByText(dim.label)).toBeInTheDocument()

    const leftBar = row.querySelector('[data-testid="bar-left"]')
    const rightBar = row.querySelector('[data-testid="bar-right"]')
    expect(leftBar).toHaveAttribute('data-score', String(dim.left))
    expect(rightBar).toHaveAttribute('data-score', String(dim.right))
    expect((leftBar as HTMLElement).style.width).toBe(`${(dim.left / 5) * 100}%`)
    expect((rightBar as HTMLElement).style.width).toBe(`${(dim.right / 5) * 100}%`)
  })
})

test('gives screen readers each rating as plain text and hides the bars', () => {
  const { container } = render(<ModelFaceOff config={claudeVsGpt} />)

  // Every row carries a full sentence naming both models and both scores.
  for (const dim of claudeVsGpt.dimensions) {
    expect(
      screen.getByText(
        `${dim.label}: Claude ${dim.left} out of 5, GPT ${dim.right} out of 5.`,
      ),
    ).toBeInTheDocument()
  }

  // The bars themselves are decorative, hidden from the accessibility tree.
  for (const bar of container.querySelectorAll('[data-testid^="bar-"]')) {
    expect(bar.closest('[aria-hidden="true"]')).not.toBeNull()
  }
})

test('shows the editorial-snapshot caption', () => {
  render(<ModelFaceOff config={grokVsGpt} />)
  expect(
    screen.getByText(/editorial ratings on a 1 to 5 scale/),
  ).toBeInTheDocument()
})

test('wrapper components render their configured matchups', () => {
  const { unmount: u1 } = render(<ClaudeVsGptFaceOff />)
  expect(screen.getByText('OpenAI')).toBeInTheDocument()
  u1()

  const { unmount: u2 } = render(<ClaudeVsGeminiFaceOff />)
  expect(screen.getByText('Google')).toBeInTheDocument()
  u2()

  render(<GrokVsGptFaceOff />)
  expect(screen.getByText('xAI')).toBeInTheDocument()
})

test('configs stay on the editorial 1 to 5 scale with 4 to 6 dimensions', () => {
  for (const config of [claudeVsGpt, claudeVsGemini, grokVsGpt]) {
    expect(config.dimensions.length).toBeGreaterThanOrEqual(4)
    expect(config.dimensions.length).toBeLessThanOrEqual(6)
    for (const dim of config.dimensions) {
      expect(dim.left).toBeGreaterThanOrEqual(1)
      expect(dim.left).toBeLessThanOrEqual(5)
      expect(dim.right).toBeGreaterThanOrEqual(1)
      expect(dim.right).toBeLessThanOrEqual(5)
    }
  }
})
