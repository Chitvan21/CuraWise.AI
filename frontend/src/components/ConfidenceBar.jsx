export default function ConfidenceBar({ confidence }) {
  const color =
    confidence > 75
      ? 'bg-teal-500'
      : confidence >= 50
      ? 'bg-yellow-500'
      : 'bg-red-500'

  return (
    <div className="w-full">
      <div className="flex justify-between mb-1.5">
        <span className="text-xs text-gray-500">Model Confidence</span>
        <span className="text-xs text-gray-300 font-medium">{confidence}%</span>
      </div>
      <div className="w-full bg-gray-800 rounded-full h-1.5">
        <div
          className={`${color} h-1.5 rounded-full transition-all duration-500`}
          style={{ width: `${Math.min(confidence, 100)}%` }}
        />
      </div>
    </div>
  )
}
