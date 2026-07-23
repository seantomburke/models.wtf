import { useState } from 'react'

// Representative rates, chosen to make the input/output split easy to see.
// Real model prices vary, but output costing several times more than input
// is the industry norm.
export const INPUT_RATE_PER_MILLION = 2
export const OUTPUT_RATE_PER_MILLION = 8

// Rough English rule of thumb: a word becomes about 4/3 tokens.
export function wordsToTokens(words: number): number {
  return Math.round((words * 4) / 3)
}

export function costForTokens(tokens: number, ratePerMillion: number): number {
  return (tokens / 1_000_000) * ratePerMillion
}

// Small dollar amounts need extra decimal places to stay visible. A quick
// question costs a tiny fraction of a cent, and rounding it to $0.00 would
// hide the whole lesson.
export function formatDollars(amount: number): string {
  if (amount === 0) return '$0.000000'
  if (amount < 0.01) return `$${amount.toFixed(6)}`
  return `$${amount.toFixed(4)}`
}

interface Scenario {
  id: string
  label: string
  description: string
  inputWords: number
  outputWords: number
}

export const SCENARIOS: Scenario[] = [
  {
    id: 'quick-question',
    label: 'Quick question',
    description: 'You ask one short question and the model gives a short answer.',
    inputWords: 15,
    outputWords: 120,
  },
  {
    id: 'document-summary',
    label: 'Document summary',
    description: 'You paste a long document and the model returns a short summary.',
    inputWords: 3000,
    outputWords: 250,
  },
  {
    id: 'long-essay',
    label: 'Long essay',
    description: 'You send a short prompt and the model writes a long essay.',
    inputWords: 40,
    outputWords: 1800,
  },
]

const MAX_TOKENS = 5000

function TokenStack({ tokens, colorClass }: { tokens: number; colorClass: string }) {
  const fraction = Math.min(tokens / MAX_TOKENS, 1)
  // Keep a sliver visible even for tiny counts so the reader can compare.
  const heightPct = Math.max(fraction * 100, 2)
  return (
    <div
      className="flex h-40 items-end rounded-md bg-bg-secondary"
      role="img"
      aria-label={`${tokens.toLocaleString()} tokens`}
    >
      <div
        className={`w-full rounded-md ${colorClass} motion-safe:transition-[height] motion-safe:duration-300`}
        style={{ height: `${heightPct}%` }}
      />
    </div>
  )
}

export function TokenCostVisualizer() {
  const [inputWords, setInputWords] = useState(SCENARIOS[0].inputWords)
  const [outputWords, setOutputWords] = useState(SCENARIOS[0].outputWords)
  const [activeScenario, setActiveScenario] = useState<string | null>(SCENARIOS[0].id)

  const inputTokens = wordsToTokens(inputWords)
  const outputTokens = wordsToTokens(outputWords)
  const inputCost = costForTokens(inputTokens, INPUT_RATE_PER_MILLION)
  const outputCost = costForTokens(outputTokens, OUTPUT_RATE_PER_MILLION)
  const totalCost = inputCost + outputCost

  const pickScenario = (scenario: Scenario) => {
    setActiveScenario(scenario.id)
    setInputWords(scenario.inputWords)
    setOutputWords(scenario.outputWords)
  }

  const activeDescription = SCENARIOS.find((s) => s.id === activeScenario)?.description

  return (
    <div className="space-y-6">
      <p className="text-sm text-fg-secondary">
        This is a pricing calculator for one conversation turn. You can pick a
        scenario, or you can drag the sliders to set your own sizes. The meter
        counts every token you send and every token that comes back, and it
        charges each side at its own rate.
      </p>

      <div className="flex flex-wrap gap-2" role="group" aria-label="Scenarios">
        {SCENARIOS.map((scenario) => (
          <button
            key={scenario.id}
            type="button"
            onClick={() => pickScenario(scenario)}
            aria-pressed={activeScenario === scenario.id}
            className={`rounded-full border px-4 py-1.5 text-sm font-medium motion-safe:transition-colors ${
              activeScenario === scenario.id
                ? 'border-accent-deep bg-accent-deep text-white'
                : 'border-line bg-surface text-fg hover:border-accent-deep'
            }`}
          >
            {scenario.label}
          </button>
        ))}
      </div>

      {activeDescription && (
        <p className="text-sm text-fg-secondary">{activeDescription}</p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-3 rounded-lg border border-line bg-surface p-4">
          <h3 className="text-sm font-semibold text-fg">What you send</h3>
          <TokenStack tokens={inputTokens} colorClass="bg-sky-300 dark:bg-sky-700" />
          <p className="text-sm text-fg-secondary">
            <span className="font-semibold text-fg">{inputTokens.toLocaleString()} input tokens</span>
            {' '}(about {inputWords.toLocaleString()} words)
          </p>
          <label className="block text-sm text-fg-secondary">
            Words you send
            <input
              type="range"
              min={5}
              max={3500}
              step={5}
              value={inputWords}
              onChange={(e) => {
                setActiveScenario(null)
                setInputWords(Number(e.target.value))
              }}
              className="mt-2 w-full accent-accent"
            />
          </label>
        </div>

        <div className="space-y-3 rounded-lg border border-line bg-surface p-4">
          <h3 className="text-sm font-semibold text-fg">What comes back</h3>
          <TokenStack tokens={outputTokens} colorClass="bg-amber-300 dark:bg-amber-600" />
          <p className="text-sm text-fg-secondary">
            <span className="font-semibold text-fg">{outputTokens.toLocaleString()} output tokens</span>
            {' '}(about {outputWords.toLocaleString()} words)
          </p>
          <label className="block text-sm text-fg-secondary">
            Words that come back
            <input
              type="range"
              min={5}
              max={3500}
              step={5}
              value={outputWords}
              onChange={(e) => {
                setActiveScenario(null)
                setOutputWords(Number(e.target.value))
              }}
              className="mt-2 w-full accent-accent"
            />
          </label>
        </div>
      </div>

      <div className="rounded-lg border border-line bg-surface p-4">
        <h3 className="text-sm font-semibold text-fg mb-3">The receipt</h3>
        <table className="w-full text-sm">
          <tbody>
            <tr className="border-b border-line">
              <td className="py-2 text-fg-secondary">
                Input: {inputTokens.toLocaleString()} tokens at ${INPUT_RATE_PER_MILLION} per million
              </td>
              <td className="py-2 text-right font-mono text-fg" data-testid="input-cost">
                {formatDollars(inputCost)}
              </td>
            </tr>
            <tr className="border-b border-line">
              <td className="py-2 text-fg-secondary">
                Output: {outputTokens.toLocaleString()} tokens at ${OUTPUT_RATE_PER_MILLION} per million
              </td>
              <td className="py-2 text-right font-mono text-fg" data-testid="output-cost">
                {formatDollars(outputCost)}
              </td>
            </tr>
            <tr>
              <td className="py-2 font-semibold text-fg">Total for this turn</td>
              <td className="py-2 text-right font-mono font-semibold text-fg" data-testid="total-cost">
                {formatDollars(totalCost)}
              </td>
            </tr>
          </tbody>
        </table>
        <p className="mt-3 text-sm text-fg-secondary">
          The meter runs on both sides of the conversation, and each output
          token costs {OUTPUT_RATE_PER_MILLION / INPUT_RATE_PER_MILLION}x what an
          input token costs. The expensive tokens are the ones the model writes.
          You can compare the long essay to the document summary and see how the
          smaller reply keeps the bill down even when the prompt is huge.
        </p>
      </div>
    </div>
  )
}
