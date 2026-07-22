import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import userEvent from '@testing-library/user-event'
import { WhatsNew } from './WhatsNew'

function renderWithRouter(component: React.ReactElement) {
  return render(<BrowserRouter>{component}</BrowserRouter>)
}

describe('WhatsNew', () => {
  it('renders the page heading', () => {
    renderWithRouter(<WhatsNew />)
    expect(screen.getByText("What's new")).toBeInTheDocument()
  })

  it('displays filter buttons', () => {
    renderWithRouter(<WhatsNew />)
    expect(screen.getByText('All')).toBeInTheDocument()
    expect(screen.getByText('New Models')).toBeInTheDocument()
    expect(screen.getByText('Updates')).toBeInTheDocument()
    expect(screen.getByText('Pricing')).toBeInTheDocument()
    expect(screen.getByText('Features')).toBeInTheDocument()
  })

  it('displays releases sorted by date (newest first)', () => {
    renderWithRouter(<WhatsNew />)
    const articles = screen.getAllByRole('article')
    expect(articles.length).toBeGreaterThan(0)
  })

  it('filters by release type', async () => {
    renderWithRouter(<WhatsNew />)
    const newModelsButton = screen.getByRole('button', { name: /New Models/ })

    await userEvent.click(newModelsButton)

    // Should show at least one "New" release
    const badges = screen.getAllByText(/🆕 New/)
    expect(badges.length).toBeGreaterThan(0)
  })

  it('links to the Atom feed', () => {
    renderWithRouter(<WhatsNew />)
    const feedLink = screen.getByRole('link', { name: /subscribe to the feed/i })
    expect(feedLink).toHaveAttribute('href', expect.stringMatching(/feed\.xml$/))
  })

  it('shows breadcrumbs', () => {
    renderWithRouter(<WhatsNew />)
    expect(screen.getByText('Home')).toBeInTheDocument()
    expect(screen.getByText("What's New")).toBeInTheDocument()
  })

  it('displays model names for releases with models', () => {
    renderWithRouter(<WhatsNew />)
    expect(screen.getByText('Claude Fable 5')).toBeInTheDocument()
  })

  it('displays relative dates', () => {
    renderWithRouter(<WhatsNew />)
    const dateElements = screen.getAllByText(/ago|Today|Yesterday/)
    expect(dateElements.length).toBeGreaterThan(0)
  })

  it('pluralizes relative dates correctly at a count of one', () => {
    // Pin "now" to 8 days after the 2026-07-21 release so it lands in the
    // one-week bucket — the case that used to render "1 weeks ago".
    vi.useFakeTimers({ now: new Date('2026-07-29T12:00:00Z'), toFake: ['Date'] })
    try {
      renderWithRouter(<WhatsNew />)
      expect(screen.getAllByText('1 week ago').length).toBeGreaterThan(0)
      expect(screen.queryByText(/\b1 (days|weeks|months|years) ago/)).not.toBeInTheDocument()
    } finally {
      vi.useRealTimers()
    }
  })

  it('displays the exact release date under each title', () => {
    renderWithRouter(<WhatsNew />)
    const articles = screen.getAllByRole('article')
    // Every article carries a full "Month D, YYYY" date line.
    const exactDates = screen.getAllByText(
      /^(January|February|March|April|May|June|July|August|September|October|November|December) \d{1,2}, \d{4}$/,
    )
    expect(exactDates.length).toBe(articles.length)
  })

  it('shows empty state when no releases match filter', async () => {
    renderWithRouter(<WhatsNew />)
    const pricingButton = screen.getByRole('button', { name: /Pricing/ })

    await userEvent.click(pricingButton)

    // Should still show price-change releases
    const priceReleases = screen.getAllByText(/💰 Price/)
    expect(priceReleases.length).toBeGreaterThan(0)
  })
})
