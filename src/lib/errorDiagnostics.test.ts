import {
  currentRoute,
  sanitizeComponentStack,
  sanitizeErrorMessage,
  sanitizeErrorStack,
} from './errorDiagnostics.ts'

test('keeps the diagnostic part of an ordinary error message', () => {
  expect(sanitizeErrorMessage('Cannot read properties of undefined')).toBe(
    'Cannot read properties of undefined',
  )
})

test('redacts quoted values a message echoed back from user input', () => {
  // JSON.parse quotes whatever it was handed, which on /calculator is the
  // visitor's own text.
  expect(sanitizeErrorMessage('Unexpected token in JSON at "my private note"')).toBe(
    'Unexpected token in JSON at <redacted>',
  )
  expect(sanitizeErrorMessage("Invalid model 'gpt-secret-internal'")).toBe(
    'Invalid model <redacted>',
  )
})

test('redacts a query string carrying search state', () => {
  expect(sanitizeErrorMessage('Failed to load /search?q=how+do+i+cancel')).toBe(
    'Failed to load /search?<redacted>',
  )
})

test('truncates a runaway message that is quoting a payload', () => {
  const long = `Parse failure at position ${'x'.repeat(500)}`

  const result = sanitizeErrorMessage(long)

  expect(result).toHaveLength(303)
  expect(result?.endsWith('...')).toBe(true)
})

test('omits a message that is missing or has nothing left after redaction', () => {
  expect(sanitizeErrorMessage(undefined)).toBeUndefined()
  expect(sanitizeErrorMessage('')).toBeUndefined()
  expect(sanitizeErrorMessage('   ')).toBeUndefined()
  expect(sanitizeErrorMessage(null)).toBeUndefined()
})

test('keeps stack frames so a crash can be located', () => {
  const stack = [
    'TypeError: cannot read x',
    '    at renderPoint (https://models.wtf/assets/Graph-abc123.js:12:8)',
    '    at GraphCanvas (https://models.wtf/assets/Graph-abc123.js:40:2)',
  ].join('\n')

  const result = sanitizeErrorStack(stack)

  expect(result).toContain('renderPoint')
  expect(result).toContain('Graph-abc123.js:12:8')
  expect(result).toContain('GraphCanvas')
})

test('strips a query string from a stack frame URL but keeps the file', () => {
  const stack = '    at load (https://models.wtf/assets/Graph.js?q=secret+text:3:1)'

  const result = sanitizeErrorStack(stack)

  expect(result).toContain('Graph.js')
  expect(result).not.toContain('secret')
})

test('caps the stack at the frames nearest the throw', () => {
  const stack = Array.from({ length: 50 }, (_, i) => `    at frame${i} (app.js:${i}:1)`).join('\n')

  const result = sanitizeErrorStack(stack)

  expect(result?.split('\n')).toHaveLength(20)
  expect(result).toContain('frame0')
  expect(result).not.toContain('frame49')
})

test('omits a stack that is missing or blank', () => {
  expect(sanitizeErrorStack(undefined)).toBeUndefined()
  expect(sanitizeErrorStack('\n  \n')).toBeUndefined()
})

test('keeps the component names React reported', () => {
  const componentStack = ['    at GraphPoint', '    at GraphCanvas', '    at Graph'].join('\n')

  const result = sanitizeComponentStack(componentStack)

  expect(result).toBe('at GraphPoint\nat GraphCanvas\nat Graph')
})

test('caps the component stack at the frames nearest the throw', () => {
  const componentStack = Array.from({ length: 40 }, (_, i) => `    at Component${i}`).join('\n')

  expect(sanitizeComponentStack(componentStack)?.split('\n')).toHaveLength(20)
})

test('omits a component stack that is missing or blank', () => {
  expect(sanitizeComponentStack(undefined)).toBeUndefined()
  expect(sanitizeComponentStack('   ')).toBeUndefined()
})

test('reports the pathname without the state the site keeps in the query', () => {
  window.history.replaceState({}, '', '/graph?preset=price-reasoning&q=private')

  expect(currentRoute()).toBe('/graph')

  window.history.replaceState({}, '', '/')
})
