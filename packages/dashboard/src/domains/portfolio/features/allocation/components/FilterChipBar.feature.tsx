import { useAtomValue } from 'jotai'

import { useDashboardAllocationFilters } from '@/domains/portfolio/shared/services/actions/useDashboardAllocationFilters'
import { dashboardAllocationFilterAtom } from '@/domains/portfolio/shared/stores/dashboardAllocation.atoms'
import type { AllocationDimension } from '@/domains/portfolio/shared/types/allocationChart.type'
import i18n from '@/i18n/i18n'
import { Decorative } from '@/shared/ui/Controls.view'

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
      <span className="w-24 shrink-0 text-xs uppercase tracking-wider text-content-subtle">
        {i18n.t('ui.filterchipbar.allocation')}
      </span>
      <button
        type="button"
        onClick={clearFilter}
        title={i18n.t('ui.filterchipbar.clearAllocationFilter')}
        className="inline-flex max-w-full cursor-pointer items-center gap-1 rounded-full border border-accent bg-accent-solid px-3 py-1 text-xs text-content transition-colors hover:border-accent hover:bg-accent-solid"
      >
        <span className="font-medium opacity-80">
          {DIM_LABELS[filter.type]}
        </span>
        <Decorative className="opacity-60">:</Decorative>
        <span className="font-semibold">{filter.value}</span>
        <Decorative className="ml-1 opacity-70">×</Decorative>
      </button>
    </div>
  )
}
