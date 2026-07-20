import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  trackCalculatorUsage,
  trackGraphInteraction,
  trackModelInteraction,
  trackQuizInteraction,
} from './posthog.ts'
import { capture } from './analytics.ts'

vi.mock('./analytics.ts', () => ({ capture: vi.fn() }))

beforeEach(() => {
  vi.clearAllMocks()
})

describe('static event mappings', () => {
  it('maps every model interaction action', () => {
    trackModelInteraction('view', 'Claude')
    trackModelInteraction('compare', 'Claude')
    trackModelInteraction('click', 'Claude')

    expect(capture).toHaveBeenNthCalledWith(1, 'model_view', { model_name: 'Claude' })
    expect(capture).toHaveBeenNthCalledWith(2, 'model_compare', { model_name: 'Claude' })
    expect(capture).toHaveBeenNthCalledWith(3, 'model_click', { model_name: 'Claude' })
  })

  it('maps every quiz interaction action', () => {
    trackQuizInteraction('start')
    trackQuizInteraction('answer')
    trackQuizInteraction('complete')

    expect(capture).toHaveBeenNthCalledWith(1, 'quiz_start', undefined)
    expect(capture).toHaveBeenNthCalledWith(2, 'quiz_answer', undefined)
    expect(capture).toHaveBeenNthCalledWith(3, 'quiz_complete', undefined)
  })

  it('maps every calculator usage action', () => {
    trackCalculatorUsage('open')
    trackCalculatorUsage('calculate')
    trackCalculatorUsage('change_model')

    expect(capture).toHaveBeenNthCalledWith(1, 'calculator_open', undefined)
    expect(capture).toHaveBeenNthCalledWith(2, 'calculator_calculate', undefined)
    expect(capture).toHaveBeenNthCalledWith(3, 'calculator_change_model', undefined)
  })

  it('maps every graph interaction action', () => {
    trackGraphInteraction('view')
    trackGraphInteraction('filter')
    trackGraphInteraction('interact')

    expect(capture).toHaveBeenNthCalledWith(1, 'graph_view', undefined)
    expect(capture).toHaveBeenNthCalledWith(2, 'graph_filter', undefined)
    expect(capture).toHaveBeenNthCalledWith(3, 'graph_interact', undefined)
  })
})
