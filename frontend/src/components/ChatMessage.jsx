export default function ChatMessage({ message }) {
  const isUser = message.role === 'user'
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-[75%] ${isUser ? '' : 'flex flex-col gap-1'}`}>
        {!isUser && (
          <span className="text-xs text-gray-500 ml-1">🤖 CuraWise AI</span>
        )}
        <div
          className={`px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
            isUser
              ? 'bg-indigo-600 text-white rounded-tr-none'
              : 'bg-gray-800 text-gray-200 rounded-tl-none'
          }`}
        >
          {message.content}
        </div>
      </div>
    </div>
  )
}
