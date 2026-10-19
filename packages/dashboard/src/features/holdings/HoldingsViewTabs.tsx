export type HoldingsView = 'positions' | 'underlying'

const HOLDINGS_VIEWS: Array<{ id: HoldingsView; label: string }> = [
  { id: 'positions', label: 'Positions' },
  { id: 'underlying', label: 'Underlying exposure' },
]

export function HoldingsViewTabs({
  value,
  onChange,
}: {
  value: HoldingsView
  onChange: (value: HoldingsView) => void
}) {
  return (
    <nav
      aria-label="Holdings views"
      className="mb-5 flex max-w-full overflow-x-auto rounded-lg border border-gray-800 bg-gray-900 p-1 sm:w-fit"
    >
      {HOLDINGS_VIEWS.map((view) => {
        const active = value === view.id
        return (
          <button
            key={view.id}
            id={`holdings-${view.id}-tab`}
            type="button"
            aria-current={active ? 'page' : undefined}
            aria-controls={`holdings-${view.id}-panel`}
            onClick={() => onChange(view.id)}
            className={`shrink-0 rounded-md px-3 py-2 text-sm font-medium transition-colors ${active ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-800 hover:text-gray-300'}`}
          >
            {view.label}
          </button>
        )
      })}
    </nav>
  )
}
