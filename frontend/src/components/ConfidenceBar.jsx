export default function ConfidenceBar({ confidence }) {
  const color =
    confidence > 75
      ? 'bg-green-500'
      : confidence >= 50
      ? 'bg-yellow-400'
      : 'bg-red-500'

  return (
    <div className="w-full">
      <div className="flex justify-between text-sm text-gray-400 mb-1">
        <span>Model Confidence</span>
        <span className="font-semibold text-white">{confidence}%</span>
      </div>
      <div className="w-full bg-gray-700 rounded-full h-3">
        <div
          className={`${color} h-3 rounded-full transition-all duration-500`}
          style={{ width: `${Math.min(confidence, 100)}%` }}
        />
      </div>
    </div>
  )
}
