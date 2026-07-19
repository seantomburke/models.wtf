import { CORPUS, START, END, bigramCounts, nextWords, parameterCount } from './nextWordModel'
import { topics } from '../../pages/learn/topics'

test('training is counting: bigram counts match the corpus', () => {
  const counts = bigramCounts()
  // "the cat" appears three times in the corpus.
  expect(counts.get('the')?.get('cat')).toBe(3)
  // Every sentence contributes a START transition to its first word.
  expect(counts.get(START)?.get('the')).toBe(6)
  expect(counts.get(START)?.get('a')).toBe(2)
  expect(counts.get(START)?.get('my')).toBe(1)
  // Sentence-final words transition to END.
  expect(counts.get('mat')?.get(END)).toBe(2)
})

test('predictions are probabilities that sum to 1, most likely first', () => {
  for (const prev of [START, 'the', 'cat', 'on']) {
    const preds = nextWords(prev)
    expect(preds.length).toBeGreaterThan(0)
    const total = preds.reduce((sum, p) => sum + p.prob, 0)
    expect(total).toBeCloseTo(1, 10)
    for (let i = 1; i < preds.length; i++) {
      expect(preds[i - 1].count).toBeGreaterThanOrEqual(preds[i].count)
    }
  }
})

test('unseen words predict nothing — the model can only parrot its training data', () => {
  expect(nextWords('helicopter')).toEqual([])
})

test('every word in the corpus has a continuation, so generation never dead-ends', () => {
  const vocab = new Set(CORPUS.flatMap((s) => s.split(' ')))
  for (const word of vocab) {
    expect(nextWords(word).length).toBeGreaterThan(0)
  }
})

test('the parameter count matches the name Parrot-43 used across the learn content', () => {
  expect(parameterCount()).toBe(43)
  const parrot = topics.find((t) => t.slug === 'how-llms-predict-the-next-word')
  expect(parrot?.modelSpec?.name).toBe('Parrot-43')
  expect(parrot?.modelSpec?.parameters).toContain('43')
})
