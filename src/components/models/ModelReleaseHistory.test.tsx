import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { ModelReleaseHistory } from './ModelReleaseHistory'
import { releases } from '../../data'

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>)
}

describe('ModelReleaseHistory component', () => {
  test('renders entries for a model with releases', () => {
    const expected = releases.filter((r) => r.modelId === 'gemini-3-6-flash')
    expect(expected.length).toBeGreaterThan(0)

    renderWithRouter(<ModelReleaseHistory modelId="gemini-3-6-flash" />)
    expect(screen.getByText('Release History')).toBeInTheDocument()
    for (const release of expected) {
      expect(screen.getByText(release.title)).toBeInTheDocument()
      expect(screen.getByText(release.description)).toBeInTheDocument()
    }
  })

  test('renders null for a model without releases', () => {
    const { container } = renderWithRouter(<ModelReleaseHistory modelId="no-such-model" />)
    expect(container.firstChild).toBeNull()
  })

  test('orders entries newest first', () => {
    renderWithRouter(<ModelReleaseHistory modelId="claude-sonnet-5" />)
    const articles = screen.getAllByRole('article')
    expect(articles.length).toBeGreaterThan(1)

    const expected = releases
      .filter((r) => r.modelId === 'claude-sonnet-5')
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    const renderedTitles = articles.map((a) => a.querySelector('h3')?.textContent)
    expect(renderedTitles).toEqual(expected.map((r) => r.title))
  })

  test('does not mutate the shared releases array', () => {
    const before = releases.map((r) => r.id)
    renderWithRouter(<ModelReleaseHistory modelId="claude-sonnet-5" />)
    expect(releases.map((r) => r.id)).toEqual(before)
  })

  test('links to the full whats-new feed', () => {
    renderWithRouter(<ModelReleaseHistory modelId="gemini-3-6-flash" />)
    const link = screen.getByRole('link', { name: /see all updates/i })
    expect(link).toHaveAttribute('href', '/whats-new')
  })

  test('shows an external Read more link when a release has one', () => {
    // gemini-3-6-flash's launch entry carries a source link.
    renderWithRouter(<ModelReleaseHistory modelId="gemini-3-6-flash" />)
    const link = screen.getByRole('link', { name: /read more/i })
    expect(link).toHaveAttribute('target', '_blank')
    expect(link.getAttribute('href')).toMatch(/^https:\/\//)
  })
})
