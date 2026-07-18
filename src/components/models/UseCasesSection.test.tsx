import { render, screen } from '@testing-library/react'
import { UseCasesSection } from './UseCasesSection'
import { models } from '../../data'

describe('UseCasesSection component', () => {
  test('renders use cases heading', () => {
    const useCases = ['coding', 'writing']
    render(<UseCasesSection useCases={useCases} />)
    expect(screen.getByText(/Best For/)).toBeInTheDocument()
  })

  test('displays each use case', () => {
    const useCases = ['coding', 'writing', 'research']
    render(<UseCasesSection useCases={useCases} />)
    expect(screen.getByText(/coding/i)).toBeInTheDocument()
    expect(screen.getByText(/writing/i)).toBeInTheDocument()
    expect(screen.getByText(/research/i)).toBeInTheDocument()
  })

  test('renders icons for known use cases', () => {
    const useCases = ['coding', 'writing', 'research']
    const { container } = render(<UseCasesSection useCases={useCases} />)
    // Check for emoji icons
    expect(container.textContent).toContain('💻') // coding
    expect(container.textContent).toContain('✍️') // writing
    expect(container.textContent).toContain('🔬') // research
  })

  test('handles empty use cases array', () => {
    render(<UseCasesSection useCases={[]} />)
    expect(screen.getByText(/Best For/)).toBeInTheDocument()
  })

  test('displays use cases as capitalized text', () => {
    const useCases = ['coding']
    const { container } = render(<UseCasesSection useCases={useCases} />)
    // Component uses className "capitalize" from Tailwind which handles capitalization
    expect(container.textContent).toContain('coding')
  })

  test('uses generic icon for unknown use cases', () => {
    const useCases = ['unknown-case']
    render(<UseCasesSection useCases={useCases} />)
    expect(screen.getByText(/unknown-case/i)).toBeInTheDocument()
    // Should show checkmark for unknown cases
    expect(screen.getByText(/✓/)).toBeInTheDocument()
  })

  test('renders use cases from actual models', () => {
    const modelWithUseCases = models.find((m) => m.useCases && m.useCases.length > 0)
    if (modelWithUseCases && modelWithUseCases.useCases) {
      render(<UseCasesSection useCases={modelWithUseCases.useCases} />)
      expect(screen.getByText(/Best For/)).toBeInTheDocument()
      modelWithUseCases.useCases.forEach((useCase) => {
        expect(screen.getByText(new RegExp(useCase, 'i'))).toBeInTheDocument()
      })
    }
  })
})
