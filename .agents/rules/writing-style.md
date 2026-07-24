# Writing Style

Canonical rules for all user-facing copy on models.wtf. The site explains complex AI topics to normal people. Every sentence should read like a patient teacher talking to a bright 10-year-old. The copywriter skill (`.agents/skills/copywriter/SKILL.md`) applies these rules; this file is the source of truth.

## Voice

- Be concrete and specific. Prefer examples and analogies to abstractions.
- Use short sentences. One idea per sentence, and each sentence is complete, with a subject and a verb. Short means one idea. It does not mean fragments.
- Address one reader warmly and directly.
- Remove filler so every word earns its place.
- Avoid being verbose. If a paragraph can be a sentence, make it a sentence.

## Pronouns: you, we, never I

The reference for this voice is the Yelp graph-database article (a warm, first-person technical walk-through). Two rules come from it.

- **Never use "I".** The site is not a personal blog and has no single author speaking. Rewrite any "I" into "you" or "we".
- **"We" means the reader and the guide, together.** Use "we" freely wherever it reads warmer than "you", especially when walking through a live interaction or a result: "Now we can see that the Parrot-2D model picked 'cat'." The "we" is always you (the reader) plus the narrator standing beside you. It is **never** a company "we" ("we built this model", "we at models.wtf", "the models we track"). Rewrite any company "we" into the passive or the site name: "the models tracked here", "Models.wtf compares flagship models". This holds even in copy where the site describes itself, such as the FAQ or the homepage tagline.
- **"You" stays the default for invitations and instructions.** "You can draw a digit", "you pay for what the model reads". Reach for "we" when you and the reader are observing or discovering something in the same moment.

## Discovery cadence

The article teaches by walking through the work in order: set up the question, act, then observe the result together. Follow that arc in interactive learn content.

- **Set up, then act, then observe.** "Now let's run this on the whole dataset." → "We end up with three results." → "One of them looks suspicious." Narrate the step, take it, then read the outcome with the reader.
- **Use plain forward connectives to move between steps:** "Now", "Now let's", "So", "Then". These carry the reader from one step to the next the way the article does.
- **Show the reasoning, including honest uncertainty.** The article says "This looks promising, however, I believe there must be more" and then adjusts. In a learn module you can say "This works, but we can probably do better", then change the demo and watch what happens.
- **Quote real output verbatim.** The article pastes the actual reviews rather than paraphrasing. When a demo produces a concrete result, show the real thing (the real prediction, the real number) instead of describing it in the abstract.
- This cadence is for interactive, walk-through learn content. Static reference copy (FAQs, model descriptions, UI labels) stays direct and does not need the narration.

## Sentence structure

The register is a patient teacher, and a teacher uses classic sentence structure. Compressed copywriting reads clever and explains nothing. The worked example:

Before: "Meet Doodle-918: it sees loops and curves, the shapes that make a digit a digit. Draw one and watch parts become shapes become an answer."

After: "Meet Doodle-918. This is a model that can see loops and curves, and can interpret these into digits. You can draw a digit and watch how the different shapes become an answer."

The rules the After version follows:

1. **Periods over colon splices.** When a colon joins two clauses ("Meet Doodle-918: it sees..."), end the sentence and start a new one. Colons stay legal for true lists.
2. **Say what a thing is before what it does.** Classify first: "This is a model that can see loops and curves." A bare "it" whose referent was only implied leaves the reader guessing.
3. **"You can..." over bare imperatives in explanations.** Describe what the reader can do ("You can draw a digit and watch how...") instead of commanding them ("Draw one and watch"). Imperatives stay fine in genuine step-by-step instructions and UI labels like buttons.
4. **"can" frames capability.** "can see", "can interpret", "You can draw". Use it for abilities and invitations. Keep plain present tense for what a model is doing right now in a demo.
5. **Complete conventional syntax.** Subject, verb, object. No appositive fragments hanging off a comma ("the shapes that make a digit a digit"), no chained-verb tricolons ("parts become shapes become an answer"), no verbless punch fragments ("Eighty weights to name ten digits.").
6. **Spell out the connectives.** Join clauses with "and", "how", "that", "because". A comma standing in for a conjunction is a compression device, and compression is the copywriter register we are avoiding.
7. **Keep natural determiners.** Write "the different shapes" and "a digit". Keep articles even when they feel slightly redundant. Stripping them for punchiness is the old register.
8. **Follow the explainer arc.** What it is, then what it does, then what you can do with it.

These are style rules applied with judgment. There is no regex guard for them, because colons, imperatives, and short sentences all have legitimate uses.

## Patterns to remove

These devices show up in older site copy but never in the reference article. They read as clever compression, and the article proves you can explain the same ideas without them. Prefer the plain full-sentence version.

1. **Verbless punch fragments.** "Speed." / "Same magic as text models." / "Difference is in reliability and speed." Give every sentence a subject and a verb: "Grok is built for speed." / "It uses the same math as a text model." / "The difference shows up in reliability and speed."
2. **Colon-as-drama and colon-then-fragment.** "The catch: you cannot see the landscape." / "Best for: quick scripts." Reserve the colon for a real list or a quotation, the way the article uses it for its data counts and its quoted reviews. Otherwise write the full sentence: "The catch is that you cannot see the landscape."
3. **Arrow notation and equals-shorthand in prose.** Do not write "the cat sat on the ___", "Hamburger = 3 tokens", or "P(sick | positive)" inside a sentence. Spell it out in words and numbers ("Hamburger is three tokens"), and put real formulas in `MathBlock`. A plainly labeled count like "Businesses: 42,153" is fine, that is a list, not an operator.
4. **Rhetorical-question transitions.** "How worried should you be?" / "Why does one layer stop being enough?" as a lead-in to the next paragraph. The article states the point and then acts on it. Turn the question into the statement it was hiding: "The honest answer is smaller than most people guess."
5. **Clever tricolons and compressed triples.** "Condition on evidence, update, predict." / "guess, measure how wrong you are, repeat." One or two of these across a long topic is a flourish; a habit of them is the compressed register we are avoiding. When in doubt, write the steps as ordinary sentences.

None of these has a regex guard. Apply them with judgment, and preserve a device when it genuinely carries meaning that the plain version would lose.

## Hard bans

1. **No em dashes or en dashes, anywhere in the repo.** This covers prose, UI strings, page titles, code comments, commit messages, and docs. Split the thought into sentences, or use a comma, colon, or parentheses. Guard: `src/lib/copy-style.test.ts`. One exemption: a standalone em dash used as an empty-cell placeholder glyph (the dash alone in a string literal or JSX cell) is data display and stays. When sweeping dashes, edit each occurrence with judgment; a blind regex substitution once produced an unbalanced paren mid-comment. Verify with `git grep` plus the guard test, and remember curly quotes around a glyph defeat the exemption regex (use straight quotes).
2. **No negation-contrast framing, in either direction.** Never define something by pairing a negation with its correction in the same sentence. That covers "X, not Y" ("it learns patterns, not examples") and the reversed "doesn't X, it Z" / "never X; it just Z" ("the model never runs code itself; it just fills out a form"). State the intended claim directly ("it learns patterns"; "the model only fills out a form"). If the contrast carries essential meaning, put the negation in its own sentence. Guard: `src/lib/copy-style.test.ts` (allowlist for the rare necessary case).
3. No filler intensifiers ("really", "actually", "genuinely", "truly") when they add no meaning.
4. No rhetorical questions that merely introduce the next sentence.

## Visuals over text

- Prefer diagrams, animations, and interactive components to paragraphs. A visual helps a normal person see the idea; a wall of text hides it.
- Three or more consecutive paragraphs with no visual between them is a smell. Break it up with a diagram, an animation, or an interactive demo.
- If a topic gets too complex to explain simply, simplify the explanation and add a visual rather than adding more text.
- Animations follow the existing patterns: CSS keyframes in `src/index.css`, the shared rAF hook `src/components/learn/useCardAnimation.ts`, SVG motifs in `TopicCardAnimation.tsx`. Always respect `prefers-reduced-motion`.

## Math

- Render equations with the `MathBlock` component (`src/components/MathBlock.tsx`), which lazy-loads KaTeX. Write the formula in LaTeX.
- Do not build equations out of unicode subscripts and symbols in prose strings. A plain-text fallback belongs inside MathBlock, where it renders until KaTeX loads and serves prerendered HTML.
- Register the equation via `src/pages/learn/sectionComponents.ts` (wrap it in a tiny component like `WeightedSumEquation`) so katex hangs off the LearnTopic chunk. `check-bundle-budget.mjs` fails the build if katex reaches the homepage preloads.
- Testing MathBlock in jsdom: once the KaTeX stylesheet loads, jsdom's `getComputedStyle` chokes on it and every Testing Library role query throws. Assert `[role="math"]` and classes with `container.querySelector`. KaTeX renders bad LaTeX as `.katex-error` (with `throwOnError: false`), so an error-path test must select that class; `.katex` alone never appears and the waitFor times out.

## Page titles

- Title separator is a pipe: `Compare AI models | Models.wtf`. Changing the separator has three sync points beyond routeMeta: the JSON-LD name-strip regexes in `routeMeta.ts`, the OG title-strip regex in `scripts/generate-og-images.mjs`, and the feed titles (`src/lib/feed.ts` plus the autodiscovery title in `scripts/prerender.mjs`).
- Preserve SEO length constraints when rewriting titles or meta descriptions.

## Preserve when rewriting

- Factual accuracy, caveats, meaning, and implications.
- Dynamic template values such as `${variableName}` exactly as written.
- Structured-data shapes, field names, and substrings that tests anchor on.
