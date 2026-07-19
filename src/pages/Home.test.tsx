import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { Home } from './Home'

describe('Home', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('renders main sections', () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>,
    )

    expect(screen.getByText(/Pick the right AI model/i)).toBeInTheDocument()
    expect(screen.getByText(/Which model should I use/i)).toBeInTheDocument()
    expect(screen.getByText(/Compare models/i)).toBeInTheDocument()
    expect(screen.getByText(/See it on a graph/i)).toBeInTheDocument()
  })

  it('does not show saved models section when no bookmarks', () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>,
    )

    expect(screen.queryByText(/Your saved models/i)).not.toBeInTheDocument()
  })

  it('shows saved models section when bookmarks exist', () => {
    localStorage.setItem('models-fyi-bookmarks', JSON.stringify(['claude-opus-4-8']))

    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>,
    )

    expect(screen.getByText(/Your saved models/i)).toBeInTheDocument()
    expect(screen.getByText(/Claude Opus 4.8/i)).toBeInTheDocument()
  })

  it('shows context window for bookmarked models', () => {
    localStorage.setItem('models-fyi-bookmarks', JSON.stringify(['claude-opus-4-8']))

    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>,
    )

    const contextWindows = screen.getAllByText(/context window/i)
    expect(contextWindows.length).toBeGreaterThanOrEqual(1)
  })
})
