import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { RelatedModels } from './RelatedModels'
import { models } from '../../data/models'

describe('RelatedModels component', () => {
  const renderWithRouter = (component: React.ReactElement) => {
    return render(<BrowserRouter>{component}</BrowserRouter>)
  }

  test('renders heading when related models exist', () => {
    const modelWithRelated = models.find((m) => m.relatedModelIds && m.relatedModelIds.length > 0)
    if (modelWithRelated) {
      renderWithRouter(<RelatedModels currentModelId={modelWithRelated.id} />)
      expect(screen.getByText(/You Might Also Like/)).toBeInTheDocument()
    }
  })

  test('displays related model names', () => {
    const modelWithRelated = models.find((m) => m.relatedModelIds && m.relatedModelIds.length > 0)
    if (modelWithRelated && modelWithRelated.relatedModelIds) {
      renderWithRouter(<RelatedModels currentModelId={modelWithRelated.id} />)
      const relatedModel = models.find((m) => m.id === modelWithRelated.relatedModelIds![0])
      if (relatedModel) {
        expect(screen.getByText(relatedModel.name)).toBeInTheDocument()
      }
    }
  })

  test('displays related model blurbs', () => {
    const modelWithRelated = models.find((m) => m.relatedModelIds && m.relatedModelIds.length > 0)
    if (modelWithRelated && modelWithRelated.relatedModelIds) {
      renderWithRouter(<RelatedModels currentModelId={modelWithRelated.id} />)
      const relatedModel = models.find((m) => m.id === modelWithRelated.relatedModelIds![0])
      if (relatedModel) {
        expect(screen.getByText(relatedModel.blurb)).toBeInTheDocument()
      }
    }
  })

  test('does not render section when no related models', () => {
    const modelWithoutRelated = models.find((m) => !m.relatedModelIds || m.relatedModelIds.length === 0)
    if (modelWithoutRelated) {
      const { container } = renderWithRouter(<RelatedModels currentModelId={modelWithoutRelated.id} />)
      expect(container.firstChild).toBeEmptyDOMElement()
    }
  })

  test('creates links to related model detail pages', () => {
    const modelWithRelated = models.find((m) => m.relatedModelIds && m.relatedModelIds.length > 0)
    if (modelWithRelated && modelWithRelated.relatedModelIds) {
      renderWithRouter(<RelatedModels currentModelId={modelWithRelated.id} />)
      const relatedModel = models.find((m) => m.id === modelWithRelated.relatedModelIds![0])
      if (relatedModel) {
        const link = screen.getByRole('link', { name: new RegExp(relatedModel.name) })
        expect(link).toHaveAttribute('href', `/models/${relatedModel.id}`)
      }
    }
  })

  test('displays provider logos for related models', () => {
    const modelWithRelated = models.find((m) => m.relatedModelIds && m.relatedModelIds.length > 0)
    if (modelWithRelated && modelWithRelated.relatedModelIds) {
      const { container } = renderWithRouter(<RelatedModels currentModelId={modelWithRelated.id} />)
      // Check for SVGs (provider logos)
      const svgs = container.querySelectorAll('svg')
      expect(svgs.length).toBeGreaterThan(0)
    }
  })

  test('limits to related model count', () => {
    const modelWithRelated = models.find((m) => m.relatedModelIds && m.relatedModelIds.length > 0)
    if (modelWithRelated && modelWithRelated.relatedModelIds) {
      renderWithRouter(<RelatedModels currentModelId={modelWithRelated.id} />)
      // Should display only the related models specified
      const expectedCount = modelWithRelated.relatedModelIds.length
      const relatedModelsCards = screen.getAllByRole('link')
      // Filter for model detail links
      const modelLinks = relatedModelsCards.filter((link) => link.getAttribute('href')?.startsWith('/models/'))
      expect(modelLinks.length).toBeLessThanOrEqual(expectedCount)
    }
  })
})
