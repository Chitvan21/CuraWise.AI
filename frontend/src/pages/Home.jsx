import { Link } from 'react-router-dom'

const features = [
  { icon: '🔍', title: 'Disease Prediction', desc: 'ML algorithms analyze your symptoms with high accuracy.' },
  { icon: '🤖', title: 'AI Chatbot', desc: 'Chat with our Groq-powered medical assistant instantly.' },
  { icon: '📑', title: 'PDF Reports', desc: 'Generate and download detailed health reports.' },
  { icon: '🌍', title: 'Multilingual', desc: 'Communicate in your preferred language seamlessly.' },
]

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Hero */}
      <div className="flex flex-col items-center justify-center text-center px-6 py-24">
        <h1 className="text-6xl font-extrabold mb-4 bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
          CuraWise.AI 🩺
        </h1>
        <p className="text-xl text-gray-400 mb-10 max-w-xl">
          Your Personalized AI Health Companion — powered by Machine Learning and Groq LLMs.
        </p>
        <div className="flex gap-4">
          <Link
            to="/predict"
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-colors"
          >
            Check Symptoms →
          </Link>
          <Link
            to="/chat"
            className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-xl transition-colors border border-gray-700"
          >
            Chat with AI →
          </Link>
        </div>
      </div>

      {/* Feature cards */}
      <div className="max-w-5xl mx-auto px-6 pb-24 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {features.map(({ icon, title, desc }) => (
          <div key={title} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-indigo-600 transition-colors">
            <div className="text-4xl mb-3">{icon}</div>
            <h3 className="text-lg font-semibold mb-2">{title}</h3>
            <p className="text-sm text-gray-400">{desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
