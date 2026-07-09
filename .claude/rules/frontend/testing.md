---
paths:
  - "**/*.test.ts"
  - "**/*.test.tsx"
  - "**/*.spec.ts"
  - "**/*.spec.tsx"
  - "**/__tests__/**"
---

# Frontend Testing

Extends the universal testing rules with frontend-specific patterns.

## Commands

```bash
npm test              # Run all tests (vitest)
npm test -- --watch   # Watch mode
```

## HTTP Mocking

Use MSW for API mocking:

```typescript
import { http, HttpResponse } from 'msw'

export const handlers = [
  http.get('/api/models', () => {
    return HttpResponse.json([{ id: 'opus', name: 'Opus' }])
  }),
]
```

## Async Waiting

```typescript
await waitFor(() => expect(element).toBeVisible())
// NOT: await sleep(500)
```
