import { DIGITS, OUTPUT_WEIGHTS, SEGMENTS } from './digitClassifierModel'

/**
 * The output layer's 70 weights as a 10x7 matrix: one row per digit, one
 * column per stroke detector. Green = +1 (the digit expects that stroke),
 * red = -1 (the stroke counts against it). Same green/red convention as the
 * 3-vs-E classifier's weight heatmap.
 */

const POSITIVE = 'rgba(34, 197, 94, 0.55)'
const NEGATIVE = 'rgba(239, 68, 68, 0.4)'

export function DigitOutputWeights() {
  return (
    <div>
      <div className="overflow-x-auto">
        <table className="border-separate border-spacing-1">
          <thead>
            <tr>
              <th scope="col" className="pr-2 text-left text-xs font-medium text-fg-muted">
                Digit
              </th>
              {SEGMENTS.map((seg) => (
                <th key={seg.name} scope="col" className="px-0 text-center">
                  <span
                    className="mx-auto block h-3 w-3 rounded-sm"
                    style={{ background: seg.color }}
                    title={seg.name}
                  />
                  <span className="sr-only">{seg.name}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {DIGITS.map((digit) => (
              <tr key={digit}>
                <th scope="row" className="pr-2 text-left font-mono text-sm text-fg-secondary">
                  {digit}
                </th>
                {OUTPUT_WEIGHTS[digit].map((w, j) => (
                  <td
                    key={j}
                    className="h-6 w-6 rounded-sm border border-line text-center align-middle text-[10px] font-semibold text-fg-secondary"
                    style={{ background: w > 0 ? POSITIVE : NEGATIVE }}
                    title={`${SEGMENTS[j].name}: ${w > 0 ? '+1, expected' : '-1, counts against'} for "${digit}"`}
                  >
                    {w > 0 ? '+' : '−'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-xs text-fg-secondary">
        <span className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-sm" style={{ background: POSITIVE }} />
          Weight +1 — the digit expects this stroke
        </span>
        <span className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-sm" style={{ background: NEGATIVE }} />
          Weight −1 — this stroke is evidence against the digit
        </span>
      </div>

      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-fg-muted">
        {SEGMENTS.map((seg) => (
          <span key={seg.name} className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm" style={{ background: seg.color }} />
            {seg.name}
          </span>
        ))}
      </div>
    </div>
  )
}
