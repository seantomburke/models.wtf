import { describePricing, withArticle } from './format.ts'
import { roles } from './quiz.ts'

test('withArticle picks the right article for every quiz role', () => {
  const expected: Record<string, string> = {
    'Software engineer': 'a software engineer',
    Marketer: 'a marketer',
    Writer: 'a writer',
    Student: 'a student',
    'Researcher / analyst': 'a researcher / analyst',
    'Everyday curious person': 'an everyday curious person',
    Designer: 'a designer',
    'Sales professional': 'a sales professional',
    'Customer support': 'a customer support',
    'HR / People ops': 'an HR / people ops',
    'Finance / Accounting': 'a finance / accounting',
    'Legal / Compliance': 'a legal / compliance',
    'Operations / Logistics': 'an operations / logistics',
    'Product management': 'a product management',
    'Healthcare / Medical': 'a healthcare / medical',
    'Teacher / Educator': 'a teacher / educator',
    'Executive / Founder': 'an executive / founder',
  }
  for (const role of roles) {
    expect(withArticle(role.label)).toBe(expected[role.label])
  }
  // Every current role must be covered by this table.
  expect(roles.map((r) => r.label).sort()).toEqual(Object.keys(expected).sort())
})

test('describePricing maps price tiers to plain language with exact rates', () => {
  expect(describePricing(null, null)).toMatch(/free to download/i)
  expect(describePricing(0.2, 0.5)).toMatch(/^Very cheap/)
  expect(describePricing(1, 5)).toMatch(/^Cheap/)
  expect(describePricing(2.5, 15)).toMatch(/^Mid-priced/)
  expect(describePricing(10, 50)).toMatch(/^Premium/)
  // Exact rates ride along in the parenthetical.
  expect(describePricing(10, 50)).toContain('$10 in / $50 out')
})
