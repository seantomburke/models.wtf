/**
 * Editorial 1-5 ratings behind the ModelFaceOff duels on the Learn versus
 * topics. The scores mirror the claims in topicProse.ts for the same topics;
 * if the prose shifts after a big release, these numbers shift with it.
 * Accent colors come from src/data/providers.ts brand colors, with a dark
 * override where the brand color would vanish on a dark surface.
 */

export interface FaceOffContender {
  /** Short model name shown above the bars, e.g. "Claude". */
  name: string
  /** The company behind the model, shown under the name. */
  maker: string
  /** Brand accent for this contender's bars (light surface). */
  accent: string
  /** Optional accent for dark surfaces when the brand color is too dark. */
  darkAccent?: string
}

export interface FaceOffDimension {
  /** What is being rated, e.g. "Reasoning depth". */
  label: string
  /** Editorial 1-5 rating for the left contender. */
  left: number
  /** Editorial 1-5 rating for the right contender. */
  right: number
}

export interface FaceOffConfig {
  /** Left-side contender (bars grow leftward from the center axis). */
  left: FaceOffContender
  /** Right-side contender (bars grow rightward from the center axis). */
  right: FaceOffContender
  dimensions: FaceOffDimension[]
}

const claude: FaceOffContender = {
  name: 'Claude',
  maker: 'Anthropic',
  accent: '#D97757',
}

const gpt: FaceOffContender = {
  name: 'GPT',
  maker: 'OpenAI',
  accent: '#10A37F',
}

const gemini: FaceOffContender = {
  name: 'Gemini',
  maker: 'Google',
  accent: '#4285F4',
}

const grok: FaceOffContender = {
  name: 'Grok',
  maker: 'xAI',
  accent: '#1D1D1F',
  darkAccent: '#E2E8F0',
}

/** Claude vs GPT: Claude leads on careful reasoning and writing, GPT on speed and multimodal range. */
export const claudeVsGpt: FaceOffConfig = {
  left: claude,
  right: gpt,
  dimensions: [
    { label: 'Reasoning depth', left: 5, right: 4 },
    { label: 'Speed', left: 3, right: 5 },
    { label: 'Writing and analysis', left: 5, right: 4 },
    { label: 'Multimodal range', left: 3, right: 5 },
    { label: 'Price for the tier', left: 4, right: 4 },
  ],
}

/** Claude vs Gemini: Claude leads on context and reasoning, Gemini on search and the Google ecosystem. */
export const claudeVsGemini: FaceOffConfig = {
  left: claude,
  right: gemini,
  dimensions: [
    { label: 'Reasoning depth', left: 5, right: 4 },
    { label: 'Context length', left: 5, right: 4 },
    { label: 'Search and fresh data', left: 2, right: 5 },
    { label: 'Ecosystem integration', left: 2, right: 5 },
    { label: 'Coding', left: 5, right: 4 },
  ],
}

/** Grok vs GPT: Grok leads on speed, price, and real-time news, GPT on reasoning and integrations. */
export const grokVsGpt: FaceOffConfig = {
  left: grok,
  right: gpt,
  dimensions: [
    { label: 'Speed', left: 5, right: 3 },
    { label: 'Real-time news', left: 5, right: 3 },
    { label: 'Price', left: 5, right: 3 },
    { label: 'Complex reasoning', left: 3, right: 5 },
    { label: 'Integrations', left: 2, right: 5 },
  ],
}
