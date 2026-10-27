import { useAtomValue } from 'jotai'
import { useCallback, useMemo } from 'react'

import { useDashboardDiversificationFilters } from '@/domains/portfolio/features/diversification/features/allocation/services/actions/useDashboardDiversificationFilters'
import { useDashboardDiversificationPositions } from '@/domains/portfolio/features/diversification/features/allocation/services/actions/useDashboardDiversificationPositions'
import { dashboardDiversificationFilterAtom } from '@/domains/portfolio/features/diversification/features/allocation/stores/dashboardAllocation/dashboardDiversificationFilterAtom'
import { dashboardDiversificationPositionsOpenAtom } from '@/domains/portfolio/features/diversification/features/allocation/stores/dashboardAllocation/dashboardDiversificationPositionsOpenAtom'
import type { AllocationDimension } from '@/domains/portfolio/features/diversification/features/allocation/types/allocationChart.type'
import { ScopedInfoTooltip } from '@/domains/portfolio/shared/components/kpis/ScopedInfoTooltip.feature'
import { buildAllocationPieData } from '@/domains/portfolio/shared/helpers/presenters/groupAllocationTail/buildAllocationPieData'
import type { AllocationPoint } from '@/domains/portfolio/shared/types/allocationPoint.type'
import type { PieEntry } from '@/domains/portfolio/shared/types/pieEntry.type'
import i18n from '@/i18n/i18n'

import { DonutCardView } from './DonutCard.view'
import { PositionsToggle } from './PositionsToggle.view'

export function DonutCard({
  title,
  point,
  dimension,
}: {
  title: string
  point: AllocationPoint
  dimension: AllocationDimension
}) {
  const activeFilter = useAtomValue(dashboardDiversificationFilterAtom)
  const positionsOpen = useAtomValue(dashboardDiversificationPositionsOpenAtom)
  const { toggleFilter } = useDashboardDiversificationFilters()
  const { togglePositions } = useDashboardDiversificationPositions()
  const { total, data } = useMemo(() => buildAllocationPieData(point), [point])
  const selectCategory = useCallback(
    (entry: PieEntry | undefined) => {
      if (entry && (entry.subItems?.length ?? 0) === 0)
        toggleFilter({ type: dimension, value: entry.name })
    },
    [dimension, toggleFilter],
  )
  return (
    <DonutCardView
      title={title}
      date={point.date}
      total={total}
      data={data}
      activeCategory={
        activeFilter?.type === dimension ? activeFilter.value : null
      }
      isFiltered={activeFilter !== null}
      onSelect={selectCategory}
    >
      <DonutCardView.PositionsControl>
        {activeFilter?.type === dimension ? (
          <PositionsToggle open={positionsOpen} onClick={togglePositions} />
        ) : null}
      </DonutCardView.PositionsControl>
      <DonutCardView.Tooltip>
        <ScopedInfoTooltip
          // eslint-disable-next-line local/no-prop-drilling -- The chart feature owns its translated description; the adapter adds live filter scope.
          text={i18n.t(
            'ui.donutcard.portfolioAllocationByValue0AtTheDisplayedSnapshot',
            {
              value0: title.toLowerCase(),
            },
          )}
          // eslint-disable-next-line local/no-prop-drilling -- This feature owns the chart's reporting snapshot.
          scope={{
            account: 'filterable',
            period: 'as-of',
            effectiveDate: point.date,
          }}
        />
      </DonutCardView.Tooltip>
    </DonutCardView>
  )
}
