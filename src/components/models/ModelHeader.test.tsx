import { render as renderBare, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import type { ReactElement } from 'react'
import { ModelHeader } from './ModelHeader'
import { models, providers } from '../../data'

// The header's provider name is a router <Link>, so every render needs a router.
const render = (ui: ReactElement) => renderBare(<MemoryRouter>{ui}</MemoryRouter>)

describe('ModelHeader component', () => {
  test('renders model name', () => {
    const model = models[0]
    render(<ModelHeader model={model} provider={undefined} />)
    expect(screen.getByText(model.name)).toBeInTheDocument()
  })

  test('renders model blurb', () => {
    const model = models[0]
    render(<ModelHeader model={model} provider={undefined} />)
    expect(screen.getByText(model.blurb)).toBeInTheDocument()
  })

  test('renders provider name when provided', () => {
    const model = models[0]
    const provider = providers.find((p) => p.id === model.providerId)
    if (provider) {
      render(<ModelHeader model={model} provider={provider} />)
      expect(screen.getByText(provider.name)).toBeInTheDocument()
    }
  })

  test('displays reasoning badge for reasoning models', () => {
    const reasoningModel = models.find((m) => m.reasoning)
    if (reasoningModel) {
      render(<ModelHeader model={reasoningModel} provider={undefined} />)
      expect(screen.getByText(/🧠 Reasoning/)).toBeInTheDocument()
    }
  })

  test('displays web search badge for internet-enabled models', () => {
    const internetModel = models.find((m) => m.internetAccess)
    if (internetModel) {
      render(<ModelHeader model={internetModel} provider={undefined} />)
      expect(screen.getByText(/🌐 Web Search/)).toBeInTheDocument()
    }
  })

  test('does not display badges for non-reasoning models', () => {
    const nonReasoningModel = models.find((m) => !m.reasoning)
    if (nonReasoningModel) {
      const { container } = render(<ModelHeader model={nonReasoningModel} provider={undefined} />)
      expect(container.textContent).not.toContain('🧠 Reasoning')
    }
  })

  test('renders provider logo when provider is provided', () => {
    const model = models[0]
    const provider = providers.find((p) => p.id === model.providerId)
    if (provider) {
      render(<ModelHeader model={model} provider={provider} />)
      // ProviderLogo renders an SVG
      const svgs = document.querySelectorAll('svg')
      expect(svgs.length).toBeGreaterThan(0)
    }
  })
})
