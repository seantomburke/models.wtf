import { describe, expect, it } from 'vitest'
import { END, generateSentence, generateSteps, nextChoices, positionSignal } from './positionAttentionModel'

describe('position and attention model', () => {
  it('gives the same word different next-word distributions by position', () => {
    expect(nextChoices('Bob', 'subject')[0].word).toBe('ignores')
    expect(nextChoices('Bob', 'object')[0].word).toBe(END)
    expect(positionSignal('subject')).not.toBe(positionSignal('object'))
  })

  it('generates a grammatical subject verb object sentence greedily', () => {
    expect(generateSentence(0.8, false)).toEqual(['Bob', 'ignores', 'Alice'])
  })

  it('reaches Charlie as a subject and "sees" as a verb', () => {
    expect(nextChoices('<start>', 'subject').map((choice) => choice.word)).toContain('Charlie')
    expect(nextChoices('Charlie', 'subject').map((choice) => choice.word)).toContain('sees')
    // "sees" is the neutral verb, so anyone can reach for it.
    expect(nextChoices('Bob', 'subject').map((choice) => choice.word)).toContain('sees')
    // Every person is a valid object, and each object ends the sentence.
    expect(nextChoices('Charlie', 'object')[0].word).toBe(END)
  })

  it('exposes generation one step at a time, feeding each word into the next', () => {
    const steps = generateSteps(0.8, false)
    expect(steps.map((step) => step.word)).toEqual(['Bob', 'ignores', 'Alice', END])
    // Each step reads the word the previous step produced.
    expect(steps[0].previous).toBe('<start>')
    expect(steps[1].previous).toBe('Bob')
    expect(steps[2].previous).toBe('ignores')
    expect(steps[3].previous).toBe('Alice')
  })
})
