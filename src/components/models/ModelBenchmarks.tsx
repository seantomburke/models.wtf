import type { Model, Benchmark } from '../../data/types'

interface Props {
  model: Model
  benchmarks: Benchmark[]
}

export function ModelBenchmarks({ model, benchmarks }: Props) {
  const groupedByCategory = benchmarks.reduce(
    (acc, bench) => {
      const cat = bench.category
      if (!acc[cat]) acc[cat] = []
      acc[cat].push(bench)
      return acc
    },
    {} as Record<string, Benchmark[]>,
  )

  return (
    <section>
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
        Benchmark Scores
      </h2>

      <div className="space-y-8">
        {Object.entries(groupedByCategory).map(([category, benches]) => (
          <div key={category}>
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">
              {category}
            </h3>
            <div className="space-y-3">
              {benches.map((bench) => {
                const score = model.scores[bench.id]
                if (score === undefined) return null
                return (
                  <div key={bench.id}>
                    <div className="flex justify-between items-start mb-1">
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">{bench.name}</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">{bench.eli5}</p>
                      </div>
                      <span className="text-lg font-bold text-slate-900 dark:text-white">
                        {score.toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                      <div
                        className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full transition-all"
                        style={{ width: `${score}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
