/**
 * Hardcoded "which approach fits" scenarios for the fine-tuning-models topic.
 *
 * The lesson the prose teaches is an ordering: reach for a good prompt first,
 * add retrieval (RAG) when the model needs facts it never saw, and fine-tune
 * only once the task is narrow and you run it at real volume. Each scenario
 * below is a task a reader might recognise, tagged with the approach a
 * practitioner would actually pick and a one-line reason. Picking through them
 * makes the ordering concrete instead of abstract.
 */

export type Approach = 'prompt' | 'rag' | 'fine-tune'

export interface FineTuningScenario {
  id: string
  /** The button label and heading for this task. */
  name: string
  /** One line describing what the reader is trying to build. */
  task: string
  approach: Approach
  /** Why this approach fits the task. */
  reason: string
}

export const SCENARIOS: FineTuningScenario[] = [
  {
    id: 'friendly-tone',
    name: 'A slightly friendlier chatbot',
    task: 'You want your support bot to sound warm and on-brand.',
    approach: 'prompt',
    reason:
      'A few lines of instruction and one example reply set the tone. Nothing about the model needs to change, so start here.',
  },
  {
    id: 'company-docs',
    name: 'Answers from your own docs',
    task: 'You want answers grounded in your latest internal handbook.',
    approach: 'rag',
    reason:
      'The model never read your handbook and it keeps changing. Retrieval hands it the right page at question time, no training run needed.',
  },
  {
    id: 'legal-clauses',
    name: 'Millions of legal clauses',
    task: 'You classify contract clauses in one narrow format, all day, every day.',
    approach: 'fine-tune',
    reason:
      'The task is narrow, the volume is huge, and you want the same shape of answer every time. Fine-tuning bakes that in and lowers the per-call cost.',
  },
  {
    id: 'brand-voice-scale',
    name: 'Your house style at scale',
    task: 'You generate thousands of product blurbs a day in one exact voice.',
    approach: 'fine-tune',
    reason:
      'Prompting gets you close, but at this volume the savings and the consistency of a fine-tuned model pay for the upfront work.',
  },
]

export const APPROACH_LABEL: Record<Approach, string> = {
  prompt: 'prompt it',
  rag: 'add retrieval',
  'fine-tune': 'fine-tune',
}

/** One line explaining what each approach costs you, shown under the pick. */
export const APPROACH_COST: Record<Approach, string> = {
  prompt: 'Cheapest and fastest to try. You change your words and leave the model alone.',
  rag: 'Middle ground. You build a search step, but the model stays untouched.',
  'fine-tune': 'Most upfront work and cost. It only pays off at real volume.',
}
