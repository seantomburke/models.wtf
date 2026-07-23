import {
  bayesTree,
  DEFAULT_PRIOR,
  DEFAULT_SENSITIVITY,
  DEFAULT_FALSE_POSITIVE_RATE,
  TOPIC_CORPORA,
  TOPICS,
  SEQ_START,
  topicNextProbs,
  topicPosteriors,
  mixtureNextWords,
} from './bayesModel'

// ---------------------------------------------------------------------------
// The probability tree: every number is checkable by hand.
// ---------------------------------------------------------------------------

test('the default medical-test example gives the textbook posterior of exactly 1/12', () => {
  const tree = bayesTree(DEFAULT_PRIOR, DEFAULT_SENSITIVITY, DEFAULT_FALSE_POSITIVE_RATE)
  // Per 1000 people: 10 sick, of whom 9 test positive; 990 healthy, of whom
  // 99 test positive. P(sick | positive) = 9 / (9 + 99) = 9/108 = 1/12.
  expect(tree.leaves.find((l) => l.id === 'sickPos')?.joint).toBeCloseTo(0.009, 12)
  expect(tree.leaves.find((l) => l.id === 'healthyPos')?.joint).toBeCloseTo(0.099, 12)
  expect(tree.evidence).toBeCloseTo(0.108, 12)
  expect(tree.posterior).toBeCloseTo(1 / 12, 12)
})

test('joint probabilities at the four leaves always sum to 1', () => {
  for (const prior of [0, 0.01, 0.3, 0.5, 1]) {
    for (const sens of [0, 0.5, 0.9, 1]) {
      for (const fpr of [0, 0.1, 0.5, 1]) {
        const tree = bayesTree(prior, sens, fpr)
        const total = tree.leaves.reduce((sum, l) => sum + l.joint, 0)
        expect(total).toBeCloseTo(1, 12)
      }
    }
  }
})

test('the posterior satisfies Bayes\' theorem: P(A|B) · P(B) = P(B|A) · P(A)', () => {
  for (const [prior, sens, fpr] of [
    [0.01, 0.9, 0.1],
    [0.02, 0.85, 0.05],
    [0.5, 0.99, 0.01],
    [0.1, 0.7, 0.2],
  ]) {
    const tree = bayesTree(prior, sens, fpr)
    expect(tree.posterior * tree.evidence).toBeCloseTo(sens * prior, 12)
  }
})

test('a perfect test (no false positives) makes a positive result certain', () => {
  expect(bayesTree(0.01, 0.9, 0).posterior).toBe(1)
})

test('a useless test (false-positive rate equals sensitivity) leaves the prior unchanged', () => {
  // When P(positive | sick) = P(positive | healthy), the test carries no
  // information, so P(sick | positive) = P(sick).
  const tree = bayesTree(0.3, 0.8, 0.8)
  expect(tree.posterior).toBeCloseTo(0.3, 12)
})

test('an impossible positive (evidence 0) reports 0 instead of NaN', () => {
  expect(bayesTree(0, 0.9, 0).posterior).toBe(0)
})

// ---------------------------------------------------------------------------
// Bayesian next-word prediction: the mixture-of-topics model.
// ---------------------------------------------------------------------------

test('per-topic bigram probabilities come straight from corpus counts', () => {
  // Weather sentences starting with "the": 4 of 5, so P(the | start) = 4/5.
  expect(topicNextProbs('weather', SEQ_START).get('the')).toBeCloseTo(4 / 5, 12)
  expect(topicNextProbs('weather', SEQ_START).get('a')).toBeCloseTo(1 / 5, 12)
  // In the weather corpus, "the" is followed by: rain 2, wind 1, storm 1,
  // hills 2; six continuations in all.
  expect(topicNextProbs('weather', 'the').get('rain')).toBeCloseTo(2 / 6, 12)
  expect(topicNextProbs('weather', 'the').get('storm')).toBeCloseTo(1 / 6, 12)
  // The cooking corpus never mentions rain.
  expect(topicNextProbs('cooking', 'the').get('rain')).toBeUndefined()
})

test('each topic\'s next-word distribution sums to 1', () => {
  for (const topic of TOPICS) {
    for (const prev of [SEQ_START, 'the', 'blew', 'on']) {
      const probs = topicNextProbs(topic, prev)
      if (probs.size === 0) continue
      let total = 0
      for (const p of probs.values()) total += p
      expect(total).toBeCloseTo(1, 12)
    }
  }
})

test('the topic posterior starts uniform and stays uniform on topic-neutral words', () => {
  const start = topicPosteriors([])
  for (const { posterior } of start) expect(posterior).toBeCloseTo(1 / 2, 12)
  // "the" opens 4 of 5 sentences in both corpora, so it carries no evidence.
  const afterThe = topicPosteriors(['the'])
  for (const { posterior } of afterThe) expect(posterior).toBeCloseTo(1 / 2, 12)
})

test('a topic-specific word updates the posterior exactly as Bayes\' theorem says', () => {
  // After "the", P(rain | the, weather) = 2/6 and P(rain | the, cooking) = 0,
  // so P(weather | "the rain") = (2/6 · 1/2) / (2/6 · 1/2 + 0 · 1/2) = 1.
  const posts = topicPosteriors(['the', 'rain'])
  expect(posts.find((p) => p.topic === 'weather')?.posterior).toBeCloseTo(1, 12)
  expect(posts.find((p) => p.topic === 'cooking')?.posterior).toBeCloseTo(0, 12)
})

test('posteriors are a probability distribution after every prefix', () => {
  for (const prefix of [[], ['the'], ['a'], ['the', 'soup'], ['the', 'soup', 'boiled']]) {
    const posts = topicPosteriors(prefix)
    const total = posts.reduce((sum, p) => sum + p.posterior, 0)
    expect(total).toBeCloseTo(1, 12)
  }
})

test('the mixture prediction is the posterior-weighted sum of per-topic bigrams', () => {
  // At the start both topics are equally likely, so
  // P(the) = 1/2 · 4/5 + 1/2 · 4/5 = 4/5.
  const start = mixtureNextWords([])
  expect(start.find((p) => p.word === 'the')?.prob).toBeCloseTo(4 / 5, 12)
  expect(start.find((p) => p.word === 'a')?.prob).toBeCloseTo(1 / 5, 12)

  // After "the" (posterior still uniform):
  // P(rain | the) = 1/2 · 2/6 + 1/2 · 0 = 1/6.
  const afterThe = mixtureNextWords(['the'])
  expect(afterThe.find((p) => p.word === 'rain')?.prob).toBeCloseTo(1 / 6, 12)
  // P(soup | the) = 1/2 · 0 + 1/2 · 2/6 = 1/6.
  expect(afterThe.find((p) => p.word === 'soup')?.prob).toBeCloseTo(1 / 6, 12)

  // After "the rain" the weather posterior is 1, so the mixture equals the
  // weather bigram exactly: "rain" is always followed by "fell".
  const afterRain = mixtureNextWords(['the', 'rain'])
  expect(afterRain).toHaveLength(1)
  expect(afterRain[0].word).toBe('fell')
  expect(afterRain[0].prob).toBeCloseTo(1, 12)
})

test('mixture probabilities sum to 1 after every reachable prefix', () => {
  for (const prefix of [[], ['the'], ['the', 'rain'], ['the', 'soup'], ['a']]) {
    const preds = mixtureNextWords(prefix)
    const total = preds.reduce((sum, p) => sum + p.prob, 0)
    expect(total).toBeCloseTo(1, 12)
  }
})

test('sharper posteriors mean sharper predictions: the Bayesian payoff', () => {
  // P(fell | prev = "rain") under a stuck-at-uniform posterior would be
  // 1/2 · 1 + 1/2 · 0 = 1/2. With the observed prefix "the rain" the
  // posterior on weather is 1, so the model predicts "fell" at 100%;
  // the evidence sharpened the prediction.
  const stuckAtUniform = 0.5
  const observed = mixtureNextWords(['the', 'rain']).find((p) => p.word === 'fell')?.prob
  expect(observed).toBeGreaterThan(stuckAtUniform)
  expect(observed).toBeCloseTo(1, 12)
})

test('the two corpora stay in the shape the lesson describes', () => {
  // The prose sells specific numbers (5 sentences per topic, shared openers);
  // guard them so a corpus edit can't silently break the worked examples.
  expect(TOPIC_CORPORA.weather).toHaveLength(5)
  expect(TOPIC_CORPORA.cooking).toHaveLength(5)
  expect(TOPICS).toEqual(['weather', 'cooking'])
})
