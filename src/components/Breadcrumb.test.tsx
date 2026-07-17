import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { Breadcrumb } from './Breadcrumb'

const renderWithRouter = (component: React.ReactNode) => {
  return render(<BrowserRouter>{component}</BrowserRouter>)
}

describe('Breadcrumb', () => {
  it('renders breadcrumb navigation with links', () => {
    renderWithRouter(
      <Breadcrumb
        items={[
          { name: 'Home', path: '/' },
          { name: 'Compare', path: '/compare' },
        ]}
      />,
    )

    expect(screen.getByRole('navigation', { name: 'Breadcrumb' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Compare' })).toBeInTheDocument()
  })

  it('marks current page with aria-current', () => {
    renderWithRouter(
      <Breadcrumb
        items={[
          { name: 'Home', path: '/' },
          { name: 'Compare' }, // No path = current page
        ]}
      />,
    )

    const currentPage = screen.getByText('Compare')
    expect(currentPage).toHaveAttribute('aria-current', 'page')
  })

  it('renders separators between links', () => {
    const { container } = renderWithRouter(
      <Breadcrumb
        items={[
          { name: 'Home', path: '/' },
          { name: 'Learn', path: '/learn' },
          { name: 'Context Windows' },
        ]}
      />,
    )

    const separators = container.querySelectorAll('li span[class*="text-fg-muted"]')
    // Should have 2 separators (between Home/Learn and Learn/Context)
    expect(separators.length).toBe(2)
  })

  it('handles single item breadcrumb', () => {
    renderWithRouter(
      <Breadcrumb
        items={[
          { name: 'Home' }, // Current page only
        ]}
      />,
    )

    const currentPage = screen.getByText('Home')
    expect(currentPage).toHaveAttribute('aria-current', 'page')
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = renderWithRouter(
      <Breadcrumb
        items={[{ name: 'Home', path: '/' }]}
        className="custom-class"
      />,
    )

    const nav = container.querySelector('nav')
    expect(nav).toHaveClass('custom-class')
  })

  it('renders breadcrumb schema for SEO', () => {
    renderWithRouter(
      <Breadcrumb
        items={[
          { name: 'Home', path: '/' },
          { name: 'Compare', path: '/compare' },
        ]}
      />,
    )

    // Check if schema script was injected
    const script = document.getElementById('breadcrumb-schema')
    expect(script).toBeInTheDocument()
    expect(script).toHaveAttribute('type', 'application/ld+json')

    if (script?.textContent) {
      const schema = JSON.parse(script.textContent)
      expect(schema['@type']).toBe('BreadcrumbList')
      expect(schema.itemListElement).toHaveLength(2)
      expect(schema.itemListElement[0].name).toBe('Home')
      expect(schema.itemListElement[0].position).toBe(1)
      expect(schema.itemListElement[1].name).toBe('Compare')
      expect(schema.itemListElement[1].position).toBe(2)
    }
  })

  it('handles nested learn topic breadcrumbs', () => {
    renderWithRouter(
      <Breadcrumb
        items={[
          { name: 'Home', path: '/' },
          { name: 'Learn', path: '/learn' },
          { name: 'Context Windows' },
        ]}
      />,
    )

    expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Learn' })).toBeInTheDocument()
    expect(screen.getByText('Context Windows')).toHaveAttribute('aria-current', 'page')
  })

  it('handles 404 breadcrumb', () => {
    renderWithRouter(
      <Breadcrumb
        items={[
          { name: 'Home', path: '/' },
          { name: '404 Not Found' },
        ]}
      />,
    )

    expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument()
    expect(screen.getByText('404 Not Found')).toHaveAttribute('aria-current', 'page')
  })

  it('maintains responsive layout', () => {
    const { container } = renderWithRouter(
      <Breadcrumb
        items={[
          { name: 'Home', path: '/' },
          { name: 'Compare', path: '/compare' },
          { name: 'Models' },
        ]}
      />,
    )

    const ol = container.querySelector('ol')
    expect(ol).toHaveClass('flex', 'flex-wrap', 'gap-1')
  })
})
