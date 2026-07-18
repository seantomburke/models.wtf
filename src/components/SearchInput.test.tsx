import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SearchInput } from './SearchInput'

describe('SearchInput', () => {
  it('renders search input with default placeholder', () => {
    const onSearch = vi.fn()
    render(<SearchInput onSearch={onSearch} />)

    const input = screen.getByPlaceholderText(/search models/i)
    expect(input).toBeInTheDocument()
  })

  it('renders search input with custom placeholder', () => {
    const onSearch = vi.fn()
    render(<SearchInput onSearch={onSearch} placeholder="Find a model..." />)

    const input = screen.getByPlaceholderText(/find a model/i)
    expect(input).toBeInTheDocument()
  })

  it('calls onSearch when user types', async () => {
    const onSearch = vi.fn()
    render(<SearchInput onSearch={onSearch} />)

    const input = screen.getByPlaceholderText(/search models/i)
    await userEvent.type(input, 'claude')

    expect(onSearch).toHaveBeenCalledWith('c')
    expect(onSearch).toHaveBeenCalledWith('cl')
    expect(onSearch).toHaveBeenCalledWith('cla')
    expect(onSearch).toHaveBeenCalledWith('clau')
    expect(onSearch).toHaveBeenCalledWith('claud')
    expect(onSearch).toHaveBeenCalledWith('claude')
  })

  it('shows clear button when input has text', async () => {
    const onSearch = vi.fn()
    render(<SearchInput onSearch={onSearch} />)

    const input = screen.getByPlaceholderText(/search models/i)
    expect(screen.queryByRole('button', { name: /clear/i })).not.toBeInTheDocument()

    await userEvent.type(input, 'claude')
    expect(screen.getByRole('button', { name: /clear/i })).toBeInTheDocument()
  })

  it('clears input and calls onSearch with empty string', async () => {
    const onSearch = vi.fn()
    render(<SearchInput onSearch={onSearch} />)

    const input = screen.getByPlaceholderText(/search models/i) as HTMLInputElement
    await userEvent.type(input, 'claude')

    const clearButton = screen.getByRole('button', { name: /clear/i })
    await userEvent.click(clearButton)

    expect(onSearch).toHaveBeenLastCalledWith('')
    expect(input.value).toBe('')
  })

  it('applies custom className', () => {
    const onSearch = vi.fn()
    const { container } = render(<SearchInput onSearch={onSearch} className="custom-class" />)

    const wrapper = container.querySelector('.custom-class')
    expect(wrapper).toBeInTheDocument()
  })

  it('has proper ARIA labels', () => {
    const onSearch = vi.fn()
    render(<SearchInput onSearch={onSearch} />)

    const input = screen.getByLabelText('Search models')
    expect(input).toBeInTheDocument()
  })

  it('handles rapid typing correctly', async () => {
    const onSearch = vi.fn()
    render(<SearchInput onSearch={onSearch} />)

    const input = screen.getByPlaceholderText(/search models/i) as HTMLInputElement
    await userEvent.type(input, 'test', { delay: 1 })

    expect(input.value).toBe('test')
    expect(onSearch).toHaveBeenLastCalledWith('test')
  })
})
