import i18n from '@/i18n/i18n'
import { useAtomValue } from 'jotai'
import { useDashboardAllocationFilters } from '@/domains/portfolio/pages/dashboard/services/actions/useDashboardAllocationFilters'
import { dashboardAllocationFilterAtom } from '@/domains/portfolio/pages/dashboard/stores/dashboardAllocation.atoms'
import type { AllocationDimension } from './allocationCharts.types'

const DIM_LABELS: Record<AllocationDimension, string> = {
  geo: i18n.t('ui.filterchipbar.geo'),
  secteur: i18n.t('ui.filterchipbar.sector'),
  currency: i18n.t('ui.filterchipbar.currency'),
  classe: i18n.t('ui.filterchipbar.class'),
}

export function FilterChipBar() {
  const filter = useAtomValue(dashboardAllocationFilterAtom)
  const { clearFilter } = useDashboardAllocationFilters()
  if (!filter) return null

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="w-24 shrink-0 text-xs uppercase tracking-wider text-gray-500">{i18n.t('ui.filterchipbar.allocation')}</span>
      <button
        type="button"
        onClick={clearFilter}
        title={i18n.t('ui.filterchipbar.clearAllocationFilter')}
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
