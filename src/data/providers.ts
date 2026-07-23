import type { Provider } from './types.ts'

export const providers: Provider[] = [
  {
    id: 'anthropic',
    name: 'Anthropic',
    color: '#D97757',
    openSource: false,
    blurb:
      'The company behind Claude, known for models that reason carefully through hard problems and stay steady on long, autonomous work.',
  },
  {
    id: 'openai',
    name: 'OpenAI',
    color: '#10A37F',
    openSource: false,
    blurb:
      'The maker of ChatGPT and the GPT family, the models most people meet first, tuned to be fast, friendly, and good at almost everything.',
  },
  {
    id: 'google',
    name: 'Google',
    color: '#4285F4',
    openSource: false,
    blurb:
      'Builds the Gemini family, with huge context windows and deep ties to Search, Workspace, and the rest of the Google universe.',
  },
  {
    id: 'xai',
    name: 'xAI',
    color: '#1D1D1F',
    openSource: false,
    blurb:
      "Elon Musk's AI lab, maker of the Grok models: fast, plugged into real-time information from X, and priced to undercut the big labs.",
  },
  // Meta pivoted closed with Muse Spark (2026); its Llama 4 models stay open at the model level.
  {
    id: 'meta',
    name: 'Meta',
    color: '#0668E1',
    openSource: false,
    blurb:
      'Made open-weight models mainstream with Llama, and now splits its lineup: Llama stays open while its newest flagship goes closed.',
  },
  // Moonshot sells Kimi K3 via API today; open weights are promised for late July 2026.
  {
    id: 'moonshot',
    name: 'Moonshot AI',
    color: '#7C3AED',
    openSource: false,
    blurb:
      'The Beijing lab behind the Kimi models: agentic heavy-lifters that punch above their price, with open weights promised for its latest.',
  },
  {
    id: 'thinking-machines',
    name: 'Thinking Machines',
    color: '#0D9488',
    openSource: true,
    blurb:
      'A research lab founded by former OpenAI leaders, shipping open-weight models built around transparency and customization.',
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    color: '#4D6BFE',
    openSource: true,
    blurb:
      'The Chinese lab that shocked the field by matching frontier reasoning at a fraction of the cost, with weights anyone can download.',
  },
  {
    id: 'alibaba',
    name: 'Alibaba (Qwen)',
    color: '#FF6A00',
    openSource: true,
    blurb:
      "Alibaba's Qwen team ships one of the deepest open-weight lineups anywhere, from tiny on-device models to frontier-class flagships.",
  },
  {
    id: 'zhipu',
    name: 'Z.ai (GLM)',
    color: '#3B82F6',
    openSource: true,
    blurb:
      'The lab behind the GLM series: open-weight models with a coding and agent focus that keep closing the gap with the closed frontier.',
  },
]
