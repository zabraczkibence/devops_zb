import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect } from 'vitest'
import { Counter } from '../../src/components/Counter'

describe('Counter component', () => {
  it('renders with initial count and increments on click', async () => {
    render(<Counter />)
    const btn = screen.getByRole('button', { name: /count is 0/i })
    expect(btn).toBeInTheDocument()

    await userEvent.click(btn)
    expect(btn).toHaveTextContent('count is 1')
  })
})
