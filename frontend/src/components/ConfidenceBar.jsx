export default function ConfidenceBar({ confidence }) {
  const color = confidence > 75 ? '#14b8a6' : confidence >= 50 ? '#eab308' : '#ef4444'
  const glow  = confidence > 75
    ? '0 0 8px rgba(20,184,166,0.6)'
    : confidence >= 50
    ? '0 0 8px rgba(234,179,8,0.6)'
    : '0 0 8px rgba(239,68,68,0.6)'

  return (
    <div className="w-full">
      <div className="flex justify-between mb-1.5">
        <span className="text-xs text-gray-500">Model Confidence</span>
        <span className="text-xs text-gray-300 font-medium">{confidence}%</span>
      </div>
      <div className="w-full bg-gray-800/60 rounded-full h-1.5 overflow-hidden">
        <div
          className="h-1.5 rounded-full transition-all duration-700"
          style={{ width: `${Math.min(confidence, 100)}%`, backgroundColor: color, boxShadow: glow }}
        />
      </div>
    </div>
  )
}
