import { useAtomValue } from 'jotai'
import { useCallback, useMemo } from 'react'

import {
  allocationTrendDomain,
  buildAllocationTrend,
} from '@/domains/portfolio/features/allocation/helpers/calculators/allocationChartCalculations'
import { ScopedInfoTooltip } from '@/domains/portfolio/shared/components/kpis/ScopedInfoTooltip.feature'
import { useDashboardAllocationFilters } from '@/domains/portfolio/shared/services/actions/useDashboardAllocationFilters'
import { useDashboardAllocationPositions } from '@/domains/portfolio/shared/services/actions/useDashboardAllocationPositions'
import {
  dashboardAllocationFilterAtom,
  dashboardAllocationPositionsOpenAtom,
} from '@/domains/portfolio/shared/stores/dashboardAllocation.atoms'
import type { AllocationDimension } from '@/domains/portfolio/shared/types/allocationChart.type'
import type { AllocationPoint } from '@/domains/portfolio/shared/types/allocationPoint.type'
import i18n from '@/i18n/i18n'

import { EvoCardView } from './EvoCard.view'
import { PositionsToggle } from './PositionsToggle.view'

export function EvoCard({
  title,
  points,
  dimension,
}: {
  title: string
  points: AllocationPoint[]
  dimension: AllocationDimension
}) {
  const activeFilter = useAtomValue(dashboardAllocationFilterAtom)
  const positionsOpen = useAtomValue(dashboardAllocationPositionsOpenAtom)
  const { toggleFilter } = useDashboardAllocationFilters()
  const { togglePositions } = useDashboardAllocationPositions()
  const model = useMemo(
    () => ({
      ...buildAllocationTrend(points),
      dateDomain: allocationTrendDomain(points),
    }),
    [points],
  )
  const selectCategory = useCallback(
    (value: string) => toggleFilter({ type: dimension, value }),
    [dimension, toggleFilter],
  )
  return (
    <EvoCardView
      title={title}
      categories={model.categories}
      chartData={model.rows}
      groupedCategory={model.groupedCategory}
      dateDomain={model.dateDomain}
      activeCategory={
        activeFilter?.type === dimension ? activeFilter.value : null
      }
      isFiltered={activeFilter !== null}
      onSelect={selectCategory}
    >
      <EvoCardView.Tooltip>
        <ScopedInfoTooltip
          // eslint-disable-next-line local/no-prop-drilling -- The chart feature owns its translated description; the adapter adds live filter scope.
          text={i18n.t('ui.evocard.historicalPortfolioAllocationByValue0', {
            value0: title.toLowerCase(),
          })}
          scope={{ account: 'filterable', period: 'range' }}
        />
      </EvoCardView.Tooltip>
      <EvoCardView.PositionsControl>
        {activeFilter?.type === dimension ? (
          <PositionsToggle open={positionsOpen} onClick={togglePositions} />
        ) : null}
      </EvoCardView.PositionsControl>
    </EvoCardView>
  )
}
