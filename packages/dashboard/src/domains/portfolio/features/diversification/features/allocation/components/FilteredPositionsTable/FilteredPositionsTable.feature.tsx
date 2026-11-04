import { useAtomValue } from 'jotai'

import { sumFilteredPositionValues } from '@/domains/portfolio/features/diversification/features/allocation/components/FilteredPositionsTable/helpers/transformers/sumFilteredPositionValues'
import { useDashboardDiversificationFilters } from '@/domains/portfolio/features/diversification/features/allocation/services/actions/useDashboardDiversificationFilters'
import { useDashboardDiversificationPositions } from '@/domains/portfolio/features/diversification/features/allocation/services/actions/useDashboardDiversificationPositions'
import { dashboardDiversificationFilterAtom } from '@/domains/portfolio/features/diversification/features/allocation/stores/dashboardAllocation/dashboardDiversificationFilter.atoms'
import { dashboardDiversificationPositionsOpenAtom } from '@/domains/portfolio/features/diversification/features/allocation/stores/dashboardAllocation/dashboardDiversificationPositionsOpen.atoms'
import type { MatchingIsinRow } from '@/domains/portfolio/features/diversification/features/allocation/types/matchingIsinRow.type'

import { FilteredPositionsTableView } from './FilteredPositionsTable.view'

export function FilteredPositionsTable({ rows }: { rows: MatchingIsinRow[] }) {
  const filter = useAtomValue(dashboardDiversificationFilterAtom)
  const { clearFilter } = useDashboardDiversificationFilters()
  const { closePositions } = useDashboardDiversificationPositions()
  const positionsOpen = useAtomValue(dashboardDiversificationPositionsOpenAtom)
  const totalFiltered = sumFilteredPositionValues(rows)

  return (
    <FilteredPositionsTableView
      rows={rows}
      filterValue={filter?.value ?? ''}
      totalFiltered={totalFiltered}
      open={positionsOpen && filter !== null && rows.length > 0}
      onClose={closePositions}
      onClear={clearFilter}
    />
  )
}
