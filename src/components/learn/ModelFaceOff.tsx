import type { CSSProperties } from 'react'
import {
  claudeVsGpt,
  claudeVsGemini,
  grokVsGpt,
  type FaceOffConfig,
  type FaceOffContender,
} from './modelFaceOffData'

const MAX_SCORE = 5

/**
 * Custom properties carrying each contender's accent into Tailwind's
 * bg-(--face-off-*) arbitrary-value classes, so the dark override can live
 * in a dark: variant instead of JS theme detection.
 */
type AccentVars = CSSProperties & {
  '--face-off-accent': string
  '--face-off-accent-dark': string
}

function accentVars(contender: FaceOffContender): AccentVars {
  return {
    '--face-off-accent': contender.accent,
    '--face-off-accent-dark': contender.darkAccent ?? contender.accent,
  }
}

/**
 * One half of a duel row: a horizontal bar growing out from the center axis.
 * The bar itself is decorative; the score reaches screen readers through the
 * row's accessible label.
 */
function DuelBar({
  score,
  direction,
}: {
  score: number
  direction: 'left' | 'right'
}) {
  const width = `${(score / MAX_SCORE) * 100}%`
  return (
    <div
      className={`flex h-3 flex-1 items-center ${
        direction === 'left' ? 'justify-end' : 'justify-start'
      }`}
      aria-hidden="true"
    >
      <div
        className={`h-full bg-(--face-off-accent) dark:bg-(--face-off-accent-dark) ${
          direction === 'left' ? 'rounded-l-full' : 'rounded-r-full'
        }`}
        style={{ width }}
        data-testid={`bar-${direction}`}
        data-score={score}
      />
    </div>
  )
}

/**
 * A side-by-side comparison of two models across a handful of editorial
 * dimensions. Each row is a mirrored bar duel growing out from a center
 * axis, so the longer side shows who leads at a glance. Screen readers get
 * each rating as plain text through the row's group label.
 */
export function ModelFaceOff({ config }: { config: FaceOffConfig }) {
  const { left, right, dimensions } = config
  return (
    <figure className="space-y-4">
      <div className="rounded-lg border border-line bg-surface p-4 sm:p-6">
        <div className="mb-4 flex items-baseline justify-between gap-4">
          <div className="text-left" style={accentVars(left)}>
            <div className="flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 rounded-full bg-(--face-off-accent) dark:bg-(--face-off-accent-dark)"
                aria-hidden="true"
              />
              <span className="text-base font-semibold text-fg">{left.name}</span>
            </div>
            <p className="text-xs text-fg-muted">{left.maker}</p>
          </div>
          <span className="text-xs font-semibold uppercase tracking-wide text-fg-faint">
            vs
          </span>
          <div className="text-right" style={accentVars(right)}>
            <div className="flex items-center justify-end gap-2">
              <span className="text-base font-semibold text-fg">{right.name}</span>
              <span
                className="h-2.5 w-2.5 rounded-full bg-(--face-off-accent) dark:bg-(--face-off-accent-dark)"
                aria-hidden="true"
              />
            </div>
            <p className="text-xs text-fg-muted">{right.maker}</p>
          </div>
        </div>

        <ul className="space-y-3">
          {dimensions.map((dim) => (
            <li key={dim.label}>
              {/* Screen readers get the whole rating as one plain sentence. */}
              <span className="sr-only">
                {`${dim.label}: ${left.name} ${dim.left} out of ${MAX_SCORE}, ${right.name} ${dim.right} out of ${MAX_SCORE}.`}
              </span>
              <div
                className="mb-1 flex items-center justify-between text-xs text-fg-secondary"
                aria-hidden="true"
              >
                <span>
                  {dim.left}/{MAX_SCORE}
                </span>
                <span className="font-medium text-fg">{dim.label}</span>
                <span>
                  {dim.right}/{MAX_SCORE}
                </span>
              </div>
              <div className="flex items-center gap-px">
                <div className="flex flex-1" style={accentVars(left)}>
                  <DuelBar score={dim.left} direction="left" />
                </div>
                <div
                  className="h-4 w-px shrink-0 bg-line-strong"
                  aria-hidden="true"
                />
                <div className="flex flex-1" style={accentVars(right)}>
                  <DuelBar score={dim.right} direction="right" />
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
      <figcaption className="text-xs text-fg-muted">
        These are our editorial ratings on a 1 to 5 scale. They shift with each
        new release, so this chart is a snapshot of where each model stands
        today.
      </figcaption>
    </figure>
  )
}

/** Claude vs GPT duel for the claude-vs-gpt topic. */
export function ClaudeVsGptFaceOff() {
  return <ModelFaceOff config={claudeVsGpt} />
}

/** Claude vs Gemini duel for the claude-vs-gemini topic. */
export function ClaudeVsGeminiFaceOff() {
  return <ModelFaceOff config={claudeVsGemini} />
}

/** Grok vs GPT duel for the grok-vs-gpt topic. */
export function GrokVsGptFaceOff() {
  return <ModelFaceOff config={grokVsGpt} />
}
