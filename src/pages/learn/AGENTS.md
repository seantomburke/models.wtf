# Learn Guidance (src/pages/learn/)

Extends the root `AGENTS.md` and `src/AGENTS.md`. The Learn section teaches AI concepts to normal people. Follow `.agents/rules/writing-style.md` for every word of copy.

## Content rules

- Prefer interactive visuals, diagrams, and animations over paragraph blocks. Three consecutive paragraphs without a visual is a smell; build a component instead. The 2026-07-23 visuals audit filed issues #110-#124 (label `learn-visuals`) for the topics that violate this; work them down before adding more prose-only topics.
- Math renders through `MathBlock` (`src/components/MathBlock.tsx`) with LaTeX. No unicode-art equations in prose strings. Reference implementation: `WeightedSumEquation` registered in `sectionComponents.ts` for the weights topic.
- Section headings are shared keys: `topicProse.ts` and `sectionComponents.ts` both key on `<slug>::<heading>` from `topics.ts`. Renaming a heading means updating all keyed files in the same change or the prose and demo silently vanish (a Learn.test guard catches missing prose).
- Long prose lives in `topicProse.ts`, which loads lazily. Never import it top-level into `topics.ts`; that ships it on every route (see `.agents/rules/performance-budget.md`).

## Lab models

- The lab lineup (Doodle-64, Doodle-64R, Doodle-525, Doodle-918, Parrot-43, Parrot-2D, Finch-4) is named in the hardcoded lab level blurb in `topics.ts`. Adding a lab model means updating that blurb.
- Doodle-64R (`pixelGeneratorModel.ts` + `PixelGenerator.tsx`) is the generative inverse of Doodle-64: it reads the same `RAW_WEIGHTS` from `pixelClassifierModel.ts` backward to draw a 3 or an E. Keep the two models sharing one weight source so the read-back panel stays honest.
- Changing Parrot-43's training corpus means renaming it (the 43 counts its word pairs). Parrot-2D is named for its two readable embedding dimensions, not a parameter count, so its corpus can grow (it does, four words to six, inside the demo).
- `embeddingModel.ts` is the advanced embedding-search demo (the meaning-space map for `embedding-models`). The Parrot-2D next-word model lives in `sceneModel.ts` + `SceneNextWord.tsx`. Do not conflate the two.
- Finch-4 (`positionAttentionModel.ts` + `PositionAttentionLab.tsx`) reuses the `'subject'` slot for its first TWO predictions: step 0 (`<start>`→subject) picks the subject word, step 1 (that word→subject) picks the verb. So the internal `Slot` names do not map 1:1 to sentence roles; the UI derives the displayed role from step index (`PRODUCED_ROLES`), not from `slot`. Its corpus mirrors `sceneModel.ts` (Charlie is the neutral person, "sees" the neutral verb, lowercase like the other verbs). Greedy `generateSentence` must stay `['Bob','ignores','Alice']`, so Bob stays the top subject bar; a model test guards this.

## Adding a topic

- New topics need the sitemap rebuilt (and copied to `public/`) plus prerender coverage. `routeMeta.ts` drives both. `npm run build` writes `dist/sitemap.xml`; copy it to `public/sitemap.xml` or the `routeMeta.test.ts` guard fails.
- Every topic needs a `topicMotifs.ts` entry (a `TopicCardAnimation` guard enforces it) and prose for every section heading (a `Learn.test` guard enforces both directions).
- A lab topic's `topics.ts` metadata (model card, section headings, meta strings) ships in the shared `meta` chunk via `routeMeta.ts`. That chunk runs near its budget, so one new lab topic can push it over. When it does, raise the budget in `scripts/check-bundle-budget.mjs` with a dated comment (the prose itself stays lazy in `topicProse.ts` and does not count).
- Give the topic card a motif animation (`topicMotifs.ts` + `TopicCardAnimation.tsx`) and respect `prefers-reduced-motion`.
- Heavy interactive components gate their chunks on IntersectionObserver visibility with an always-load fallback.
