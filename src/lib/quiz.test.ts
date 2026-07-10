import { budgets, companyPrefs, profileModel, recommend, tasks } from './quiz'
import { models } from '../data/index.ts'

const task = (id: string) => tasks.find((t) => t.id === id)!

test('every quiz path ends in a recommendation with reasons', () => {
  for (const t of tasks) {
    for (const b of budgets) {
      for (const c of companyPrefs) {
        const rec = recommend(t, b.id, c.id)
        expect(rec.pick, `${t.id}/${b.id}/${c.id} produced no pick`).toBeDefined()
        expect(rec.why.length, `${t.id}/${b.id}/${c.id} has no reasons`).toBeGreaterThan(0)
      }
    }
  }
})

test('tasks needing live data only recommend internet-capable models', () => {
  for (const b of budgets) {
    for (const c of companyPrefs) {
      const rec = recommend(task('research'), b.id, c.id)
      expect(rec.pick.internetAccess, `${b.id}/${c.id} picked offline ${rec.pick.name}`).toBe(true)
    }
  }
})

test('open-source preference + research explains why open source does not fit', () => {
  const rec = recommend(task('research'), 'free', 'open-source')
  expect(rec.pick.internetAccess).toBe(true)
  expect(rec.why.join(' ')).toMatch(/live information/i)
})

test('free budget lands on an open-source model when no company is forced', () => {
  const rec = recommend(task('fix-bug'), 'free', 'any')
  expect(rec.pick.openSource).toBe(true)
})

test('premium coding lands on a top coding model', () => {
  const rec = recommend(task('build-app'), 'premium', 'any')
  const score = rec.pick.scores['swe-bench-pro'] ?? rec.pick.scores['swe-bench-verified'] ?? 0
  const bestScore = Math.max(
    ...models.map((m) => m.scores['swe-bench-pro'] ?? m.scores['swe-bench-verified'] ?? 0),
  )
  expect(score).toBe(bestScore)
})

test('simple tasks favor cheap models over flagships', () => {
  const rec = recommend(task('write-email'), 'value', 'any')
  expect(rec.pick.tier).not.toBe('flagship')
})

test('company preference is respected', () => {
  const rec = recommend(task('fix-bug'), 'premium', 'anthropic')
  expect(rec.pick.providerId).toBe('anthropic')
})

test('reverse flow produces a profile for every model', () => {
  for (const m of models) {
    const profile = profileModel(m)
    expect(profile.goodFor.length, `${m.id} has no goodFor`).toBeGreaterThan(0)
    expect(profile.audience.length, `${m.id} has no audience`).toBeGreaterThan(0)
  }
})

test('non-reasoning models carry a reasoning caveat', () => {
  const llama = models.find((m) => m.id === 'llama-4-maverick')!
  const profile = profileModel(llama)
  expect(profile.caveats.join(' ')).toMatch(/not a reasoning model/i)
})
