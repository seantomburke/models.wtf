/**
 * Hardcoded next-word predictions for the hallucination demo.
 *
 * Each prompt lists the model's top candidate continuations with a
 * probability, exactly the shape a real language model produces. Each
 * candidate also carries a truth tag (true, false, unverifiable) that WE
 * added by hand. The model itself only has the probability column; the
 * truth column exists nowhere inside it. That gap is the whole lesson.
 */

/** How a candidate relates to reality. The model never sees this field. */
export type TruthTag = 'true' | 'false' | 'unverifiable'

export interface Candidate {
  /** The next word (or short phrase) the model might produce. */
  word: string
  /** The model's confidence that this comes next, 0 to 1. */
  prob: number
  /** Our hand-checked verdict on the completed sentence. */
  tag: TruthTag
  /** One short sentence explaining the verdict. */
  note: string
}

export interface HallucinationPrompt {
  id: string
  /** The sentence the model is asked to continue. */
  prompt: string
  /** What this prompt demonstrates, shown after the reader reveals the tags. */
  lesson: string
  candidates: Candidate[]
}

export const PROMPTS: HallucinationPrompt[] = [
  {
    id: 'france',
    prompt: 'The capital of France is',
    lesson:
      'The training data mentions Paris next to France so often that the pattern lines up with the truth. The model looks reliable here because the most likely word happens to be the right one.',
    candidates: [
      {
        word: 'Paris',
        prob: 0.96,
        tag: 'true',
        note: 'Paris is the capital of France.',
      },
      {
        word: 'Lyon',
        prob: 0.02,
        tag: 'false',
        note: 'Lyon is a large French city and it is not the capital.',
      },
      {
        word: 'Marseille',
        prob: 0.01,
        tag: 'false',
        note: 'Marseille is a large French city and it is not the capital.',
      },
      {
        word: 'located',
        prob: 0.01,
        tag: 'unverifiable',
        note: 'The sentence continues without naming a city, so there is nothing to check yet.',
      },
    ],
  },
  {
    id: 'australia',
    prompt: 'The capital of Australia is',
    lesson:
      'Sydney appears near "Australia" in the training data far more often than Canberra does, so the pattern points at the wrong city. The model states Sydney with the same confident tone it used for Paris.',
    candidates: [
      {
        word: 'Sydney',
        prob: 0.58,
        tag: 'false',
        note: 'Sydney is the most famous Australian city and it is not the capital.',
      },
      {
        word: 'Canberra',
        prob: 0.31,
        tag: 'true',
        note: 'Canberra is the capital of Australia.',
      },
      {
        word: 'Melbourne',
        prob: 0.09,
        tag: 'false',
        note: 'Melbourne is a large Australian city and it is not the capital.',
      },
      {
        word: 'home',
        prob: 0.02,
        tag: 'unverifiable',
        note: 'The sentence continues without naming a city, so there is nothing to check yet.',
      },
    ],
  },
  {
    id: 'study',
    prompt: 'A famous 2019 study by Dr. Chen showed that',
    lesson:
      'No such study exists, so every fluent continuation is invented. The model has seen thousands of sentences shaped like "a study showed that..." and it fills in the most plausible ending. Plausible wording is all it can offer here.',
    candidates: [
      {
        word: 'sleep',
        prob: 0.34,
        tag: 'unverifiable',
        note: 'There is no such study to check. The model is completing a familiar sentence shape.',
      },
      {
        word: 'coffee',
        prob: 0.27,
        tag: 'unverifiable',
        note: 'There is no such study to check. The model is completing a familiar sentence shape.',
      },
      {
        word: 'exercise',
        prob: 0.22,
        tag: 'unverifiable',
        note: 'There is no such study to check. The model is completing a familiar sentence shape.',
      },
      {
        word: 'screen',
        prob: 0.17,
        tag: 'unverifiable',
        note: 'There is no such study to check. The model is completing a familiar sentence shape.',
      },
    ],
  },
]

/** The candidates for a prompt, most likely first. */
export function candidatesFor(promptId: string): Candidate[] {
  const entry = PROMPTS.find((p) => p.id === promptId)
  if (!entry) return []
  return [...entry.candidates].sort((a, b) => b.prob - a.prob)
}
