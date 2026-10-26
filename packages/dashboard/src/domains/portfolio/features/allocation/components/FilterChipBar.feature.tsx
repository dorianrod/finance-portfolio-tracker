import { useAtomValue } from 'jotai'

import { useDashboardAllocationFilters } from '@/domains/portfolio/shared/services/actions/useDashboardAllocationFilters'
import { dashboardAllocationFilterAtom } from '@/domains/portfolio/shared/stores/dashboardAllocation.atoms'
import type { AllocationDimension } from '@/domains/portfolio/shared/types/allocationChart.type'
import i18n from '@/i18n/i18n'
import { Button } from '@/shared/ui/Controls.view'
import { Decorative } from '@/shared/ui/Controls.view'
import { Text } from '@/shared/ui/Text.view'

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
      <Text variant="captionOverline" tone="subtle" className="w-24 shrink-0">
        {i18n.t('ui.filterchipbar.allocation')}
      </Text>
      <Button
        type="button"
        onClick={clearFilter}
        title={i18n.t('ui.filterchipbar.clearAllocationFilter')}
        variant="appliedFilter"
        className="inline-flex max-w-full items-center gap-1 px-3 py-1"
      >
        <Text variant="secondaryMedium">{DIM_LABELS[filter.type]}</Text>
        <Decorative variant="faint">:</Decorative>
        <Text variant="strong">{filter.value}</Text>
        <Decorative variant="subdued" className="ml-1">
          ×
        </Decorative>
      </Button>
    </div>
  )
}
