import { useEffect, useRef, useState } from 'react'
import { ATTENTION, END, adjustedChoices, generateSteps, positionSignal } from './positionAttentionModel'
import type { GenerationStep, Slot } from './positionAttentionModel'

const slotNames: Record<Slot, string> = { subject: 'subject', verb: 'verb', object: 'object', end: 'period' }

const displayWord = (word: string) => (word === END ? '.' : word)

const slotInput = (previous: string) => (previous === '<start>' ? 'the start of the sentence' : `“${previous}”`)

// The role each generation step fills, in order: subject, verb, object, period.
// The model reuses the subject slot for the first two steps, so this maps a step
// index to the role a reader actually sees produced.
const PRODUCED_ROLES = ['subject', 'verb', 'object', 'period'] as const
const producedRole = (index: number) => PRODUCED_ROLES[Math.min(index, PRODUCED_ROLES.length - 1)]

function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

function Bars({ previous, slot, temperature }: { previous: string; slot: Slot; temperature: number }) {
  const choices = adjustedChoices(previous, slot, temperature)
  return <div className="space-y-2" aria-label={`${slotNames[slot]} predictions`}>
    {choices.map((choice) => <div key={choice.word} className="flex items-center gap-3 text-sm">
      <span className="w-16 font-medium">{choice.word === END ? '.' : choice.word}</span>
      <span className="h-3 grow overflow-hidden rounded-full bg-accent-soft"><span className="block h-full rounded-full bg-accent-deep/70" style={{ width: `${choice.prob * 100}%` }} /></span>
      <span className="w-10 text-right text-xs text-fg-secondary">{Math.round(choice.prob * 100)}%</span>
    </div>)}
  </div>
}

type SubjectWord = 'Bob' | 'Alice' | 'Charlie'
const SUBJECTS: SubjectWord[] = ['Bob', 'Alice', 'Charlie']
const SUBJECT_SEED: Record<SubjectWord, string[]> = {
  Bob: ['Bob', 'ignores', 'Alice'],
  Alice: ['Alice', 'greets', 'Bob'],
  Charlie: ['Charlie', 'sees', 'Bob'],
}

const STEP_MS = 650

export function PositionAttentionLab() {
  const [subject, setSubject] = useState<SubjectWord>('Bob')
  const [mode, setMode] = useState<'greedy' | 'sample'>('greedy')
  const [temperature, setTemperature] = useState(0.8)
  const [sentence, setSentence] = useState<string[]>(SUBJECT_SEED.Bob)
  // While generating, `steps` holds the full plan and `revealed` counts how many
  // words have appeared so far. The step being revealed shows the input it read.
  const [steps, setSteps] = useState<GenerationStep[] | null>(null)
  const [revealed, setRevealed] = useState(0)
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])

  const clearTimers = () => {
    timers.current.forEach(clearTimeout)
    timers.current = []
  }
  useEffect(() => clearTimers, [])

  const updateSubject = (value: SubjectWord) => {
    clearTimers()
    setSteps(null)
    setRevealed(0)
    setSubject(value)
    setSentence(SUBJECT_SEED[value])
  }

  const generate = () => {
    clearTimers()
    const plan = generateSteps(temperature, mode === 'sample')
    const words = plan.filter((step) => step.word !== END).map((step) => step.word)
    setSteps(plan)
    if (prefersReducedMotion()) {
      // Reveal the whole sentence at once; the walkthrough still lists every step.
      setRevealed(plan.length)
      setSentence(words)
      return
    }
    setRevealed(0)
    setSentence([])
    plan.forEach((_step, index) => {
      timers.current.push(
        setTimeout(() => {
          setRevealed(index + 1)
          setSentence(plan.slice(0, index + 1).filter((entry) => entry.word !== END).map((entry) => entry.word))
        }, STEP_MS * (index + 1)),
      )
    })
  }

  const activeIndex = steps && revealed > 0 ? Math.min(revealed, steps.length) - 1 : -1
  const activeStep = activeIndex >= 0 && steps ? steps[activeIndex] : null
  const generating = steps !== null && revealed < steps.length

  return <div className="space-y-6">
    <section className="rounded-lg border border-line bg-surface p-4" aria-labelledby="position-heading">
      <h3 id="position-heading" className="text-sm font-semibold text-fg">One word, two positions</h3>
      <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Choose a subject">
        {SUBJECTS.map((word) => <button key={word} type="button" onClick={() => updateSubject(word)} aria-pressed={subject === word} className="rounded-lg border border-line px-3 py-1.5 text-sm font-medium hover:border-line-strong">{word} as subject</button>)}
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 text-sm">
        <div className="rounded border border-line p-3"><strong>{subject} at subject</strong><p className="mt-1 text-fg-secondary">Position signal {positionSignal('subject')}. The friendly meaning points to the matching verb.</p><Bars previous={subject} slot="subject" temperature={1} /></div>
        <div className="rounded border border-line p-3"><strong>{subject} at object</strong><p className="mt-1 text-fg-secondary">Position signal {positionSignal('object')}. The next token is the period.</p><Bars previous={subject} slot="object" temperature={1} /></div>
      </div>
    </section>
    <section className="rounded-lg border border-line bg-surface p-4" aria-labelledby="attention-heading">
      <h3 id="attention-heading" className="text-sm font-semibold text-fg">A small attention head looks back</h3>
      <p className="mt-2 text-sm text-fg-secondary">For the object slot in “Bob ignores”, the query gives more weight to Bob. That carries the subject role forward before the model picks an object.</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {ATTENTION.map((item) => <div key={item.token} className="rounded border border-line p-3 text-sm"><div className="flex justify-between"><strong>{item.token}</strong><span>{Math.round(item.weight * 100)}% attention</span></div><div className="mt-2 h-3 overflow-hidden rounded-full bg-accent-soft"><div className="h-full rounded-full bg-accent-deep/70" style={{ width: `${item.weight * 100}%` }} /></div><p className="mt-2 text-fg-secondary">key {item.key}, value {item.value}</p></div>)}
      </div>
    </section>
    <section className="rounded-lg border border-line bg-surface p-4" aria-labelledby="generator-heading">
      <h3 id="generator-heading" className="text-sm font-semibold text-fg">Generate a sentence</h3>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button type="button" onClick={() => setMode('greedy')} aria-pressed={mode === 'greedy'} className="rounded-lg border border-line px-3 py-1.5 text-sm font-medium">Greedy</button>
        <button type="button" onClick={() => setMode('sample')} aria-pressed={mode === 'sample'} className="rounded-lg border border-line px-3 py-1.5 text-sm font-medium">Sample</button>
        <label className="flex items-center gap-2 text-sm">Temperature <input type="range" min="0.3" max="1.5" step="0.1" value={temperature} onChange={(event) => setTemperature(Number(event.target.value))} /><span>{temperature.toFixed(1)}</span></label>
        <button type="button" onClick={generate} aria-label="Generate" className="rounded-lg bg-accent px-3 py-1.5 text-sm font-medium text-white">{generating ? 'Generating…' : 'Generate'}</button>
      </div>
      <p className="mt-4 text-lg font-medium" data-testid="generated-sentence" aria-live="polite">
        {sentence.map((word, index) => <span key={index} className={index === sentence.length - 1 && generating ? 'text-accent-deep' : undefined}>{index > 0 ? ' ' : ''}{word}</span>)}
        {!generating && sentence.length > 0 && <span>.</span>}
        {generating && <span className="text-fg-secondary" aria-hidden="true"> ▍</span>}
      </p>
      {activeStep && <p className="mt-2 text-sm text-fg-secondary" data-testid="generation-step">
        {activeStep.word === END
          ? <>Reading {slotInput(activeStep.previous)}, the model ends the sentence with a period.</>
          : <>Reading {slotInput(activeStep.previous)}, the model picks “{displayWord(activeStep.word)}” for the {producedRole(activeIndex)}.</>}
      </p>}
      {activeStep && activeStep.word !== END && <div className="mt-3"><Bars previous={activeStep.previous} slot={activeStep.slot} temperature={mode === 'sample' ? temperature : 1} /></div>}
      <p className="mt-3 text-sm text-fg-secondary">Each word feeds back in as the input for the next one. Greedy chooses the top bar. Sample draws from the bars, and temperature spreads or concentrates those chances.</p>
    </section>
  </div>
}
