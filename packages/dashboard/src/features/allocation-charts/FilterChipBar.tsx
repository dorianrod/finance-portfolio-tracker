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
}: {
  filter: AllocationFilter
  onRemove: () => void
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="w-24 shrink-0 text-xs uppercase tracking-wider text-gray-500">Allocation</span>
      <button
        type="button"
        onClick={onRemove}
        title="Clear allocation filter"
        className="inline-flex max-w-full cursor-pointer items-center gap-1 rounded-full border border-blue-500 bg-blue-600 px-3 py-1 text-xs text-white transition-colors hover:border-blue-400 hover:bg-blue-500"
      >
        <span className="font-medium opacity-80">{DIM_LABELS[filter.type]}</span>
        <span aria-hidden="true" className="opacity-60">:</span>
        <span className="font-semibold">{filter.value}</span>
        <span aria-hidden="true" className="ml-1 opacity-70">×</span>
      </button>
    </div>
  )
}
