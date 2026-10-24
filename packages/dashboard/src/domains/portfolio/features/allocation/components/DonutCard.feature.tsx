import { useAtomValue } from 'jotai'
import { useCallback, useMemo } from 'react'

import { ScopedInfoTooltip } from '@/domains/portfolio/shared/components/kpis/ScopedInfoTooltip.feature'
import {
  formatGroupedAllocationLabel,
  groupAllocationTail,
} from '@/domains/portfolio/shared/helpers/presenters/groupAllocationTail'
import { useDashboardAllocationFilters } from '@/domains/portfolio/shared/services/actions/useDashboardAllocationFilters'
import { useDashboardAllocationPositions } from '@/domains/portfolio/shared/services/actions/useDashboardAllocationPositions'
import {
  dashboardAllocationFilterAtom,
  dashboardAllocationPositionsOpenAtom,
} from '@/domains/portfolio/shared/stores/dashboardAllocation.atoms'
import type {
  AllocationDimension,
  PieEntry,
} from '@/domains/portfolio/shared/types/allocationChart.type'
import type { AllocationPoint } from '@/domains/portfolio/shared/types/allocationPoint.type'
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
  const activeFilter = useAtomValue(dashboardAllocationFilterAtom)
  const positionsOpen = useAtomValue(dashboardAllocationPositionsOpenAtom)
  const { toggleFilter } = useDashboardAllocationFilters()
  const { togglePositions } = useDashboardAllocationPositions()
  const { total, data } = useMemo(() => {
    const total = point.categories.reduce((s, c) => s + c.value, 0)

    const { main, grouped } = groupAllocationTail(point.categories)
    const groupedTotal = grouped.reduce((s, c) => s + c.value, 0)
    const data: PieEntry[] = [
      ...main.map((c) => ({ ...c, total })),
      ...(grouped.length > 1
        ? [
            {
              name: formatGroupedAllocationLabel(grouped.length),
              value: groupedTotal,
              total,
              subItems: grouped,
            },
          ]
        : []),
    ]

    return { total, data }
  }, [point])
  const selectCategory = useCallback(
    (entry: PieEntry | undefined) => {
      if (entry && !entry.subItems?.length)
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
