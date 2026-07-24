import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import userEvent from '@testing-library/user-event'
import { dataSourcedAt } from '../data/index.ts'
import { Layout } from './Layout.tsx'

describe('Layout', () => {
  it('makes Search reachable and active in both navigation menus', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter initialEntries={['/search']}>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/search" element={<h1>Search</h1>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    )

    const desktopSearch = screen.getByRole('link', { name: 'Search', current: 'page' })
    expect(desktopSearch).toHaveAttribute('href', '/search')
    expect(desktopSearch).toHaveAttribute('aria-current', 'page')
    expect(desktopSearch).toHaveAttribute('title', 'Search (g s)')

    await user.click(screen.getByRole('button', { name: 'Toggle mobile menu' }))

    const activeSearchLinks = screen.getAllByRole('link', { name: 'Search', current: 'page' })
    expect(activeSearchLinks).toHaveLength(2)
    expect(activeSearchLinks[1]).toHaveAttribute('href', '/search')
  })

  it('labels the site logo with its Home destination', () => {
    render(
      <MemoryRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<h1>Test page</h1>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    )

    const logo = screen.getByRole('link', { name: 'models.wtf' })
    expect(logo).toHaveAttribute('href', '/')
    expect(logo).toHaveAttribute('title', 'Home')
  })

  it('renders the data refresh date consistently across browser timezones', () => {
    render(
      <MemoryRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<h1>Test page</h1>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    )

    const date = new Date(dataSourcedAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'UTC',
    })
    expect(screen.getByText(date)).toBeVisible()
    expect(screen.getByText(date)).toHaveAttribute(
      'datetime',
      new Date(dataSourcedAt).toISOString(),
    )
  })
})
