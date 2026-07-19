import type { Model, Provider } from '../../data/types'
import { ProviderLogo } from '../ProviderLogo'

interface Props {
  model: Model
  provider?: Provider
}

export function ModelHeader({ model, provider }: Props) {
  return (
    <div className="border-b border-slate-200 dark:border-slate-700 pb-8">
      <div className="flex flex-wrap items-start gap-4 mb-4">
        {provider && (
          <div className="flex-shrink-0">
            <ProviderLogo providerId={provider.id} size={32} />
          </div>
        )}
        <div className="flex-1 min-w-48">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
            {model.name}
          </h1>
          {provider && (
            <p className="text-lg text-slate-600 dark:text-slate-400">{provider.name}</p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {model.reasoning && (
            <span className="whitespace-nowrap px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-md text-sm font-medium">
              🧠 Reasoning
            </span>
          )}
          {model.internetAccess && (
            <span className="whitespace-nowrap px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-md text-sm font-medium">
              🌐 Web Search
            </span>
          )}
        </div>
      </div>
      <p className="text-lg text-slate-700 dark:text-slate-300">{model.blurb}</p>
    </div>
  )
}
