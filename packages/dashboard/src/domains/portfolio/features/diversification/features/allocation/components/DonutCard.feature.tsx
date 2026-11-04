import { useAtomValue } from 'jotai'
import { useCallback, useMemo } from 'react'

import { AllocationPositionsToggle } from '@/domains/portfolio/features/diversification/features/allocation/components/AllocationPositionsToggle.feature'
import { useDashboardDiversificationFilters } from '@/domains/portfolio/features/diversification/features/allocation/services/actions/useDashboardDiversificationFilters'
import { dashboardDiversificationFilterAtom } from '@/domains/portfolio/features/diversification/features/allocation/stores/dashboardAllocation/dashboardDiversificationFilter.atoms'
import type { AllocationDimension } from '@/domains/portfolio/features/diversification/features/allocation/types/allocationChart.type'
import { FilterScopePresentation } from '@/domains/portfolio/shared/components/filters/FilterScopePresentation.view'
import { InfoTooltip } from '@/domains/portfolio/shared/components/kpis/InfoTooltip.view'
import { buildAllocationPieData } from '@/domains/portfolio/shared/helpers/transformers/buildAllocationPieData'
import { useFilterScopeContext } from '@/domains/portfolio/shared/services/useFilterScopeContext'
import type { AllocationPoint } from '@/domains/portfolio/shared/types/allocationPoint.type'
import type { FilterScopeSpec } from '@/domains/portfolio/shared/types/filterScope.type'
import type { PieEntry } from '@/domains/portfolio/shared/types/pieEntry.type'
import i18n from '@/i18n/i18n'

import { DonutCardView } from './DonutCard.view'

export function DonutCard({
  title,
  point,
  dimension,
}: {
  title: string
  point: AllocationPoint
  dimension: AllocationDimension
}) {
  const scopeContext = useFilterScopeContext()

  const activeFilter = useAtomValue(dashboardDiversificationFilterAtom)
  const { toggleFilter } = useDashboardDiversificationFilters()
  const { total, data } = useMemo(() => buildAllocationPieData(point), [point])
  const selectCategory = useCallback(
    (entry: PieEntry | undefined) => {
      if (entry && (entry.subItems?.length ?? 0) === 0)
        toggleFilter({ type: dimension, value: entry.name })
    },
    [dimension, toggleFilter],
  )
  const scopeSpec: FilterScopeSpec = {
    account: 'filterable',
    period: 'as-of',
    effectiveDate: point.date,
  }
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
        <AllocationPositionsToggle dimension={dimension} />
      </DonutCardView.PositionsControl>
      <DonutCardView.Tooltip>
        <InfoTooltip
          text={i18n.t(
            'ui.donutcard.portfolioAllocationByValue0AtTheDisplayedSnapshot',
            {
              value0: title.toLowerCase(),
            },
          )}
        >
          <InfoTooltip.Footer>
            <FilterScopePresentation
              scope={scopeSpec}
              scopeContext={scopeContext}
            />
          </InfoTooltip.Footer>
        </InfoTooltip>
      </DonutCardView.Tooltip>
    </DonutCardView>
  )
}
