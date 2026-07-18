import { render, screen } from '@testing-library/react'
import { ProsCons } from './ProsCons'
import { models } from '../../data'

describe('ProsCons component', () => {
  test('renders heading', () => {
    const prosVsCompetitors = { 'Model A': 'Advantage over A' }
    render(<ProsCons prosVsCompetitors={prosVsCompetitors} />)
    expect(screen.getByText(/How It Compares/)).toBeInTheDocument()
  })

  test('displays competitor names', () => {
    const prosVsCompetitors = {
      'GPT-5': 'Faster processing',
      'Gemini': 'Better reasoning',
    }
    render(<ProsCons prosVsCompetitors={prosVsCompetitors} />)
    expect(screen.getByText(/vs GPT-5/)).toBeInTheDocument()
    expect(screen.getByText(/vs Gemini/)).toBeInTheDocument()
  })

  test('displays advantages for each competitor', () => {
    const prosVsCompetitors = {
      'Model A': 'More capable at reasoning',
      'Model B': 'Cheaper pricing',
    }
    render(<ProsCons prosVsCompetitors={prosVsCompetitors} />)
    expect(screen.getByText(/More capable at reasoning/)).toBeInTheDocument()
    expect(screen.getByText(/Cheaper pricing/)).toBeInTheDocument()
  })

  test('renders empty when no competitors', () => {
    render(<ProsCons prosVsCompetitors={{}} />)
    expect(screen.getByText(/How It Compares/)).toBeInTheDocument()
  })

  test('renders cards for each competitor', () => {
    const prosVsCompetitors = {
      'Model A': 'Advantage A',
      'Model B': 'Advantage B',
      'Model C': 'Advantage C',
    }
    const { container } = render(<ProsCons prosVsCompetitors={prosVsCompetitors} />)
    // Check for sections containing competitor names and advantages
    Object.entries(prosVsCompetitors).forEach(([competitor, advantage]) => {
      expect(container.textContent).toContain(`vs ${competitor}`)
      expect(container.textContent).toContain(advantage)
    })
  })

  test('renders pros from actual models', () => {
    const modelWithPros = models.find((m) => m.prosVsCompetitors && Object.keys(m.prosVsCompetitors).length > 0)
    if (modelWithPros && modelWithPros.prosVsCompetitors) {
      render(<ProsCons prosVsCompetitors={modelWithPros.prosVsCompetitors} />)
      Object.entries(modelWithPros.prosVsCompetitors).forEach(([competitor, advantage]) => {
        expect(screen.getByText(new RegExp(`vs ${competitor}`))).toBeInTheDocument()
        expect(screen.getByText(advantage)).toBeInTheDocument()
      })
    }
  })

  test('handles special characters in competitor names', () => {
    const prosVsCompetitors = {
      'GPT-5.6 Sol': 'Stronger at coding',
      'Claude Opus 4.8': 'Better reasoning',
    }
    render(<ProsCons prosVsCompetitors={prosVsCompetitors} />)
    expect(screen.getByText(/vs GPT-5\.6 Sol/)).toBeInTheDocument()
    expect(screen.getByText(/vs Claude Opus 4\.8/)).toBeInTheDocument()
  })
})
