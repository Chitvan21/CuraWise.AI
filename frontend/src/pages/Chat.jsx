import { useState, useRef, useEffect } from 'react'
import { streamChat } from '../services/api'

const MODELS = [
  { id: 'llama-3.3-70b-versatile', label: 'LLaMA 3.3 70B' },
  { id: 'llama-3.1-8b-instant', label: 'LLaMA 3.1 8B' },
  { id: 'meta-llama/llama-4-scout-17b-16e-instruct', label: 'LLaMA 4 Scout 17B' },
]

export default function Chat() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [selectedModel, setSelectedModel] = useState('llama-3.3-70b-versatile')
  const bottomRef = useRef(null)
  const textareaRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || isStreaming) return

    const userMsg = { role: 'user', content: input.trim() }
    const currentMessages = [...messages, userMsg]

    setMessages([...currentMessages, { role: 'assistant', content: '' }])
    setInput('')
    setIsStreaming(true)

    let accumulated = ''

    await streamChat(
      currentMessages.slice(-6),
      selectedModel,
      1024,
      (chunk) => {
        accumulated += chunk
        setMessages(prev => {
          const updated = [...prev]
          updated[updated.length - 1] = { role: 'assistant', content: accumulated }
          return updated
        })
      },
      () => setIsStreaming(false),
    )
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`
  }, [input])

  const isTyping = isStreaming && messages.length > 0 && messages[messages.length - 1].content === ''

  return (
    <div className="h-screen flex flex-col bg-[#030712]">
      {/* Top bar */}
      <div className="h-12 border-b border-gray-800/50 flex items-center justify-between px-4 bg-[#030712] shrink-0">
        <span className="text-sm font-medium text-white">CuraWise AI</span>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMessages([])}
            className="text-gray-600 hover:text-gray-400 text-xs transition-colors"
          >
            Clear
          </button>
          <select
            value={selectedModel}
            onChange={e => setSelectedModel(e.target.value)}
            className="bg-[#0d1117] border border-gray-800 text-gray-400 text-xs rounded-md px-2 py-1"
          >
            {MODELS.map(m => (
              <option key={m.id} value={m.id}>{m.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 flex flex-col gap-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <p className="text-sm text-gray-500">Ask me anything about your health</p>
            <p className="text-xs text-gray-700 mt-1">Always consult a qualified doctor for medical decisions.</p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
            {msg.role === 'assistant' && (
              <span className="text-[10px] text-gray-600 mb-1 font-medium tracking-wider">CURAWISE AI</span>
            )}
            <div
              className={
                msg.role === 'user'
                  ? 'self-end bg-indigo-600 text-white text-sm px-4 py-2.5 rounded-2xl rounded-br-sm max-w-[60%]'
                  : 'self-start bg-[#0d1117] border border-gray-800 text-gray-200 text-sm px-4 py-2.5 rounded-2xl rounded-bl-sm max-w-[70%]'
              }
            >
              <div className="whitespace-pre-wrap break-words">{msg.content}</div>
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex flex-col items-start">
            <span className="text-[10px] text-gray-600 mb-1 font-medium tracking-wider">CURAWISE AI</span>
            <div className="bg-[#0d1117] border border-gray-800 rounded-2xl rounded-bl-sm px-4 py-3">
              <span className="inline-flex gap-1">
                <span className="w-1.5 h-1.5 bg-gray-600 rounded-full animate-bounce [animation-delay:0ms]" />
                <span className="w-1.5 h-1.5 bg-gray-600 rounded-full animate-bounce [animation-delay:150ms]" />
                <span className="w-1.5 h-1.5 bg-gray-600 rounded-full animate-bounce [animation-delay:300ms]" />
              </span>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div className="border-t border-gray-800/50 p-4 bg-[#030712] shrink-0">
        <div className="max-w-3xl mx-auto flex gap-2 items-end">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about symptoms, medications, health tips..."
            rows={1}
            className="flex-1 bg-[#0d1117] border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 resize-none focus:outline-none focus:border-gray-700 transition-colors overflow-hidden"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isStreaming}
            className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm px-4 py-2.5 rounded-xl font-medium transition-colors shrink-0"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  )
}
