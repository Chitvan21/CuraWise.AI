import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function Login() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email || !password) return
    setError('')
    setLoading(true)

    const { error } = isLogin
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password })

    setLoading(false)

    if (error) {
      setError(error.message)
    } else {
      navigate('/predict')
    }
  }

  return (
    <div className="min-h-screen bg-[#030712] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        <div className="text-center mb-8">
          <Link to="/" className="text-white font-semibold text-sm tracking-tight">
            CuraWise.AI
          </Link>
          <p className="text-gray-600 text-xs mt-1">AI-powered health companion</p>
        </div>

        <div className="bg-[#0d1117] border border-gray-800 rounded-xl p-7">
          <h2 className="text-base font-semibold text-white mb-1">
            {isLogin ? 'Welcome back' : 'Create an account'}
          </h2>
          <p className="text-xs text-gray-600 mb-6">
            {isLogin ? 'Sign in to continue to CuraWise.AI' : 'Get started with CuraWise.AI'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-semibold tracking-widest text-gray-600 uppercase mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full bg-[#030712] border border-gray-800 text-white placeholder-gray-700 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-gray-600 transition-colors"
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold tracking-widest text-gray-600 uppercase mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full bg-[#030712] border border-gray-800 text-white placeholder-gray-700 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-gray-600 transition-colors"
              />
            </div>

            {error && (
              <p className="text-xs text-red-400 bg-red-950/30 border border-red-900/50 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors mt-1"
            >
              {loading ? 'Please wait...' : isLogin ? 'Sign in' : 'Create account'}
            </button>
          </form>

          <div className="mt-5 pt-5 border-t border-gray-800 text-center">
            <button
              onClick={() => { setIsLogin(!isLogin); setError('') }}
              className="text-xs text-gray-600 hover:text-gray-400 transition-colors"
            >
              {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
            </button>
          </div>
        </div>

        <p className="mt-4 text-xs text-gray-700 text-center">
          Auth powered by Supabase
        </p>
      </div>
    </div>
  )
}
