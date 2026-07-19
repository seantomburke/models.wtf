import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { ReturnToTop } from './ReturnToTop'

describe('ReturnToTop', () => {
  it('renders without errors', () => {
    const { container } = render(<ReturnToTop />)
    expect(container).toBeDefined()
  })

  it('component can be imported and used', () => {
    render(<ReturnToTop />)
    // If it renders without throwing, the test passes
    expect(true).toBe(true)
  })
})
