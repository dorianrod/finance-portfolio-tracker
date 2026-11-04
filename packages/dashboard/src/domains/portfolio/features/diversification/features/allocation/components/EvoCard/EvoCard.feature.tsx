import { useAtomValue } from 'jotai'
import { useCallback, useMemo } from 'react'

import { AllocationPositionsToggle } from '@/domains/portfolio/features/diversification/features/allocation/components/AllocationPositionsToggle.feature'
import { allocationTrendDomain } from '@/domains/portfolio/features/diversification/features/allocation/components/EvoCard/helpers/presenters/allocationTrendDomain'
import { buildAllocationTrend } from '@/domains/portfolio/features/diversification/features/allocation/components/EvoCard/helpers/presenters/buildAllocationTrend'
import { useDashboardDiversificationFilters } from '@/domains/portfolio/features/diversification/features/allocation/services/actions/useDashboardDiversificationFilters'
import { dashboardDiversificationFilterAtom } from '@/domains/portfolio/features/diversification/features/allocation/stores/dashboardAllocation/dashboardDiversificationFilter.atoms'
import type { AllocationDimension } from '@/domains/portfolio/features/diversification/features/allocation/types/allocationChart.type'
import { FilterScopePresentation } from '@/domains/portfolio/shared/components/filters/FilterScopePresentation.view'
import { InfoTooltip } from '@/domains/portfolio/shared/components/kpis/InfoTooltip.view'
import { useFilterScopeContext } from '@/domains/portfolio/shared/services/useFilterScopeContext'
import type { AllocationPoint } from '@/domains/portfolio/shared/types/allocationPoint.type'
import type { FilterScopeSpec } from '@/domains/portfolio/shared/types/filterScope.type'
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
  const scopeContext = useFilterScopeContext()

  const activeFilter = useAtomValue(dashboardDiversificationFilterAtom)
  const { toggleFilter } = useDashboardDiversificationFilters()
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
  const scopeSpec: FilterScopeSpec = { account: 'filterable', period: 'range' }
  return (
    <EvoCardView
      title={title}
      trend={model}
      dateDomain={model.dateDomain}
      activeCategory={
        activeFilter?.type === dimension ? activeFilter.value : null
      }
      isFiltered={activeFilter !== null}
      onSelect={selectCategory}
    >
      <EvoCardView.Tooltip>
        <InfoTooltip
          text={i18n.t('ui.evocard.historicalPortfolioAllocationByValue0', {
            value0: title.toLowerCase(),
          })}
        >
          <InfoTooltip.Footer>
            <FilterScopePresentation
              scope={scopeSpec}
              scopeContext={scopeContext}
            />
          </InfoTooltip.Footer>
        </InfoTooltip>
      </EvoCardView.Tooltip>
      <EvoCardView.PositionsControl>
        <AllocationPositionsToggle dimension={dimension} />
      </EvoCardView.PositionsControl>
    </EvoCardView>
  )
}
