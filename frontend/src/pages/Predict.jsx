import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import ConfidenceBar from '../components/ConfidenceBar'
import { predictDisease } from '../services/api'

export default function Predict() {
  const [allSymptoms, setAllSymptoms] = useState([])
  const [symptoms, setSymptoms] = useState([])
  const [query, setQuery] = useState('')
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('search')
  const [browseFilter, setBrowseFilter] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/symptoms`)
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
    <div className="min-h-screen bg-[#020d0e] text-white px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-xl font-semibold text-white mb-1">Disease Prediction</h1>
        <p className="text-gray-500 text-sm mb-8">Select your symptoms to get an AI-powered diagnosis.</p>

        {/* Symptom selector card */}
        <div className="bg-[#091518] border border-gray-800 rounded-xl p-5 mb-4">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-white font-medium">Symptoms</span>
            <span className="text-xs text-gray-600">{symptoms.length} selected</span>
          </div>

          {/* Tab switcher */}
          <div className="flex gap-5 border-b border-gray-800 mb-4">
            <button
              onClick={() => setActiveTab('search')}
              className={`text-xs font-medium pb-2 transition-colors ${
                activeTab === 'search'
                  ? 'text-white border-b-2 border-teal-500'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              Search
            </button>
            <button
              onClick={() => setActiveTab('browse')}
              className={`text-xs font-medium pb-2 transition-colors ${
                activeTab === 'browse'
                  ? 'text-white border-b-2 border-teal-500'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              Browse All ({allSymptoms.length})
            </button>
          </div>

          {activeTab === 'search' ? (
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                value={query}
                onChange={e => { setQuery(e.target.value); setDropdownOpen(true) }}
                onFocus={() => setDropdownOpen(true)}
                onBlur={() => setTimeout(() => setDropdownOpen(false), 150)}
                placeholder="Type to search symptoms..."
                className="w-full bg-[#020d0e] border border-gray-800 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-gray-600 transition-colors"
              />
              {dropdownOpen && filtered.length > 0 && (
                <div className="absolute z-50 w-full bg-[#091518] border border-gray-800 rounded-lg mt-1 max-h-60 overflow-y-auto">
                  {filtered.map(s => (
                    <div
                      key={s}
                      className="px-3 py-2 hover:bg-gray-800/50 cursor-pointer text-gray-300 text-sm transition-colors"
                      onMouseDown={() => {
                        setSymptoms([...symptoms, s])
                        setQuery('')
                        setDropdownOpen(false)
                      }}
                    >
                      {s.replace(/_/g, ' ')}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div>
              <input
                type="text"
                value={browseFilter}
                onChange={e => setBrowseFilter(e.target.value)}
                placeholder="Filter symptoms..."
                className="w-full bg-[#020d0e] border border-gray-800 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-gray-600 transition-colors mb-3"
              />
              <div className="max-h-56 overflow-y-auto grid grid-cols-3 gap-1.5">
                {allSymptoms
                  .filter(s => s.toLowerCase().includes(browseFilter.toLowerCase()))
                  .map(s => (
                    <button
                      key={s}
                      onClick={() => {
                        if (symptoms.includes(s)) {
                          setSymptoms(symptoms.filter(x => x !== s))
                        } else {
                          setSymptoms([...symptoms, s])
                        }
                      }}
                      className={`px-2 py-1.5 rounded-md text-xs text-left truncate border transition-colors ${
                        symptoms.includes(s)
                          ? 'bg-teal-600/20 text-teal-300 border-teal-500/30'
                          : 'bg-[#020d0e] border-gray-800 text-gray-400 hover:text-white hover:border-gray-600'
                      }`}
                      title={s.replace(/_/g, ' ')}
                    >
                      {s.replace(/_/g, ' ')}
                    </button>
                  ))}
              </div>
            </div>
          )}

          {/* Selected chips */}
          {symptoms.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-4">
              {symptoms.map(s => (
                <span
                  key={s}
                  className="bg-teal-600/20 text-teal-300 border border-teal-500/30 text-xs px-2.5 py-1 rounded-md flex items-center gap-1.5"
                >
                  {s.replace(/_/g, ' ')}
                  <button
                    onClick={() => setSymptoms(symptoms.filter(x => x !== s))}
                    className="text-teal-400/60 hover:text-teal-200 transition-colors"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}

          {symptoms.length > 0 && symptoms.length < 3 && (
            <p className="mt-3 text-xs text-yellow-500/80">
              Select at least 3 symptoms ({3 - symptoms.length} more needed).
            </p>
          )}
        </div>

        <button
          onClick={handlePredict}
          disabled={symptoms.length < 3 || loading}
          className="w-full bg-teal-600 hover:bg-teal-500 text-white text-sm font-medium py-2.5 rounded-lg mt-1 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading
            ? 'Predicting...'
            : symptoms.length < 3
            ? `Select ${Math.max(0, 3 - symptoms.length)} more symptom(s)`
            : 'Predict Disease'}
        </button>

        {error && (
          <div className="bg-red-950/30 border border-red-900/50 text-red-400 rounded-lg px-4 py-3 mt-4 text-sm">
            {error}
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="w-5 h-5 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {result && (
          <div className="bg-[#091518] border border-gray-800 rounded-xl p-6 mt-6 space-y-5">
            {/* Disease + confidence */}
            <div>
              <p className="text-[10px] font-semibold tracking-widest text-gray-600 uppercase mb-2">
                Predicted Disease
              </p>
              <h2 className="text-2xl font-bold text-white mb-3">{result.disease}</h2>
              <ConfidenceBar confidence={result.confidence} />
            </div>

            <p className="text-gray-400 text-sm leading-relaxed">{result.description}</p>

            <hr className="border-gray-800" />

            {/* Detail sections */}
            {[
              { label: 'Precautions', items: result.precautions },
              { label: 'Recommendations', items: result.workout },
              { label: 'Diets', items: result.diets },
              { label: 'Medications', items: result.medications },
            ].map(({ label, items }) => (
              <div key={label}>
                <p className="text-[10px] font-semibold tracking-widest text-gray-600 uppercase mb-2">
                  {label}
                </p>
                <ul className="space-y-1">
                  {items.map((item, i) => (
                    <li key={i} className="text-gray-400 text-sm flex gap-2">
                      <span className="text-gray-700 shrink-0">–</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            <p className="text-xs text-gray-700 pt-2">
              AI-generated for educational purposes only. Consult a qualified doctor.
            </p>

            <button
              onClick={() => navigate('/report', { state: { result, symptoms } })}
              className="w-full py-2.5 bg-[#020d0e] border border-gray-800 hover:border-gray-600 text-gray-300 text-sm font-medium rounded-lg transition-colors"
            >
              Generate Report
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
