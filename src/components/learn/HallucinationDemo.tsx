import { useState } from 'react'
import { PROMPTS, candidatesFor, type TruthTag } from './hallucinationModel'

/**
 * Fixed light chip colors for the truth tags, readable in both themes
 * (matches the highlight approach in TokenVisualization / NextWordPredictor).
 */
const TAG_STYLE: Record<TruthTag, { backgroundColor: string; color: string }> = {
  true: { backgroundColor: '#BBF7D0', color: '#14532d' },
  false: { backgroundColor: '#FECACA', color: '#7f1d1d' },
  unverifiable: { backgroundColor: '#E7E5E4', color: '#44403c' },
}

const TAG_LABEL: Record<TruthTag, string> = {
  true: 'true',
  false: 'false',
  unverifiable: 'unverifiable',
}

/**
 * Interactive "likely vs true" demo for the hallucinations topic. The reader
 * picks a prompt and sees the model's next-word candidates as probability
 * bars. A reveal step then tags each candidate as true, false, or
 * unverifiable, showing that the model ranks by likelihood alone and that a
 * confident wrong answer looks the same as a confident right one.
 */
export function HallucinationDemo() {
  const [promptId, setPromptId] = useState(PROMPTS[0].id)
  const [revealed, setRevealed] = useState(false)

  const active = PROMPTS.find((p) => p.id === promptId) ?? PROMPTS[0]
  const candidates = candidatesFor(active.id)

  const choosePrompt = (id: string) => {
    setPromptId(id)
    setRevealed(false)
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-fg">Pick a prompt for the model to finish</h3>
        <div className="flex flex-wrap gap-2" role="group" aria-label="prompt choices">
          {PROMPTS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => choosePrompt(p.id)}
              aria-pressed={p.id === active.id}
              className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors duration-150 ${
                p.id === active.id
                  ? 'border-accent-deep bg-accent-soft text-accent-deep'
                  : 'border-line bg-surface-raised text-fg hover:border-line-strong'
              }`}
            >
              {p.prompt}...
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-fg">
          What the model predicts after "{active.prompt}"
        </h3>
        <ul className="space-y-1.5">
          {candidates.map((c) => (
            <li
              key={c.word}
              className="rounded-lg border border-line bg-surface px-3 py-2"
              aria-label={
                revealed
                  ? `${c.word}: ${Math.round(c.prob * 100)}%, ${TAG_LABEL[c.tag]}`
                  : `${c.word}: ${Math.round(c.prob * 100)}%`
              }
            >
              <div className="flex items-center gap-3">
                <span className="w-24 shrink-0 font-medium text-fg">{c.word}</span>
                <span className="relative h-2.5 grow overflow-hidden rounded-full bg-accent-soft">
                  <span
                    className="absolute inset-y-0 left-0 rounded-full bg-accent-deep/70"
                    style={{ width: `${Math.round(c.prob * 100)}%` }}
                  />
                </span>
                <span className="w-12 shrink-0 text-right text-sm text-fg-secondary">
                  {Math.round(c.prob * 100)}%
                </span>
                {revealed && (
                  <span
                    className="w-24 shrink-0 rounded-full px-2 py-0.5 text-center text-xs font-semibold"
                    style={TAG_STYLE[c.tag]}
                  >
                    {TAG_LABEL[c.tag]}
                  </span>
                )}
              </div>
              {revealed && <p className="mt-1.5 text-sm text-fg-secondary">{c.note}</p>}
            </li>
          ))}
        </ul>
        <p className="text-sm text-fg-secondary">
          This is the whole scoreboard the model works from. Every candidate has a likelihood
          score and nothing else.
        </p>
      </div>

      {revealed ? (
        <div className="rounded-lg border border-line bg-surface p-4">
          <h3 className="text-sm font-semibold text-fg">What the tags show</h3>
          <p className="mt-1.5 text-sm text-fg-secondary">{active.lesson}</p>
          <p className="mt-1.5 text-sm text-fg-secondary">
            The tags come from us checking each answer by hand. The model has no column like
            this inside it, so a confident wrong answer looks exactly like a confident right
            one.
          </p>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setRevealed(true)}
          className="rounded-lg border border-line bg-surface-raised px-3 py-1.5 text-sm font-medium transition-colors duration-150 hover:border-line-strong"
        >
          Check the answers against reality
        </button>
      )}
    </div>
  )
}
