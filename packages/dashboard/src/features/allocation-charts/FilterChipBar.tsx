import { catColor } from '@/shared/format/colors'
import type { AllocationDimension, AllocationFilter } from './allocationCharts.types'

const DIM_LABELS: Record<AllocationDimension, string> = {
  geo: 'Geo',
  secteur: 'Sector',
  currency: 'Currency',
  classe: 'Class',
}

export function FilterChipBar({
  filter,
  onRemove,
  onShowTable,
  tableOpen,
}: {
  filter: AllocationFilter
  onRemove: () => void
  onShowTable: () => void
  tableOpen: boolean
}) {
  return (
    <div className="flex items-center gap-3 mb-4 p-3 bg-gray-900 rounded-xl border border-gray-700">
      <span className="text-xs text-gray-500">Filter:</span>
      <span
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
        style={{
          background: catColor(filter.value) + '22',
          color: catColor(filter.value),
          border: `1px solid ${catColor(filter.value)}55`,
        }}
      >
        <span className="text-gray-400 font-normal">{DIM_LABELS[filter.type]}:</span>
        {filter.value}
        <button onClick={onRemove} className="ml-0.5 hover:opacity-75 cursor-pointer leading-none">×</button>
      </span>

      {/* Table toggle */}
      <button
        onClick={onShowTable}
        title="View positions"
        className={`ml-auto flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs transition-colors cursor-pointer ${
          tableOpen
            ? 'bg-gray-700 text-gray-200'
            : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800'
        }`}
      >
        <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor">
          <rect x="1" y="1" width="6" height="6" rx="1" opacity=".7" />
          <rect x="9" y="1" width="6" height="6" rx="1" opacity=".7" />
          <rect x="1" y="9" width="6" height="6" rx="1" opacity=".7" />
          <rect x="9" y="9" width="6" height="6" rx="1" opacity=".7" />
        </svg>
        Positions
      </button>
    </div>
  )
}
