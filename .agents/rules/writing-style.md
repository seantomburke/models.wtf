# Writing Style

Canonical rules for all user-facing copy on models.fyi. The site explains complex AI topics to normal people. Every sentence should read like a patient teacher talking to a bright 10-year-old. The copywriter role (`.agents/agents/copywriter.md`) applies these rules; this file is the source of truth.

## Voice

- Be concrete and specific. Prefer examples and analogies to abstractions.
- Use short sentences. One idea per sentence.
- Address one reader warmly and directly.
- Remove filler so every word earns its place.
- Avoid being verbose. If a paragraph can be a sentence, make it a sentence.

## Hard bans

1. **No em dashes or en dashes, anywhere in the repo.** This covers prose, UI strings, page titles, code comments, commit messages, and docs. Split the thought into sentences, or use a comma, colon, or parentheses. Guard: `src/lib/copy-style.test.ts`.
2. **No "X, not Y" contrast framing.** Never define something by negating its opposite in the same sentence ("it learns patterns, not examples"). State the intended claim directly ("it learns patterns"). If the contrast carries essential meaning, put the negation in its own sentence. Guard: `src/lib/copy-style.test.ts` (allowlist for the rare necessary case).
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

## Page titles

- Title separator is a pipe: `Compare AI models | Models.fyi`.
- Preserve SEO length constraints when rewriting titles or meta descriptions.

## Preserve when rewriting

- Factual accuracy, caveats, meaning, and implications.
- Dynamic template values such as `${variableName}` exactly as written.
- Structured-data shapes, field names, and substrings that tests anchor on.
