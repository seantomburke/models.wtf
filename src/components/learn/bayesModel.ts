/**
 * Pure math for the Bayesian statistics lesson. No UI, no window access —
 * every number the two demos show is computed here from Bayes' theorem:
 *
 *   P(A | B) = P(B | A) · P(A) / P(B)
 *
 * Part 1 (the tree): the classic medical-test example. A two-stage
 * probability tree — sick or healthy, then test positive or negative —
 * whose four leaves are joint probabilities. The posterior
 * P(sick | positive) is the sick-and-positive leaf divided by the sum of
 * both positive leaves. The default numbers (1% prevalence, 90% sensitivity,
 * 10% false-positive rate) give the textbook surprise: a positive test means
 * only a 1-in-12 chance of being sick, because false positives from the
 * large healthy group outnumber true positives from the small sick group.
 *
 * Part 2 (next-word prediction): a mixture of two tiny bigram corpora with
 * a hidden "topic". Each observed word updates the posterior P(topic | words)
 * by Bayes' theorem, and the next-word distribution is the mixture
 * Σ_topic P(word | prev, topic) · P(topic | words). Watching the posterior
 * sharpen as words arrive is Bayesian updating, applied to language.
 */

// ---------------------------------------------------------------------------
// Part 1: the probability tree
// ---------------------------------------------------------------------------

export interface TreeLeaf {
  /** e.g. 'sick & positive' */
  id: 'sickPos' | 'sickNeg' | 'healthyPos' | 'healthyNeg'
  /** Joint probability: first-stage branch × second-stage branch. */
  joint: number
}

export interface BayesTree {
  /** P(sick): the prior, before any test. */
  prior: number
  /** P(positive | sick): the test's sensitivity. */
  sensitivity: number
  /** P(positive | healthy): the false-positive rate. */
  falsePositiveRate: number
  leaves: TreeLeaf[]
  /** P(positive) = sick∧pos + healthy∧pos: the evidence, Bayes' denominator. */
  evidence: number
  /** P(sick | positive) by Bayes' theorem. */
  posterior: number
}

/**
 * Build the full two-stage tree from the three input probabilities.
 * All four joint leaves always sum to 1 (each stage's branches sum to 1).
 */
export function bayesTree(prior: number, sensitivity: number, falsePositiveRate: number): BayesTree {
  const sickPos = prior * sensitivity
  const sickNeg = prior * (1 - sensitivity)
  const healthyPos = (1 - prior) * falsePositiveRate
  const healthyNeg = (1 - prior) * (1 - falsePositiveRate)
  const evidence = sickPos + healthyPos
  return {
    prior,
    sensitivity,
    falsePositiveRate,
    leaves: [
      { id: 'sickPos', joint: sickPos },
      { id: 'sickNeg', joint: sickNeg },
      { id: 'healthyPos', joint: healthyPos },
      { id: 'healthyNeg', joint: healthyNeg },
    ],
    evidence,
    // P(sick | positive) = P(positive | sick)·P(sick) / P(positive).
    // Evidence can only be 0 when no branch reaches "positive"; report 0
    // rather than NaN so the UI stays finite.
    posterior: evidence === 0 ? 0 : sickPos / evidence,
  }
}

/** The lesson's default numbers: posterior is exactly 9/108 = 1/12 ≈ 8.3%. */
export const DEFAULT_PRIOR = 0.01
export const DEFAULT_SENSITIVITY = 0.9
export const DEFAULT_FALSE_POSITIVE_RATE = 0.1

// ---------------------------------------------------------------------------
// Part 2: Bayesian next-word prediction
// ---------------------------------------------------------------------------

/**
 * Two tiny corpora, one per hidden topic. Same starter words on purpose:
 * "the rain…" and "the pan…" only separate the topics once the second word
 * lands, which is exactly the update the demo wants to show.
 */
export const TOPIC_CORPORA: Record<string, string[]> = {
  weather: [
    'the rain fell on the hills',
    'the rain fell all night',
    'the wind blew over the hills',
    'the storm blew in fast',
    'a cold wind blew in',
  ],
  cooking: [
    'the pan sat on the stove',
    'the soup boiled on the stove',
    'the bread baked all night',
    'a hot pan sat waiting',
    'the soup boiled over fast',
  ],
}

export const TOPICS = Object.keys(TOPIC_CORPORA)

/** Sentence-start sentinel, so the model also has P(first word | topic). */
export const SEQ_START = '<start>'

/** counts[topic].get(prev).get(next) — pure counting, exactly like Parrot-43. */
function topicBigramCounts(): Record<string, Map<string, Map<string, number>>> {
  const all: Record<string, Map<string, Map<string, number>>> = {}
  for (const [topic, corpus] of Object.entries(TOPIC_CORPORA)) {
    const counts = new Map<string, Map<string, number>>()
    const bump = (prev: string, next: string) => {
      const row = counts.get(prev) ?? new Map<string, number>()
      row.set(next, (row.get(next) ?? 0) + 1)
      counts.set(prev, row)
    }
    for (const sentence of corpus) {
      const words = sentence.split(' ')
      bump(SEQ_START, words[0])
      for (let i = 0; i < words.length - 1; i++) bump(words[i], words[i + 1])
    }
    all[topic] = counts
  }
  return all
}

const TOPIC_COUNTS = topicBigramCounts()

/** P(next | prev, topic): the bigram row normalized to probabilities. */
export function topicNextProbs(topic: string, prev: string): Map<string, number> {
  const row = TOPIC_COUNTS[topic]?.get(prev)
  if (!row) return new Map()
  let total = 0
  for (const n of row.values()) total += n
  const probs = new Map<string, number>()
  for (const [word, n] of row.entries()) probs.set(word, n / total)
  return probs
}

export interface TopicPosterior {
  topic: string
  posterior: number
}

/**
 * Bayesian update over the hidden topic, one observed word at a time:
 *
 *   P(topic | w₁…wₙ) ∝ P(topic) · Π P(wᵢ | wᵢ₋₁, topic)
 *
 * Implemented as the sequential form of Bayes' theorem — each word
 * multiplies the running posterior by its likelihood under each topic,
 * then renormalizes. Starts from a uniform prior over topics.
 * A word a topic has never seen in that position sends that topic's
 * posterior to zero (no smoothing: the demo is about honest counts).
 */
export function topicPosteriors(words: string[]): TopicPosterior[] {
  let priors = TOPICS.map(() => 1 / TOPICS.length)
  let prev = SEQ_START
  for (const word of words) {
    const likelihoods = TOPICS.map((topic) => topicNextProbs(topic, prev).get(word) ?? 0)
    const evidence = likelihoods.reduce((sum, l, i) => sum + l * priors[i], 0)
    // If no topic can explain the word, keep the current posterior rather
    // than dividing by zero; the UI never offers such words.
    if (evidence > 0) priors = likelihoods.map((l, i) => (l * priors[i]) / evidence)
    prev = word
  }
  return TOPICS.map((topic, i) => ({ topic, posterior: priors[i] }))
}

export interface MixturePrediction {
  word: string
  /** Σ_topic P(word | prev, topic) · P(topic | words so far). */
  prob: number
  /** Per-topic conditional P(word | prev, topic), for the breakdown UI. */
  perTopic: Record<string, number>
}

/**
 * The model's next-word distribution given the sentence so far: each
 * topic's bigram prediction, weighted by the Bayesian posterior over
 * topics. Probabilities sum to 1 whenever any topic has a continuation.
 * Ties break alphabetically so the demo is deterministic everywhere.
 */
export function mixtureNextWords(words: string[]): MixturePrediction[] {
  const posts = topicPosteriors(words)
  const prev = words.length === 0 ? SEQ_START : words[words.length - 1]
  const perTopicProbs = TOPICS.map((topic) => topicNextProbs(topic, prev))
  const vocab = new Set<string>()
  for (const probs of perTopicProbs) for (const word of probs.keys()) vocab.add(word)
  return [...vocab]
    .map((word) => {
      const perTopic: Record<string, number> = {}
      let prob = 0
      TOPICS.forEach((topic, i) => {
        const p = perTopicProbs[i].get(word) ?? 0
        perTopic[topic] = p
        prob += p * posts[i].posterior
      })
      return { word, prob, perTopic }
    })
    .filter((p) => p.prob > 0)
    .sort((a, b) => b.prob - a.prob || (a.word < b.word ? -1 : 1))
}
