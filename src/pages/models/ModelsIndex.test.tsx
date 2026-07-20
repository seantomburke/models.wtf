import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { models } from '../../data/models'
import { providers } from '../../data'
import { ModelsIndex } from './ModelsIndex'

function renderIndex() {
  render(
    <MemoryRouter initialEntries={['/models']}>
      <ModelsIndex />
    </MemoryRouter>,
  )
}

describe('ModelsIndex page', () => {
  test('links to every model detail page', () => {
    renderIndex()

    // The whole point of this page: no model page is left orphaned.
    for (const model of models) {
      expect(screen.getByRole('link', { name: new RegExp(model.name, 'i') })).toHaveAttribute(
        'href',
        `/models/${model.id}`,
      )
    }
  })

  test('groups models under a heading for each provider that has one', () => {
    renderIndex()

    for (const provider of providers) {
      const hasModels = models.some((m) => m.providerId === provider.id)
      const heading = screen.queryByRole('heading', { name: provider.name, level: 2 })
      // Providers with no models must not render an empty section.
      expect(Boolean(heading)).toBe(hasModels)
    }
  })

  test('names self-hosted pricing instead of a footnote-less "Free*"', () => {
    renderIndex()

    const selfHosted = models.filter(
      (m) => m.inputPricePerMTok === null || m.outputPricePerMTok === null,
    )
    if (selfHosted.length > 0) {
      expect(screen.getAllByText(/self-hosted pricing/i).length).toBe(selfHosted.length)
    }
    expect(screen.queryByText(/Free\*/)).toBeNull()
  })
})
