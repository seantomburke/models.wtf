import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { dataSourcedAt } from '../data/index.ts'
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
