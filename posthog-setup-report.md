# PostHog post-wizard report

The wizard completed a targeted PostHog integration review for this Vite/TypeScript application. The existing deferred browser initialization and event helpers were preserved, `posthog-js` was updated through npm, PostHog environment variables were written to local and production env files, and four high-value interaction events were added without capturing user-entered search text or URLs. The production build and scoped lint checks both pass.

| Event | Description | File |
|---|---|---|
| `search_performed` | A visitor submitted a model search; only result volume is recorded, not user-entered text. | `src/pages/Search.tsx` |
| `search_result_clicked` | A visitor selected a model from search results. | `src/pages/Search.tsx` |
| `compare_link_copied` | A visitor successfully copied a shareable comparison link. | `src/pages/Compare.tsx` |
| `benchmark_source_clicked` | A visitor opened the external source for a benchmark. | `src/components/BenchmarkSourceLink.tsx` |

## Next steps

We've built insights and a dashboard to monitor discovery, selection, sharing, and source engagement:

- [Analytics basics dashboard (wizard)](https://us.posthog.com/project/516228/dashboard/1887746)
- [Search to model selection (wizard)](https://us.posthog.com/project/516228/insights/V7DT26dg)
- [Searches over time (wizard)](https://us.posthog.com/project/516228/insights/JTwOYsY3)
- [Search result selections (wizard)](https://us.posthog.com/project/516228/insights/msDIWqRL)
- [Shared comparisons (wizard)](https://us.posthog.com/project/516228/insights/cYl8dhIm)
- [Benchmark source engagement (wizard)](https://us.posthog.com/project/516228/insights/A3QDl8tp)

## Verify before merging

- [ ] Run a full production build and fix any lint or type errors introduced by the generated code.
- [ ] Run the test suite — call sites that were rewritten or instrumented may need updated mocks or fixtures.
- [ ] Add `VITE_POSTHOG_PROJECT_TOKEN` and `VITE_POSTHOG_HOST` to `.env.example` and any bootstrap documentation so collaborators know what to set.
- [ ] Wire source-map upload (`posthog-cli sourcemap` or the Vite upload step) into CI so production stack traces de-minify.

### Agent skill

We've left an agent skill folder in your project. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.
