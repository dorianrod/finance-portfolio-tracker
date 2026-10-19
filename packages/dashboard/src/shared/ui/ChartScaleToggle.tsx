export type ChartScaleMode = 'value' | 'percentage'

export function ChartScaleToggle({ value, onChange }: {
  value: ChartScaleMode
  onChange: (value: ChartScaleMode) => void
}) {
  return (
    <div className="inline-flex shrink-0 rounded-lg border border-gray-700 bg-gray-950 p-0.5" aria-label="Chart scale">
      <button
        type="button"
        onClick={() => onChange('value')}
        aria-pressed={value === 'value'}
        className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${value === 'value' ? 'bg-gray-700 text-white' : 'text-gray-500 hover:text-gray-300'}`}
      >
        €
      </button>
      <button
        type="button"
        onClick={() => onChange('percentage')}
        aria-pressed={value === 'percentage'}
        className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${value === 'percentage' ? 'bg-gray-700 text-white' : 'text-gray-500 hover:text-gray-300'}`}
      >
        100%
      </button>
    </div>
  )
}
