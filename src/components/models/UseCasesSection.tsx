interface Props {
  useCases: string[]
}

const useCaseIcons: Record<string, string> = {
  coding: '💻',
  writing: '✍️',
  research: '🔬',
  analysis: '📊',
  creative: '🎨',
  translation: '🌐',
  tutoring: '👨‍🏫',
  summarization: '📝',
  brainstorming: '💡',
  debugging: '🐛',
}

export function UseCasesSection({ useCases }: Props) {
  return (
    <section>
      <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Best For</h2>
      <div className="space-y-2">
        {useCases.map((useCase) => (
          <div key={useCase} className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
            <span>{useCaseIcons[useCase] || '✓'}</span>
            <span className="capitalize">{useCase}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
