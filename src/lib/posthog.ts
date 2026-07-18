import posthog from 'posthog-js'

export const trackPageView = (pageName: string, properties?: Record<string, unknown>) => {
  posthog.capture('page_view', {
    page_name: pageName,
    ...properties,
  })
}

export const trackModelInteraction = (
  action: 'view' | 'compare' | 'click',
  modelName: string,
  properties?: Record<string, unknown>,
) => {
  posthog.capture(`model_${action}`, {
    model_name: modelName,
    ...properties,
  })
}

export const trackSearch = (query: string, resultCount: number) => {
  posthog.capture('search_executed', {
    query,
    result_count: resultCount,
  })
}

export const trackQuizInteraction = (
  action: 'start' | 'answer' | 'complete',
  properties?: Record<string, unknown>,
) => {
  posthog.capture(`quiz_${action}`, properties)
}

export const trackCalculatorUsage = (
  action: 'open' | 'calculate' | 'change_model',
  properties?: Record<string, unknown>,
) => {
  posthog.capture(`calculator_${action}`, properties)
}

export const trackGraphInteraction = (
  action: 'view' | 'filter' | 'interact',
  properties?: Record<string, unknown>,
) => {
  posthog.capture(`graph_${action}`, properties)
}

export const trackLearnAccess = (topicSlug: string) => {
  posthog.capture('learn_topic_viewed', {
    topic_slug: topicSlug,
  })
}

export const trackUIError = (
  errorType: string,
  message: string,
  context?: Record<string, unknown>,
) => {
  posthog.capture('ui_error', {
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
  posthog.capture('performance_metric', {
    metric_name: metricName,
    duration_ms: duration,
    ...properties,
  })
}
