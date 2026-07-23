export type TokenCounter = (text: string) => number
export type TokenSplitter = (text: string) => string[]

/** ~4 characters per token; used during SSR and while the real tokenizer loads. */
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4)
}

type TokenizerModule = typeof import('gpt-tokenizer/encoding/o200k_base')

let modulePromise: Promise<TokenizerModule> | null = null

/**
 * Lazy-loads gpt-tokenizer's o200k_base encoding. The BPE ranks are around a
 * megabyte, so the dynamic import keeps them in their own chunk, and the
 * memoized promise means every caller shares one download. Load errors
 * propagate to the caller; pages log once and keep their fallback.
 */
function loadModule(): Promise<TokenizerModule> {
  modulePromise ??= import('gpt-tokenizer/encoding/o200k_base')
  return modulePromise
}

let counterPromise: Promise<TokenCounter> | null = null

export function loadTokenizer(): Promise<TokenCounter> {
  counterPromise ??= loadModule().then(
    (m) => (text: string) => m.countTokens(text),
  )
  return counterPromise
}

let splitterPromise: Promise<TokenSplitter> | null = null

/**
 * Resolves a splitter that returns the actual BPE token strings for a text,
 * e.g. 'Understanding tokenization' → ['Understanding', ' token', 'ization'].
 * Leading spaces are part of the token, exactly as the model sees them.
 */
export function loadTokenSplitter(): Promise<TokenSplitter> {
  splitterPromise ??= loadModule().then(
    (m) => (text: string) => [...m.decodeGenerator(m.encode(text))],
  )
  return splitterPromise
}
