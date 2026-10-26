import { useAtomValue } from 'jotai'
import { useCallback, useMemo } from 'react'

import { allocationTrendDomain } from '@/domains/portfolio/features/diversification/features/allocation/components/EvoCard/helpers/presenters/allocationTrendDomain'
import { PositionsToggle } from '@/domains/portfolio/features/diversification/features/allocation/components/PositionsToggle.view'
import { buildAllocationTrend } from '@/domains/portfolio/features/diversification/features/allocation/helpers/calculators/allocationChartCalculations/buildAllocationTrend'
import { useDashboardDiversificationFilters } from '@/domains/portfolio/features/diversification/features/allocation/services/actions/useDashboardDiversificationFilters'
import { useDashboardDiversificationPositions } from '@/domains/portfolio/features/diversification/features/allocation/services/actions/useDashboardDiversificationPositions'
import { dashboardDiversificationFilterAtom } from '@/domains/portfolio/features/diversification/features/allocation/stores/dashboardAllocation/dashboardDiversificationFilterAtom'
import { dashboardDiversificationPositionsOpenAtom } from '@/domains/portfolio/features/diversification/features/allocation/stores/dashboardAllocation/dashboardDiversificationPositionsOpenAtom'
import type { AllocationDimension } from '@/domains/portfolio/features/diversification/features/allocation/types/allocationChart.type'
import { ScopedInfoTooltip } from '@/domains/portfolio/shared/components/kpis/ScopedInfoTooltip.feature'
import type { AllocationPoint } from '@/domains/portfolio/shared/types/allocationPoint.type'
import i18n from '@/i18n/i18n'

import { EvoCardView } from './EvoCard.view'

export function EvoCard({
  title,
  points,
  dimension,
}: {
  title: string
  points: AllocationPoint[]
  dimension: AllocationDimension
}) {
  const activeFilter = useAtomValue(dashboardDiversificationFilterAtom)
  const positionsOpen = useAtomValue(dashboardDiversificationPositionsOpenAtom)
  const { toggleFilter } = useDashboardDiversificationFilters()
  const { togglePositions } = useDashboardDiversificationPositions()
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
