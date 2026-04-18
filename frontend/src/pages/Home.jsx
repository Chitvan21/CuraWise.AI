import { Link } from 'react-router-dom'

const features = [
  {
    title: 'Disease Prediction',
    desc: 'ML algorithms analyze your symptoms with high accuracy.',
  },
  {
    title: 'AI Chatbot',
    desc: 'Chat with our Groq-powered medical assistant instantly.',
  },
  {
    title: 'PDF Reports',
    desc: 'Generate and download detailed health reports.',
  },
  {
    title: 'Multilingual',
    desc: 'Communicate in your preferred language seamlessly.',
  },
]

export default function Home() {
  return (
    <div className="min-h-screen bg-[#030712] text-white">
      {/* Hero */}
      <div className="flex flex-col items-center justify-center text-center px-6 py-32">
        <p className="text-indigo-400 text-xs font-medium tracking-widest uppercase mb-4">
          AI-POWERED HEALTH COMPANION
        </p>
        <h1 className="text-5xl font-bold text-white tracking-tight leading-tight max-w-2xl">
          Understand your symptoms,<br />not just treat them.
        </h1>
        <p className="text-gray-400 text-lg mt-4 max-w-lg mx-auto leading-relaxed">
          Describe what you're feeling. CuraWise uses ML and LLMs to predict conditions and guide your next steps.
        </p>
        <div className="flex gap-3 mt-10">
          <Link
            to="/predict"
            className="bg-indigo-600 hover:bg-indigo-500 px-6 py-2.5 rounded-lg text-sm font-medium text-white transition-colors"
          >
            Check Symptoms
          </Link>
          <Link
            to="/chat"
            className="border border-gray-700 hover:border-gray-500 px-6 py-2.5 rounded-lg text-sm text-gray-300 transition-colors"
          >
            Chat with AI
          </Link>
        </div>
      </div>

      {/* Feature cards */}
      <div className="max-w-5xl mx-auto px-6 pb-24 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {features.map(({ title, desc }) => (
          <div
            key={title}
            className="bg-[#0d1117] border border-gray-800 rounded-xl p-5"
          >
            <div className="w-2 h-2 rounded-full bg-indigo-500 mb-4" />
            <h3 className="text-white text-sm font-medium mb-1.5">{title}</h3>
            <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
