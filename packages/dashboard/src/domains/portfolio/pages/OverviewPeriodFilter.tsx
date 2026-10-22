import type { OverviewPeriod, OverviewWindows } from './overviewComparison.logic'

interface OverviewPeriodFilterProps {
  windows: OverviewWindows
  onEdit: () => void
}

function dateLabel(date: string): string {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${date}T00:00:00Z`))
}

function rangeLabel(period: OverviewPeriod): string {
  return `${dateLabel(period.start)} – ${dateLabel(period.end)}`
}

export function OverviewPeriodFilter({ windows, onEdit }: OverviewPeriodFilterProps) {
  return (
    <div
      className="flex w-full min-w-0 flex-col overflow-hidden rounded-xl border border-gray-800 bg-gray-900 sm:w-auto sm:flex-row"
      aria-label="Comparison periods"
    >
      <button
        type="button"
        onClick={onEdit}
        aria-label="Edit current comparison period"
        className="group flex min-w-0 items-center gap-2.5 px-3 py-2 text-left transition-colors hover:bg-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500"
      >
        <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wide text-blue-400">Current</span>
        <span className="truncate text-xs font-medium text-gray-300">{rangeLabel(windows.current)}</span>
        <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className="h-3.5 w-3.5 shrink-0 text-gray-600 transition-colors group-hover:text-gray-400">
          <path d="M4 5h12M6.5 10h7M8.5 15h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>
      <div className="flex min-w-0 items-center gap-2.5 border-t border-gray-800 px-3 py-2 sm:border-l sm:border-t-0">
        <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wide text-gray-600">Previous</span>
        <span className="truncate text-xs text-gray-500">{rangeLabel(windows.previous)}</span>
      </div>
    </div>
  )
}
