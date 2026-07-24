import { useState } from 'react'
import {
  SCENARIOS,
  APPROACH_LABEL,
  APPROACH_COST,
  type Approach,
} from './fineTuningModel'

/**
 * Interactive "which approach fits" demo for the fine-tuning-models topic.
 *
 * The reader picks a task and sees which of three approaches a practitioner
 * would reach for: prompt it, add retrieval, or fine-tune. The scale on the
 * left orders the three by upfront cost so the lesson lands visually. Try the
 * cheap thing first; fine-tuning is the far end, worth it only when the task is
 * narrow and the volume is high.
 */

const APPROACH_ORDER: Approach[] = ['prompt', 'rag', 'fine-tune']

/** Fixed light chip colors per approach, readable in both themes. */
const APPROACH_STYLE: Record<Approach, { backgroundColor: string; color: string }> = {
  prompt: { backgroundColor: '#BBF7D0', color: '#14532d' },
  rag: { backgroundColor: '#BFDBFE', color: '#1e3a8a' },
  'fine-tune': { backgroundColor: '#FDE68A', color: '#78350f' },
}

/** A little cost ladder so "try the cheap thing first" is something you see. */
function CostLadder({ active }: { active: Approach }) {
  return (
    <ol className="space-y-1.5" aria-label="approaches by upfront cost, cheapest first">
      {APPROACH_ORDER.map((approach, i) => {
        const isActive = approach === active
        return (
          <li
            key={approach}
            aria-current={isActive ? 'true' : undefined}
            className={`flex items-center gap-3 rounded-lg border px-3 py-2 transition-colors duration-150 ${
              isActive
                ? 'border-accent-deep bg-accent-soft'
                : 'border-line bg-surface-raised'
            }`}
          >
            <span
              className="shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold"
              style={APPROACH_STYLE[approach]}
            >
              {APPROACH_LABEL[approach]}
            </span>
            <span className="text-xs text-fg-secondary">
              {i === 0 ? 'cheapest' : i === APPROACH_ORDER.length - 1 ? 'most upfront cost' : 'more effort'}
            </span>
          </li>
        )
      })}
    </ol>
  )
}

export function FineTuningDemo() {
  const [scenarioId, setScenarioId] = useState(SCENARIOS[0].id)

  const scenario = SCENARIOS.find((s) => s.id === scenarioId) ?? SCENARIOS[0]

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-fg">Pick what you are building</h3>
        <div className="flex flex-wrap gap-2" role="group" aria-label="task choices">
          {SCENARIOS.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setScenarioId(s.id)}
              aria-pressed={s.id === scenario.id}
              className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors duration-150 ${
                s.id === scenario.id
                  ? 'border-accent-deep bg-accent-soft text-accent-deep'
                  : 'border-line bg-surface-raised text-fg hover:border-line-strong'
              }`}
            >
              {s.name}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-fg">Reach for the cheapest that works</h3>
          <CostLadder active={scenario.approach} />
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-fg">What fits this task</h3>
          <div
            className="space-y-2 rounded-lg border border-line bg-surface px-4 py-3"
            aria-label={`${APPROACH_LABEL[scenario.approach]}: ${scenario.reason}`}
          >
            <p className="text-sm text-fg-secondary">{scenario.task}</p>
            <span
              className="inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold"
              style={APPROACH_STYLE[scenario.approach]}
            >
              {APPROACH_LABEL[scenario.approach]}
            </span>
            <p className="text-sm text-fg">{scenario.reason}</p>
            <p className="text-xs text-fg-secondary">{APPROACH_COST[scenario.approach]}</p>
          </div>
        </div>
      </div>

      <p className="text-sm text-fg-secondary">
        Start at the top of the ladder and stop as soon as something works. A good prompt is free to
        try, retrieval hands the model facts it never saw, and fine-tuning is the far end. It pays off
        once the task is narrow and you run it thousands of times, so treat it as a scaling play.
      </p>
    </div>
  )
}
