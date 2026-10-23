import i18n from '@/i18n/i18n'
import { useDashboardFilters } from '@/domains/portfolio/shared/services/actions/useDashboardFilters'
import type { OverviewWindows } from '@/domains/portfolio/shared/helpers/calculators/buildOverviewComparison'
import { useFormatDate } from '@/shared/helpers/formatters/useFormatDate'
import { formatOverviewPeriodRange } from '@/domains/portfolio/features/overview/helpers/formatters/formatOverviewPeriodRange'

interface OverviewPeriodFilterProps {
  windows: OverviewWindows
}

export function OverviewPeriodFilter({ windows }: OverviewPeriodFilterProps) {
  const formatDate = useFormatDate()
  const { openFilters } = useDashboardFilters()

  return (
    <div
      className="flex w-full min-w-0 flex-col overflow-hidden rounded-xl border border-gray-800 bg-gray-900 sm:w-auto sm:flex-row"
      aria-label={i18n.t('ui.overviewperiodfilter.comparisonPeriods')}
    >
      <button
        type="button"
        onClick={openFilters}
        aria-label={i18n.t('ui.overviewperiodfilter.editCurrentComparisonPeriod')}
        className="group flex min-w-0 items-center gap-2.5 px-3 py-2 text-left transition-colors hover:bg-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500"
      >
        <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wide text-blue-400">{i18n.t('ui.overviewperiodfilter.current')}</span>
        <span className="truncate text-xs font-medium text-gray-300">{formatOverviewPeriodRange(windows.current, formatDate)}</span>
        <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className="h-3.5 w-3.5 shrink-0 text-gray-600 transition-colors group-hover:text-gray-400">
          <path d="M4 5h12M6.5 10h7M8.5 15h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>
      <div className="flex min-w-0 items-center gap-2.5 border-t border-gray-800 px-3 py-2 sm:border-l sm:border-t-0">
        <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wide text-gray-600">{i18n.t('ui.overviewperiodfilter.previous')}</span>
        <span className="truncate text-xs text-gray-500">{formatOverviewPeriodRange(windows.previous, formatDate)}</span>
      </div>
    </div>
  )
}
