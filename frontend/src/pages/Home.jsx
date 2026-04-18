import { Link } from 'react-router-dom'

const features = [
  { title: 'Disease Prediction', desc: 'ML algorithms analyze your symptoms with high accuracy.' },
  { title: 'AI Chatbot',         desc: 'Chat with our Groq-powered medical assistant instantly.' },
  { title: 'PDF Reports',        desc: 'Generate and download detailed health reports.' },
  { title: 'Multilingual',       desc: 'Communicate in your preferred language seamlessly.' },
]

export default function Home() {
  return (
    <div className="min-h-screen bg-[#020d0e] text-white relative overflow-hidden">

      {/* Ambient background orbs */}
      <div className="absolute inset-0 pointer-events-none select-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full animate-glow-pulse"
          style={{ background: 'radial-gradient(circle, rgba(20,184,166,0.13) 0%, rgba(20,184,166,0.04) 45%, transparent 70%)' }} />
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full animate-float"
          style={{ background: 'radial-gradient(circle, rgba(20,184,166,0.07) 0%, transparent 65%)', animationDelay: '0s' }} />
        <div className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full animate-float"
          style={{ background: 'radial-gradient(circle, rgba(6,182,212,0.06) 0%, transparent 65%)', animationDelay: '3s' }} />
        <div className="absolute inset-0 opacity-[0.025]"
          style={{ backgroundImage: 'linear-gradient(rgba(20,184,166,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(20,184,166,0.5) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
      </div>

      {/* Hero */}
      <div className="relative flex flex-col items-center justify-center text-center px-6 py-36">
        <p className="text-teal-400 text-xs font-medium tracking-widest uppercase mb-5 animate-fade-up" style={{ animationDelay: '0.05s' }}>
          AI-POWERED HEALTH COMPANION
        </p>
        <h1 className="text-5xl sm:text-6xl font-bold tracking-tight leading-[1.1] max-w-3xl animate-fade-up" style={{ animationDelay: '0.15s' }}>
          Understand your{' '}
          <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(135deg, #2dd4bf 0%, #14b8a6 50%, #0891b2 100%)' }}>
            symptoms,
          </span>
          <br />not just treat them.
        </h1>
        <p className="text-gray-400 text-lg mt-5 max-w-lg mx-auto leading-relaxed animate-fade-up" style={{ animationDelay: '0.25s' }}>
          Describe what you're feeling. CuraWise uses ML and LLMs to predict conditions and guide your next steps.
        </p>
        <div className="flex gap-3 mt-10 animate-fade-up" style={{ animationDelay: '0.35s' }}>
          <Link to="/predict" className="bg-teal-600 hover:bg-teal-500 px-7 py-2.5 rounded-lg text-sm font-medium text-white btn-glow">
            Check Symptoms
          </Link>
          <Link to="/chat" className="glass glow-teal-hover px-7 py-2.5 rounded-lg text-sm text-gray-300 hover:text-white transition-colors">
            Chat with AI
          </Link>
        </div>
      </div>

      {/* Feature cards */}
      <div className="relative max-w-5xl mx-auto px-6 pb-28 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {features.map(({ title, desc }, i) => (
          <div key={title} className="glass glow-teal-hover rounded-xl p-5 animate-fade-up" style={{ animationDelay: `${0.4 + i * 0.08}s` }}>
            <div className="w-2 h-2 rounded-full bg-teal-500 mb-4" style={{ boxShadow: '0 0 8px rgba(20,184,166,0.9), 0 0 16px rgba(20,184,166,0.4)' }} />
            <h3 className="text-white text-sm font-medium mb-1.5">{title}</h3>
            <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
