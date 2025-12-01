import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import App from '../../src/App'

describe('App component', () => {
  const originalFetch = global.fetch

  beforeEach(() => {
    // Mock fetch to handle GET and POST to /api/messages
    global.fetch = vi.fn((input, init) => {
      const method = init?.method ?? 'GET'
      if (method === 'POST') {
        const body = init?.body ? JSON.parse(String(init.body)) : { text: 'ok' }
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ id: '1', text: body.text }) })
      }
      // GET
      return Promise.resolve({ ok: true, json: () => Promise.resolve([]) })
    }) as unknown as typeof global.fetch
  })

  afterEach(() => {
    global.fetch = originalFetch
    vi.resetAllMocks()
  })

  it('renders heading and allows submitting a new message', async () => {
    render(<App />)

    expect(screen.getByRole('heading', { name: /message board/i })).toBeInTheDocument()

    const input = screen.getByPlaceholderText('Írj egy üzenetet...')
    const submit = screen.getByRole('button', { name: /küldés/i })

    await userEvent.type(input, 'hello')
    await userEvent.click(submit)

    // Wait for the new message to appear in the list
    await waitFor(() => {
      expect(screen.getByText('hello')).toBeInTheDocument()
    })
  })
})
