import ConfidenceBar from './ConfidenceBar'

const icons = {
  precautions: '⚠️',
  workout: '🏋️',
  diets: '🥗',
  medications: '💊',
}

function ListColumn({ title, items, icon }) {
  return (
    <div className="bg-gray-900 rounded-xl p-4">
      <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
        {icon} {title}
      </h3>
      <ul className="space-y-1.5">
        {items.map((item, i) => (
          <li key={i} className="text-sm text-gray-300 flex gap-2">
            <span className="text-indigo-400 mt-0.5">•</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function ResultCard({ result }) {
  const { disease, confidence, description, precautions, workout, diets, medications } = result

  return (
    <div className="bg-gray-800 rounded-2xl p-6 space-y-5">
      <div>
        <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Predicted Disease</p>
        <h2 className="text-3xl font-bold text-indigo-400">{disease}</h2>
      </div>
      <ConfidenceBar confidence={confidence} />
      <p className="text-gray-300 text-sm leading-relaxed">{description}</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <ListColumn title="Precautions" items={precautions} icon={icons.precautions} />
        <ListColumn title="Workout" items={workout} icon={icons.workout} />
        <ListColumn title="Diets" items={diets} icon={icons.diets} />
        <ListColumn title="Medications" items={medications} icon={icons.medications} />
      </div>
    </div>
  )
}
