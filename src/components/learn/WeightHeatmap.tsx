import { GRID_SIZE, RAW_WEIGHTS, WEIGHTS } from './pixelClassifierModel'

/**
 * The classifier's 64 weights drawn as an 8x8 grid of colors.
 * Green = weight near 1 (evidence for "3"), red = weight near 0
 * (evidence for "E"), transparent = 0.5 (the pixel doesn't matter).
 */
export function WeightHeatmap() {
  return (
    <div>
      <div className="inline-block">
        <div
          className="inline-grid gap-1 rounded border border-line p-4"
          style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))` }}
        >
          {WEIGHTS.map((weight, i) => {
            const raw = RAW_WEIGHTS[i]
            const intensity = Math.abs(weight - 0.5) * 2
            const background =
              raw > 0
                ? `rgba(34, 197, 94, ${0.2 + intensity * 0.7})`
                : raw < 0
                  ? `rgba(239, 68, 68, ${0.2 + intensity * 0.7})`
                  : 'transparent'
            return (
              <div
                key={i}
                className="h-8 w-8 rounded-sm border border-line"
                style={{ background }}
                title={`Weight ${weight.toFixed(2)}: ${
                  raw > 0 ? 'evidence for "3"' : raw < 0 ? 'evidence for "E"' : 'neutral'
                }`}
              />
            )
          })}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-xs text-fg-secondary">
        <span className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-sm" style={{ background: 'rgba(34, 197, 94, 0.9)' }} />
          Weight near 1: ink here says "3"
        </span>
        <span className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-sm" style={{ background: 'rgba(239, 68, 68, 0.9)' }} />
          Weight near 0: ink here says "E"
        </span>
        <span className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-sm border border-line" />
          Weight 0.5: this pixel is ignored
        </span>
      </div>
    </div>
  )
}
