export type ConcentrationMode = 'held' | 'lookThrough'

export function ConcentrationModeToggle({
  value,
  onChange,
}: {
  value: ConcentrationMode
  onChange: (value: ConcentrationMode) => void
}) {
  return (
    <div className="inline-flex shrink-0 rounded-lg border border-gray-800 bg-gray-950/60 p-0.5" aria-label="Concentration method">
      <button
        type="button"
        onClick={() => onChange('held')}
        title="Assets effectively held, at the allocation-file level"
        className={`rounded-md px-2 py-1 text-[11px] font-medium transition-colors ${value === 'held' ? 'bg-blue-600 text-white' : 'text-gray-500 hover:text-gray-300'}`}
      >
        Held positions
      </button>
      <button
        type="button"
        onClick={() => onChange('lookThrough')}
        title="Companies held directly and through funds"
        className={`rounded-md px-2 py-1 text-[11px] font-medium transition-colors ${value === 'lookThrough' ? 'bg-blue-600 text-white' : 'text-gray-500 hover:text-gray-300'}`}
      >
        Look-through
      </button>
    </div>
  )
}
