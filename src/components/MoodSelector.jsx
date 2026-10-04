import { MOODS } from '../lib/constants'

export default function MoodSelector({ value, onChange }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
      {MOODS.map((mood) => {
        const selected = value === mood.id
        return (
          <button
            key={mood.id}
            type="button"
            onClick={() => onChange(mood.id)}
            className={`flex flex-col items-center justify-center gap-2 rounded-3xl px-3 py-4 transition ${
              selected
                ? 'ring-2 ring-bloom-navy/20 scale-[1.02]'
                : 'hover:scale-[1.02]'
            }`}
            style={{ backgroundColor: mood.color }}
            aria-pressed={selected}
          >
            <span className="text-3xl" aria-hidden="true">
              {mood.emoji}
            </span>
            <span className="text-sm font-bold text-bloom-navy">{mood.label}</span>
          </button>
        )
      })}
    </div>
  )
}
