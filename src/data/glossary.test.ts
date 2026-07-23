import { glossaryTerms } from './glossary'
import { topics } from '../pages/learn/topics'

test('provides at least 50 unique, usable glossary terms', () => {
  expect(glossaryTerms.length).toBeGreaterThanOrEqual(50)

  const ids = glossaryTerms.map((term) => term.id)
  const names = glossaryTerms.map((term) => term.term.toLocaleLowerCase())
  expect(new Set(ids).size).toBe(ids.length)
  expect(new Set(names).size).toBe(names.length)

  for (const term of glossaryTerms) {
    expect(term.id).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    expect(term.term.trim()).not.toBe('')
    expect(term.short.trim()).not.toBe('')
    expect(term.long.trim()).not.toBe('')
  }
})

test('every internal Learn link points at a real topic', () => {
  const slugs = new Set(topics.map((t) => t.slug))
  const broken = glossaryTerms
    .filter((t) => t.relatedLearnTopic && !slugs.has(t.relatedLearnTopic))
    .map((t) => `${t.id} -> ${t.relatedLearnTopic}`)
  expect(broken).toEqual([])
})

test('includes the requested agent and protocol jargon with plain-language explanations', () => {
  const requestedTerms = [
    'ai-agent',
    'a2a',
    'lsp',
    'mcp',
    'multimodal',
    'rag',
  ]

  for (const id of requestedTerms) {
    const term = glossaryTerms.find((entry) => entry.id === id)
    expect(term).toBeDefined()
    expect(term?.short).not.toBe('')
    expect(term?.long).not.toBe('')
  }

  expect(glossaryTerms.find((entry) => entry.id === 'a2a')?.term).toContain('Agent2Agent')
  expect(glossaryTerms.find((entry) => entry.id === 'lsp')?.term).toContain('Language Server Protocol')
  expect(glossaryTerms.find((entry) => entry.id === 'mcp')?.term).toContain('Model Context Protocol')
})

test('includes common LLM jargon terms with plain-language explanations', () => {
  const jargonTerms = [
    'system-prompt',
    'chain-of-thought',
    'few-shot-prompting',
    'distillation',
    'quantization',
    'mixture-of-experts',
    'streaming',
    'jailbreak',
  ]

  for (const id of jargonTerms) {
    const term = glossaryTerms.find((entry) => entry.id === id)
    expect(term).toBeDefined()
    expect(term?.short).not.toBe('')
    expect(term?.long).not.toBe('')
  }

  expect(glossaryTerms.find((entry) => entry.id === 'few-shot-prompting')?.long).toContain('Zero-shot')
  expect(glossaryTerms.find((entry) => entry.id === 'mixture-of-experts')?.long).toContain('MoE')
})

test('includes the agent-era terms with plain-language explanations', () => {
  const agentTerms = [
    'seed',
    'skill',
    'function-calling',
    'code-mode',
    'vibe-coding',
    'neural-network',
    'prompt-injection',
    'prompt-poisoning',
    'reasoning-effort',
    'thinking',
    'plan-mode',
    'agent-orchestration',
  ]

  for (const id of agentTerms) {
    const term = glossaryTerms.find((entry) => entry.id === id)
    expect(term).toBeDefined()
    expect(term?.short).not.toBe('')
    expect(term?.long).not.toBe('')
  }

  // Official references requested in issue #105.
  expect(glossaryTerms.find((entry) => entry.id === 'mcp')?.sourceUrl).toBe(
    'https://modelcontextprotocol.io',
  )
  expect(glossaryTerms.find((entry) => entry.id === 'skill')?.sourceUrl).toBe(
    'https://agentskills.io',
  )
  expect(glossaryTerms.find((entry) => entry.id === 'vibe-coding')?.long).toContain('Karpathy')
})

test('search & ranking section holds exactly the retrieval concepts', () => {
  const searchRanking = glossaryTerms
    .filter((term) => term.category === 'search-ranking')
    .map((term) => term.id)
    .sort()

  expect(searchRanking).toEqual([
    'bm25',
    'cosine-similarity',
    'semantic-search',
    'tf-idf',
    'vector-search',
  ])

  // Every other term stays in the default (general) section.
  for (const term of glossaryTerms) {
    expect([undefined, 'general', 'search-ranking']).toContain(term.category)
  }
})
