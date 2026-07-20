import { capture } from './analytics.ts'

type ModelInteraction = 'view' | 'compare' | 'click'
type QuizInteraction = 'start' | 'answer' | 'complete'
type CalculatorInteraction = 'open' | 'calculate' | 'change_model'
type GraphInteraction = 'view' | 'filter' | 'interact'

const MODEL_INTERACTION_EVENTS: Record<ModelInteraction, string> = {
  view: 'model_view',
  compare: 'model_compare',
  click: 'model_click',
}

const QUIZ_INTERACTION_EVENTS: Record<QuizInteraction, string> = {
  start: 'quiz_start',
  answer: 'quiz_answer',
  complete: 'quiz_complete',
}

const CALCULATOR_USAGE_EVENTS: Record<CalculatorInteraction, string> = {
  open: 'calculator_open',
  calculate: 'calculator_calculate',
  change_model: 'calculator_change_model',
}

const GRAPH_INTERACTION_EVENTS: Record<GraphInteraction, string> = {
  view: 'graph_view',
  filter: 'graph_filter',
  interact: 'graph_interact',
}

export const trackPageView = (pageName: string, properties?: Record<string, unknown>) => {
  capture('page_view', {
    page_name: pageName,
    ...properties,
  })
}

export const trackModelInteraction = (
  action: ModelInteraction,
  modelName: string,
  properties?: Record<string, unknown>,
) => {
  capture(MODEL_INTERACTION_EVENTS[action], {
    model_name: modelName,
    ...properties,
  })
}

export const trackSearch = (query: string, resultCount: number) => {
  capture('search_executed', {
    query,
    result_count: resultCount,
  })
}

export const trackQuizInteraction = (
  action: QuizInteraction,
  properties?: Record<string, unknown>,
) => {
  capture(QUIZ_INTERACTION_EVENTS[action], properties)
}

export const trackCalculatorUsage = (
  action: CalculatorInteraction,
  properties?: Record<string, unknown>,
) => {
  capture(CALCULATOR_USAGE_EVENTS[action], properties)
}

export const trackGraphInteraction = (
  action: GraphInteraction,
  properties?: Record<string, unknown>,
) => {
  capture(GRAPH_INTERACTION_EVENTS[action], properties)
}

export const trackLearnAccess = (topicSlug: string) => {
  capture('learn_topic_viewed', {
    topic_slug: topicSlug,
  })
}

export const trackUIError = (
  errorType: string,
  message: string,
  context?: Record<string, unknown>,
) => {
  capture('ui_error', {
    error_type: errorType,
    error_message: message,
    ...context,
  })
}

export const trackPerformance = (
  metricName: string,
  duration: number,
  properties?: Record<string, unknown>,
) => {
  capture('performance_metric', {
    metric_name: metricName,
    duration_ms: duration,
    ...properties,
  })
}
