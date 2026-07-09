---
paths:
  - "**/*.tsx"
  - "**/*.jsx"
---

# React Patterns

When building data-heavy or dashboard-style UI, load the ce:design skill.

## Component Structure

- Prefer function components with hooks
- Keep components focused on one responsibility
- Extract custom hooks for reusable logic
- Style with Tailwind utility classes; avoid ad-hoc CSS files

## SEO and Accessibility

SEO is a product requirement, not an afterthought.

- Use semantic HTML (`<main>`, `<section>`, `<h1>`–`<h6>` in order, `<nav>`)
- Set page `<title>` and meta description per route
- Give every image meaningful `alt` text; label interactive elements

## Data Access

Model and benchmark data are hardcoded for now. Import from the typed data module rather than inlining literals in components, so the eventual database migration stays contained.

## Testing Components

Use Testing Library idioms:

```typescript
import { render, screen } from '@testing-library/react'

test('renders model name', () => {
  render(<ModelCard name="Opus 4.8" />)
  expect(screen.getByText('Opus 4.8')).toBeInTheDocument()
})
```
