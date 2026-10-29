import { useAtomValue } from 'jotai'

import { useAllocationCharts } from '@/domains/portfolio/features/diversification/features/allocation/helpers/mappers/useAllocationCharts'
import { dashboardDiversificationFilterAtom } from '@/domains/portfolio/features/diversification/features/allocation/stores/dashboardAllocation/dashboardDiversificationFilterAtom'
import type { DiversificationInputs } from '@/domains/portfolio/features/diversification/shared/types/diversificationInputs.type'
import type { DiversificationView } from '@/domains/portfolio/features/diversification/shared/types/diversificationView.type'

import { AllocationCurrentView } from './AllocationCurrentView.feature'
import { AllocationTrendView } from './AllocationTrendView.feature'
import { FilteredPositionsTable } from './FilteredPositionsTable/FilteredPositionsTable.feature'

export function AllocationSection({
  rawData,
  dateFrom,
  dateTo,
  view,
}: Pick<DiversificationInputs, 'rawData' | 'dateFrom' | 'dateTo'> & {
  view: DiversificationView
}) {
  const activeFilter = useAtomValue(dashboardDiversificationFilterAtom)
  const charts = useAllocationCharts({
    rawData,
    dateFrom,
    dateTo,
    activeFilter,
  })
  return (
    <>
      {view === 'current' ? (
        <AllocationCurrentView charts={charts} />
      ) : (
        <AllocationTrendView charts={charts} />
      )}
      <FilteredPositionsTable rows={charts.tableRows} />
    </>
  )
}
