import axios from 'axios'

const BASE = 'http://localhost:8000'

export const predictDisease = (symptoms) =>
  axios.post(`${BASE}/api/predict`, { symptoms })

export const generateReport = (data) =>
  axios.post(`${BASE}/api/report`, data, { responseType: 'blob' })

export const streamChat = async (messages, model, max_tokens, onChunk, onDone) => {
  try {
    const response = await fetch(`${BASE}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages, model, max_tokens })
    })

    if (!response.ok) throw new Error(response.statusText)

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')

      // Keep the last incomplete line in buffer
      buffer = lines.pop()

      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed.startsWith('data: ')) continue
        const data = trimmed.slice(6)
        if (data === '[DONE]') { onDone(); return }
        if (data) {
          try {
            onChunk(JSON.parse(data))
          } catch {
            onChunk(data)
          }
        }
      }
    }

    // Process any remaining buffer
    if (buffer.trim().startsWith('data: ')) {
      const data = buffer.trim().slice(6)
      if (data && data !== '[DONE]') {
        try {
          onChunk(JSON.parse(data))
        } catch {
          onChunk(data)
        }
      }
    }

    onDone()
  } catch (err) {
    console.error('Stream error:', err)
    onDone()
  }
}
