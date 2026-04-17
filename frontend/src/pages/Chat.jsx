import { useState, useRef, useEffect } from 'react'
import ChatMessage from '../components/ChatMessage'
import { streamChat } from '../services/api'

const MODELS = [
  { id: 'llama3-70b-8192', label: 'LLaMA3 70B' },
  { id: 'llama3-8b-8192', label: 'LLaMA3 8B' },
  { id: 'mixtral-8x7b-32768', label: 'Mixtral 8x7B' },
]

export default function Chat() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [model, setModel] = useState('llama3-70b-8192')
  const [streaming, setStreaming] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async () => {
    const text = input.trim()
    if (!text || streaming) return
    setInput('')

    const userMessage = { role: 'user', content: text }
    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    setStreaming(true)

    const assistantMessage = { role: 'assistant', content: '' }
    setMessages([...updatedMessages, assistantMessage])

    const apiMessages = updatedMessages.map(({ role, content }) => ({ role, content }))

    await streamChat(
      apiMessages,
      model,
      1024,
      (chunk) => {
        setMessages((prev) => {
          const updated = [...prev]
          updated[updated.length - 1] = {
            ...updated[updated.length - 1],
            content: updated[updated.length - 1].content + chunk,
          }
          return updated
        })
      },
      () => setStreaming(false),
    )
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-57px)] bg-gray-950 text-white">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-3 bg-gray-900 border-b border-gray-800">
        <div>
          <h1 className="font-bold text-lg">AI Health Assistant 🤖</h1>
          <p className="text-xs text-gray-500">Powered by Groq</p>
        </div>
        <select
          value={model}
          onChange={(e) => setModel(e.target.value)}
          className="bg-gray-800 border border-gray-700 text-sm text-white rounded-lg px-3 py-1.5 focus:outline-none focus:border-indigo-500"
        >
          {MODELS.map((m) => (
            <option key={m.id} value={m.id}>{m.label}</option>
          ))}
        </select>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center text-gray-600">
            <div className="text-5xl mb-4">🤖</div>
            <p className="text-lg font-medium text-gray-500">Ask me anything about your health</p>
            <p className="text-sm mt-1">Always consult a qualified doctor for medical decisions.</p>
          </div>
        )}
        {messages.map((msg, i) => (
          <ChatMessage key={i} message={msg} />
        ))}
        {streaming && messages[messages.length - 1]?.content === '' && (
          <div className="flex justify-start mb-4">
            <div className="bg-gray-800 rounded-2xl rounded-tl-none px-4 py-3">
              <span className="inline-flex gap-1">
                <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:0ms]" />
                <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:150ms]" />
                <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:300ms]" />
              </span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div className="px-4 py-4 bg-gray-900 border-t border-gray-800">
        <div className="max-w-3xl mx-auto flex gap-3">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about symptoms, medications, health tips..."
            rows={1}
            className="flex-1 bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:border-indigo-500 transition-colors"
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || streaming}
            className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  )
}
