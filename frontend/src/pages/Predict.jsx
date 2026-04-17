import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import ResultCard from '../components/ResultCard'
import { predictDisease } from '../services/api'

export default function Predict() {
  const [allSymptoms, setAllSymptoms] = useState([])
  const [symptoms, setSymptoms] = useState([])
  const [query, setQuery] = useState('')
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    fetch('http://localhost:8000/api/symptoms')
      .then(r => r.json())
      .then(data => setAllSymptoms(data.symptoms || []))
      .catch(() => setAllSymptoms([]))
  }, [])

  const filtered = query.length > 0
    ? allSymptoms.filter(s => s.toLowerCase().includes(query.toLowerCase()) && !symptoms.includes(s)).slice(0, 10)
    : []

  const handlePredict = async () => {
    if (symptoms.length < 3) return
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const { data } = await predictDisease(symptoms)
      setResult(data)
    } catch (err) {
      setError(err.response?.data?.detail || 'Prediction failed. Is the backend running?')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white px-4 py-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-1">Disease Prediction 🔮</h1>
        <p className="text-gray-400 mb-8">Select your symptoms to get an AI-powered diagnosis.</p>

        {/* Symptom selector */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-6">
          <label className="block text-sm font-medium text-gray-400 mb-3">
            Select Symptoms{' '}
            <span className="text-gray-600">({symptoms.length} selected)</span>
          </label>

          <div style={{ position: 'relative' }}>
            {/* Selected chips */}
            <div className="flex flex-wrap gap-2 mb-2">
              {symptoms.map(s => (
                <span key={s} className="bg-indigo-600 text-white px-3 py-1 rounded-full text-sm flex items-center gap-1">
                  {s}
                  <button onClick={() => setSymptoms(symptoms.filter(x => x !== s))}>×</button>
                </span>
              ))}
            </div>

            {/* Search input */}
            <input
              type="text"
              value={query}
              onChange={e => { setQuery(e.target.value); setDropdownOpen(true) }}
              onFocus={() => setDropdownOpen(true)}
              onBlur={() => setTimeout(() => setDropdownOpen(false), 150)}
              placeholder="Type to search symptoms..."
              className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:border-indigo-500"
            />

            {/* Dropdown */}
            {dropdownOpen && filtered.length > 0 && (
              <div className="absolute z-50 w-full bg-gray-800 border border-gray-600 rounded-lg mt-1 max-h-60 overflow-y-auto">
                {filtered.map(s => (
                  <div
                    key={s}
                    className="px-4 py-2 hover:bg-gray-700 cursor-pointer text-white text-sm"
                    onMouseDown={() => {
                      setSymptoms([...symptoms, s])
                      setQuery('')
                      setDropdownOpen(false)
                    }}
                  >
                    {s}
                  </div>
                ))}
              </div>
            )}
          </div>

          {symptoms.length > 0 && symptoms.length < 3 && (
            <p className="mt-3 text-sm text-yellow-400">
              ⚠️ Select at least 3 symptoms for an accurate prediction ({3 - symptoms.length} more needed).
            </p>
          )}
        </div>

        <button
          onClick={handlePredict}
          disabled={symptoms.length < 3 || loading}
          className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors mb-6"
        >
          {loading
            ? 'Predicting...'
            : symptoms.length < 3
            ? `Select ${Math.max(0, 3 - symptoms.length)} more symptom(s)`
            : 'Predict Disease 🔮'}
        </button>

        {error && (
          <div className="bg-red-900/40 border border-red-700 text-red-300 rounded-xl px-5 py-4 mb-6 text-sm">
            {error}
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {result && (
          <>
            <ResultCard result={result} />
            <button
              onClick={() => navigate('/report', { state: result })}
              className="mt-4 w-full py-3 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white font-semibold rounded-xl transition-colors"
            >
              📄 Generate PDF Report
            </button>
          </>
        )}
      </div>
    </div>
  )
}
