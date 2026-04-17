import { useState } from 'react'
import { useLocation, Link } from 'react-router-dom'
import { generateReport } from '../services/api'

export default function Report() {
  const { state: result } = useLocation()
  const [name, setName] = useState('')
  const [age, setAge] = useState('')
  const [downloading, setDownloading] = useState(false)

  if (!result) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center gap-4">
        <div className="text-5xl">📋</div>
        <h2 className="text-xl font-semibold text-gray-300">No prediction data found</h2>
        <p className="text-gray-500 text-sm">Please run a prediction first to generate a report.</p>
        <Link
          to="/predict"
          className="mt-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-colors"
        >
          Go to Predict →
        </Link>
      </div>
    )
  }

  const { disease, description, precautions, workout, diets, medications } = result

  const handleDownload = async () => {
    if (!name || !age) return
    setDownloading(true)
    try {
      const { data } = await generateReport({ name, age: parseInt(age), disease, description, precautions, workout, diets, medications })
      const url = URL.createObjectURL(new Blob([data], { type: 'application/pdf' }))
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

  const Section = ({ title, items }) => (
    <div className="bg-gray-900 rounded-xl p-4">
      <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">{title}</h4>
      <ul className="space-y-1.5">
        {items.map((item, i) => (
          <li key={i} className="text-sm text-gray-300 flex gap-2">
            <span className="text-indigo-400">•</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-950 text-white px-4 py-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-1">Health Report 📄</h1>
        <p className="text-gray-400 mb-8">Enter your details to download a PDF report.</p>

        {/* Patient details */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Patient Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-lg px-4 py-2.5 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Age</label>
            <input
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="e.g. 25"
              min={1}
              max={120}
              className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-lg px-4 py-2.5 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
        </div>

        {/* Preview */}
        <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 mb-6 space-y-5">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Predicted Disease</p>
            <h2 className="text-2xl font-bold text-indigo-400">{disease}</h2>
          </div>
          <p className="text-sm text-gray-300 leading-relaxed">{description}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <Section title="⚠️ Precautions" items={precautions} />
            <Section title="🏋️ Workout" items={workout} />
            <Section title="🥗 Diets" items={diets} />
            <Section title="💊 Medications" items={medications} />
          </div>
        </div>

        {/* Warning */}
        <div className="bg-yellow-900/30 border border-yellow-700/50 text-yellow-300 rounded-xl px-5 py-4 mb-6 text-sm">
          ⚕️ This is an AI-generated report. Always consult a qualified doctor for diagnosis and treatment.
        </div>

        <button
          onClick={handleDownload}
          disabled={!name || !age || downloading}
          className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors"
        >
          {downloading ? 'Generating PDF...' : '⬇️ Download PDF Report'}
        </button>
      </div>
    </div>
  )
}
