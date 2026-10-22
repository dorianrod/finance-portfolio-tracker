export type AllocationView = 'current' | 'trend'

interface AllocationViewToggleProps {
  value: AllocationView
  onChange: (view: AllocationView) => void
}

export function AllocationViewToggle({ value, onChange }: AllocationViewToggleProps) {
  return (
    <div
      className="inline-flex rounded-lg border border-gray-800 bg-gray-900 p-1"
      role="group"
      aria-label="Diversification view"
    >
      <button
        type="button"
        onClick={() => onChange('current')}
        aria-pressed={value === 'current'}
        className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${value === 'current' ? 'bg-blue-600 text-white' : 'text-gray-500 hover:text-gray-300'}`}
      >
        Current
      </button>
      <button
        type="button"
        onClick={() => onChange('trend')}
        aria-pressed={value === 'trend'}
        className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${value === 'trend' ? 'bg-blue-600 text-white' : 'text-gray-500 hover:text-gray-300'}`}
      >
        Trend
      </button>
    </div>
  )
}
