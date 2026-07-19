import { GRID_SIZE, PIXEL_COUNT, SEGMENTS, classifyDigit } from './digitClassifierModel'

/**
 * The hidden layer's weights drawn as seven mini 8x8 heatmaps — one per
 * stroke detector. Colored cells are the pixels that neuron watches (its
 * positive weights); everything else is weight 0. When a drawing is passed
 * in, each card also reports how strongly its detector is firing.
 */

interface DigitFeatureHeatmapsProps {
  pixels: boolean[]
}

export function DigitFeatureHeatmaps({ pixels }: DigitFeatureHeatmapsProps) {
  const { hidden } = classifyDigit(pixels)
  const anyInk = pixels.some(Boolean)

  return (
    <div className="flex flex-wrap gap-4">
      {SEGMENTS.map((seg, j) => {
        const activation = hidden[j]
        const firing = anyInk && activation > 0.5
        return (
          <div
            key={seg.name}
            className="rounded-lg border bg-surface p-3 transition-colors"
            style={{ borderColor: firing ? seg.color : 'var(--color-line)' }}
          >
            <div
              className="inline-grid gap-px"
              style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))` }}
              role="img"
              aria-label={`${seg.name} detector weights`}
            >
              {Array.from({ length: PIXEL_COUNT }, (_, i) => {
                const watched = seg.pixels.includes(i)
                const lit = watched && pixels[i]
                return (
                  <div
                    key={i}
                    className="h-3 w-3 rounded-[2px] border border-line"
                    style={{
                      background: watched ? seg.color : 'transparent',
                      opacity: watched ? (anyInk && !lit ? 0.3 : 1) : 1,
                    }}
                  />
                )
              })}
            </div>
            <div className="mt-2 flex items-center gap-2 text-xs">
              <span className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ background: seg.color }} />
              <span className="font-medium text-fg-secondary">{seg.name}</span>
            </div>
            <div className="mt-1 text-xs font-mono text-fg-muted">
              {anyInk ? `${(activation * 100).toFixed(0)}% active` : 'waiting for ink'}
            </div>
          </div>
        )
      })}
    </div>
  )
}
