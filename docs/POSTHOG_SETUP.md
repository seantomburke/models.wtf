# PostHog Setup & Integration Guide

Models.fyi now has comprehensive PostHog integration for error tracking, session recording, and user behavior analytics.

## What's Enabled

### 1. **Error Tracking**
- **Console errors**: Automatically captured by PostHog
- **Component errors**: Caught by ErrorBoundary, sent with component stack trace
- **Page leave tracking**: Captures when users navigate away or close the site
- **Dead click detection**: PostHog's built-in feature detects clicks that didn't trigger expected interactions

### 2. **Session Recording**
- Records all user interactions on your site
- Captures mouse movements, clicks, and form inputs
- Helps identify usability issues and dead clicks
- **Note**: Canvas recording disabled; text/input masking disabled for full context

### 3. **Performance Monitoring**
- Automatically captures Core Web Vitals
- Logs page view events with route information

### 4. **Automatic Events**
- `$pageview` - Fired on each route change
- `error_boundary_caught` - React component errors
- `dead_click` - Unresponsive elements (PostHog built-in)

## Usage in Code

### Tracking Page Views
Page views are automatically tracked via `usePostHogPageView` in the App component.

### Tracking User Interactions
Import and use tracking functions from `src/lib/posthog.ts`:

```typescript
import { trackModelInteraction, trackSearch, trackCalculatorUsage } from '@/lib/posthog'

// When user clicks a model
trackModelInteraction('click', 'Opus 4.8', { source: 'comparison' })

// When user executes a search
trackSearch('GPT-4', 5)

// When user opens calculator
trackCalculatorUsage('open', { page: '/calculator' })
```

### Available Tracking Functions

- `trackModelInteraction(action, modelName, properties)`
  - Actions: 'view', 'compare', 'click'
- `trackSearch(query, resultCount)`
- `trackQuizInteraction(action, properties)`
  - Actions: 'start', 'answer', 'complete'
- `trackCalculatorUsage(action, properties)`
  - Actions: 'open', 'calculate', 'change_model'
- `trackGraphInteraction(action, properties)`
  - Actions: 'view', 'filter', 'interact'
- `trackLearnAccess(topicSlug)`
- `trackUIError(errorType, message, context)`
- `trackPerformance(metricName, duration, properties)`

## Viewing Data in PostHog

### Dashboard Access
- Project: models.fyi (id: 516228)
- Base URL: https://us.posthog.com/project/516228

### Key Views

**Errors & Issues**
- Navigate to Errors in the left sidebar
- Filter by error_boundary_caught to see React component errors
- See dead click heatmaps to identify unresponsive UI elements

**Session Recordings**
- Navigate to Recordings in the sidebar
- Watch individual user sessions to debug issues
- Filter by dead clicks to find problem areas

**Events**
- View Events to see all captured interactions
- Search by event name (e.g., "model_click", "search_executed")
- Analyze user behavior flows

**Funnels**
- Create funnels to understand conversion flows (e.g., Home → Quiz → Complete)

## Environment Variables

PostHog is configured via `.env.production`:

```
VITE_POSTHOG_PROJECT_TOKEN=phc_uEJzDBgxU2kY9mLgtnwcha52PC4kU2T9iLLxuDHpsCoZ
VITE_POSTHOG_HOST=https://us.i.posthog.com
```

In development, PostHog runs in debug mode and logs to console.

## Product Improvement Workflow

1. **Identify Issues**
   - Check PostHog Errors for crashes/exceptions
   - Review Session Recordings for dead clicks and usability issues
   - Analyze event funnels to find drop-off points

2. **Investigate**
   - Watch specific sessions that had errors
   - Review console logs and component stack traces
   - Look at interaction patterns before the error

3. **Fix & Deploy**
   - Fix the issue in code
   - Deploy to production
   - Monitor new sessions to confirm the fix

4. **Track Impact**
   - Create dashboards to track key metrics
   - Monitor error rates over time
   - Track user engagement on fixed features

## Common Debugging Scenarios

### Dead Clicks Appearing on Buttons
1. Go to Errors → Dead Clicks in PostHog
2. Click the heatmap to see which buttons are problematic
3. Watch a recording of a session where it happened
4. Check if the button has proper click handlers or if it's disabled during async operations

### High Error Rate on Specific Page
1. Filter errors by URL in PostHog
2. Watch recordings of sessions on that page
3. Check component stack trace for the specific component
4. Review recent code changes to that route

### Users Getting Lost in Navigation
1. Create a funnel for your key flow (Home → Search → Compare)
2. Identify where users drop off
3. Watch recordings of sessions that didn't complete the flow
4. Test the UX yourself and improve navigation

## Tips & Best Practices

- **Add context to events**: When tracking, include enough properties to understand the action
- **Avoid PII**: Don't track sensitive information (emails, passwords, etc.)
- **Use meaningful names**: Event names should be clear (prefer 'model_click' over 'click')
- **Test in dev**: Run with `npm run dev` and check browser console for PostHog debug output
- **Regular reviews**: Check PostHog dashboards weekly to catch new issues early

## Configuration Reference

The PostHog initialization in `src/main.tsx` includes:

```typescript
session_recording: {
  recordCanvas: false,        // Don't record chart canvas
  maskAllInputs: false,       // Record what users type (for context)
  maskAllText: false,         // Record text (for context)
  collectWindowErrors: true,  // Capture console errors
}
dead_clicks_enabled: true,    // Detect unresponsive UI
capture_pageleave: true,      // Track when users leave
capture_performance: true,    // Track Core Web Vitals
```

Adjust these settings in `src/main.tsx` if you need to mask sensitive data in recordings.
