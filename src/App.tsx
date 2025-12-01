import './App.css'
import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'

interface Message {
  id: number
  text: string
}

function App() {
  const [messages, setMessages] = useState<Message[]>([])
  const [newText, setNewText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'

  const loadMessages = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch(`${apiBase}/api/messages`)
      if (!res.ok) {
        throw new Error(`Failed to load messages: ${res.status}`)
      }
      const data = (await res.json()) as Message[]
      setMessages(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadMessages()
  }, [])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!newText.trim()) return

    try {
      setError(null)
      const res = await fetch(`${apiBase}/api/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: newText.trim() }),
      })

      if (!res.ok) {
        throw new Error(`Failed to create message: ${res.status}`)
      }

      const created = (await res.json()) as Message
      setMessages((prev) => [...prev, created])
      setNewText('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    }
  }

  return (
    <div className="app">
      <h1>Message Board</h1>
      <form onSubmit={handleSubmit} className="message-form">
        <input
          type="text"
          placeholder="Írj egy üzenetet..."
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
        />
        <button type="submit">Küldés</button>
      </form>
      {loading && <p>Betöltés...</p>}
      {error && <p className="error">Hiba: {error}</p>}
      <ul className="message-list">
        {messages.map((m) => (
          <li key={m.id}>{m.text}</li>
        ))}
      </ul>
    </div>
  )
}

export default App
