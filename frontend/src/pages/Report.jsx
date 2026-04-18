import { useState } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { generateReport } from '../services/api'

export default function Report() {
  const { state } = useLocation()
  const navigate = useNavigate()
  const result = state?.result
  const [name, setName] = useState('')
  const [age, setAge] = useState('')
  const [downloading, setDownloading] = useState(false)

  if (!result) {
    return (
      <div className="min-h-screen bg-[#020d0e] text-white flex flex-col items-center justify-center gap-3">
        <h2 className="text-base font-semibold text-gray-300">No prediction data found</h2>
        <p className="text-sm text-gray-600">Please run a prediction first to generate a report.</p>
        <Link
          to="/predict"
          className="mt-2 px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white text-sm font-medium rounded-lg transition-colors"
        >
          Go to Predict
        </Link>
      </div>
    )
  }

  const { disease, confidence, description, precautions, workout, diets, medications } = result

  const handleDownload = async () => {
    if (!name || !age) return
    setDownloading(true)
    try {
      const response = await generateReport({
        name,
        age: parseInt(age),
        disease,
        description,
        precautions,
        workout,
        diets,
        medications,
      })
      const url = URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }))
      const a = document.createElement('a')
      a.href = url
      a.download = `CuraWise_${name}_Report.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      alert('Failed to generate report. Is the backend running?')
    } finally {
      setDownloading(false)
    }
  }

  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

  return (
    <div className="min-h-screen bg-[#020d0e] text-white px-4 py-10">
      <div className="max-w-5xl mx-auto flex flex-col lg:flex-row gap-6 items-start">

        {/* Left — Report card */}
        <div className="flex-[3]">
          <div className="bg-[#091518] border border-gray-800 rounded-xl p-8">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h1 className="text-base font-semibold text-white">CuraWise Health Report</h1>
                <p className="text-xs text-gray-600 mt-0.5">{today}</p>
              </div>
            </div>

            {/* Patient inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-[10px] font-semibold tracking-widest text-gray-600 uppercase mb-2">
                  Patient Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Your name"
                  className="w-full bg-[#020d0e] border border-gray-800 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-700 focus:outline-none focus:border-gray-700 transition-colors"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold tracking-widest text-gray-600 uppercase mb-2">
                  Age
                </label>
                <input
                  type="number"
                  value={age}
                  onChange={e => setAge(e.target.value)}
                  placeholder="e.g. 25"
                  min={1}
                  max={120}
                  className="w-full bg-[#020d0e] border border-gray-800 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-700 focus:outline-none focus:border-gray-700 transition-colors"
                />
              </div>
            </div>

            <hr className="border-gray-800 mb-6" />

            {/* Disease */}
            <div className="mb-5">
              <p className="text-[10px] font-semibold tracking-widest text-gray-600 uppercase mb-2">
                Predicted Disease
              </p>
              <h2 className="text-xl font-bold text-white mb-1">{disease}</h2>
              <span className="text-xs text-gray-600">Confidence: {confidence}%</span>
            </div>

            <p className="text-sm text-gray-400 leading-relaxed mb-6">{description}</p>

            {/* Sections */}
            <div className="space-y-5">
              {[
                { label: 'Precautions', items: precautions },
                { label: 'Recommendations', items: workout },
                { label: 'Diets', items: diets },
                { label: 'Medications', items: medications },
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
            </div>

            <p className="mt-8 text-xs text-gray-700 border-t border-gray-800 pt-5">
              This is an AI-generated report for educational purposes only. Always consult a qualified doctor.
            </p>
          </div>
        </div>

        {/* Right — Actions */}
        <div className="flex-[2] lg:sticky lg:top-6">
          <div className="space-y-2.5">
            <button
              onClick={handleDownload}
              disabled={!name || !age || downloading}
              className="w-full py-2.5 bg-teal-600 hover:bg-teal-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
            >
              {downloading ? 'Generating...' : 'Download PDF'}
            </button>
            {(!name || !age) && (
              <p className="text-xs text-gray-700 text-center">Enter name and age to enable download</p>
            )}

            <button
              onClick={() => navigate('/predict')}
              className="w-full py-2.5 bg-[#091518] border border-gray-800 hover:border-gray-600 text-gray-300 text-sm font-medium rounded-lg transition-colors"
            >
              New Prediction
            </button>

            <button
              onClick={() => navigate('/chat')}
              className="w-full py-2.5 bg-[#091518] border border-gray-800 hover:border-gray-600 text-gray-300 text-sm font-medium rounded-lg transition-colors"
            >
              Chat with AI
            </button>

            <div className="border-l-2 border-amber-500/50 bg-amber-500/5 text-amber-200/70 text-xs p-3 rounded-r-lg mt-4">
              Always consult a qualified medical professional before making any health decisions.
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
