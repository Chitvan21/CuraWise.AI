import axios from 'axios'

const BASE = 'http://localhost:8000'

export const predictDisease = (symptoms) =>
  axios.post(`${BASE}/api/predict`, { symptoms })

export const generateReport = (data) =>
  axios.post(`${BASE}/api/report`, data, { responseType: 'blob' })

export const streamChat = async (messages, model, max_tokens, onChunk, onDone) => {
  const response = await fetch(`${BASE}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, model, max_tokens }),
  })
  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    const text = decoder.decode(value)
    const lines = text.split('\n')
    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const chunk = line.slice(6)
        if (chunk === '[DONE]') { onDone(); return }
        if (chunk) onChunk(chunk)
      }
    }
  }
  onDone()
}
