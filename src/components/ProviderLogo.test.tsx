import { render } from '@testing-library/react'
import { ProviderLogo } from './ProviderLogo'
import { providers } from '../data/index.ts'

test('every provider renders a decorative glyph or monogram', () => {
  for (const p of providers) {
    const { container, unmount } = render(<ProviderLogo providerId={p.id} />)
    const svg = container.querySelector('svg[aria-hidden="true"]')
    expect(svg, p.id).toBeInTheDocument()
    const path = svg?.querySelector('path')
    const monogram = svg?.querySelector('text')
    if (path) {
      expect(path.getAttribute('d'), p.id).toBeTruthy()
    } else {
      expect(monogram?.textContent, p.id).toBe(p.name[0])
    }
    unmount()
  }
})
