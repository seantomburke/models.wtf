import { estimateTokens, loadTokenizer, loadTokenSplitter } from './tokenize.ts'

test('estimateTokens approximates four characters per token', () => {
  expect(estimateTokens('')).toBe(0)
  expect(estimateTokens('abcd')).toBe(1)
  expect(estimateTokens('abcde')).toBe(2)
  expect(estimateTokens('a'.repeat(400))).toBe(100)
})

test('loadTokenizer resolves a working counter and memoizes the load', async () => {
  const first = loadTokenizer()
  expect(loadTokenizer()).toBe(first)
  const count = await first
  expect(count('hello world')).toBeGreaterThan(0)
  expect(count('')).toBe(0)
  // A real BPE count is far below the 1-token-per-character worst case.
  expect(count('hello world, how are you today?')).toBeLessThan(15)
})

test('loadTokenSplitter resolves real token pieces and memoizes the load', async () => {
  const first = loadTokenSplitter()
  expect(loadTokenSplitter()).toBe(first)
  const split = await first
  expect(split('Understanding tokenization')).toEqual([
    'Understanding',
    ' token',
    'ization',
  ])
  expect(split('')).toEqual([])
  // Pieces reassemble to the original text, spaces included.
  const text = 'The quick brown fox jumps!'
  expect(split(text).join('')).toBe(text)
})

test('splitter and counter agree on token counts', async () => {
  const [split, count] = await Promise.all([loadTokenSplitter(), loadTokenizer()])
  const text = 'Supercalifragilisticexpialidocious is a rare word.'
  expect(split(text)).toHaveLength(count(text))
})
