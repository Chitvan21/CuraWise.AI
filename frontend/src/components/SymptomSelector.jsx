import { useState, useRef, useEffect } from 'react'

export default function SymptomSelector({ allSymptoms, selected, onChange }) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  const filtered = allSymptoms
    .filter((s) => s.toLowerCase().includes(query.toLowerCase()) && !selected.includes(s))
    .slice(0, 8)

  const add = (symptom) => {
    onChange([...selected, symptom])
    setQuery('')
  }

  const remove = (symptom) => onChange(selected.filter((s) => s !== symptom))

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div className="w-full" ref={ref}>
      {/* Selected chips */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {selected.map((s) => (
            <span
              key={s}
              className="flex items-center gap-1 bg-indigo-600 text-white text-sm px-3 py-1 rounded-full"
            >
              {s.replace(/_/g, ' ')}
              <button
                onClick={() => remove(s)}
                className="ml-1 text-indigo-200 hover:text-white font-bold leading-none"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Search input */}
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true) }}
          onFocus={() => setOpen(true)}
          placeholder="Search symptoms..."
          className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-lg px-4 py-2.5 focus:outline-none focus:border-indigo-500 transition-colors"
        />
        {open && filtered.length > 0 && (
          <ul className="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg overflow-y-auto max-h-48 shadow-xl">
            {filtered.map((s) => (
              <li
                key={s}
                onMouseDown={() => add(s)}
                className="px-4 py-2.5 text-sm text-gray-200 hover:bg-indigo-600 hover:text-white cursor-pointer transition-colors"
              >
                {s.replace(/_/g, ' ')}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
