import { glossaryTerms } from './glossary'
import { faqs } from './faqs'

/**
 * The glossary and FAQ teach model selection by example. When the lineup moves
 * on, those examples quietly become wrong, and they contradict the model table
 * on the same site. This guards the prose against naming a retired generation.
 *
 * Entries in ALLOWED_HISTORICAL are deliberate references to the past (company
 * history, "how we got here"), where an old name is the correct name.
 */
const RETIRED_GENERATIONS =
  /\b(?:GPT-[1-4][\w.-]*|Claude [123](?:\.\d)?\b|Gemini [12](?:\.\d)?\b|Llama [123]\b|Grok [123]\b)/g

const ALLOWED_HISTORICAL = new Set([
  // "The company that created ChatGPT and GPT-4" is founding history.
  'openai',
])

test('glossary prose does not teach with retired model generations', () => {
  const stale = glossaryTerms
    .filter((term) => !ALLOWED_HISTORICAL.has(term.id))
    .flatMap((term) => {
      const hits = `${term.short} ${term.long}`.match(RETIRED_GENERATIONS) ?? []
      return hits.map((hit) => `${term.id} -> ${hit}`)
    })

  expect(stale).toEqual([])
})

test('FAQ answers do not teach with retired model generations', () => {
  const stale = faqs.flatMap((faq) => {
    const hits = `${faq.question} ${faq.answer}`.match(RETIRED_GENERATIONS) ?? []
    return hits.map((hit) => `${faq.question.slice(0, 40)} -> ${hit}`)
  })

  expect(stale).toEqual([])
})
