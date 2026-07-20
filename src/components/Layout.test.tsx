import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { Layout } from './Layout.tsx'

describe('Layout', () => {
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

    expect(screen.getByText('July 20, 2026')).toBeVisible()
    expect(screen.getByText('July 20, 2026')).toHaveAttribute(
      'datetime',
      '2026-07-20T00:00:00.000Z',
    )
  })
})
