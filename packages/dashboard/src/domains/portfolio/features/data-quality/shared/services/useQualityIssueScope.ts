import { useAtomValue } from 'jotai'
import { useMemo } from 'react'

import { PORTFOLIO_MANUAL_PRICE_OVERRIDES_QUERY_OPTIONS } from '@/domains/portfolio/features/data-quality/shared/apis/queries/portfolioSourceQueries/portfolioManualPriceOverridesQueryOptions'
import { PORTFOLIO_PIPELINE_ERRORS_QUERY_OPTIONS } from '@/domains/portfolio/features/data-quality/shared/apis/queries/portfolioSourceQueries/portfolioPipelineErrorsQueryOptions'
import { scopeManualPriceOverrides } from '@/domains/portfolio/features/data-quality/shared/helpers/transformers/scopeManualPriceOverrides'
import { scopePipelineErrors } from '@/domains/portfolio/features/data-quality/shared/helpers/transformers/scopePipelineErrors'
import type { ManualPriceOverride } from '@/domains/portfolio/features/data-quality/shared/types/manualPriceOverride.type'
import type { PipelineError } from '@/domains/portfolio/features/data-quality/shared/types/pipelineError.type'
import { useCachedPortfolioSourceQuery } from '@/domains/portfolio/shared/apis/queries/useCachedPortfolioSourceQuery'
import { usePortfolioPositionScope } from '@/domains/portfolio/shared/services/usePortfolioPositionScope'
import { dashboardFiltersAtom } from '@/domains/portfolio/shared/stores/dashboardFilters/dashboardFilters.atoms'
import { dashboardActiveTabAtom } from '@/domains/portfolio/shared/stores/dashboardNavigation/dashboardActiveTab.atoms'
import { dashboardHoldingsViewAtom } from '@/domains/portfolio/shared/stores/dashboardNavigation/dashboardHoldingsView.atoms'

export function useQualityIssueScope() {
  const filters = useAtomValue(dashboardFiltersAtom)
  const activeTab = useAtomValue(dashboardActiveTabAtom)
  const holdingsView = useAtomValue(dashboardHoldingsViewAtom)
  const { latestAccountPositions, tableFiltered } = usePortfolioPositionScope()
  const {
    data: pipelineErrors = EMPTY_ERRORS,
    isPending: pipelineErrorsLoading,
  } = useCachedPortfolioSourceQuery<PipelineError[]>(
    PORTFOLIO_PIPELINE_ERRORS_QUERY_OPTIONS.queryKey,
  )
  const { data: manualPriceOverrides = EMPTY_OVERRIDES } =
    useCachedPortfolioSourceQuery<ManualPriceOverride[]>(
      PORTFOLIO_MANUAL_PRICE_OVERRIDES_QUERY_OPTIONS.queryKey,
    )
  const pipelinePositions =
    activeTab === 'holdings' && holdingsView === 'positions'
      ? tableFiltered
      : latestAccountPositions
  const scopedPipelineErrors = useMemo(
    () => scopePipelineErrors(pipelineErrors, pipelinePositions, filters),
    [filters, pipelineErrors, pipelinePositions],
  )
  const scopedManualPriceOverrides = useMemo(
    () =>
      scopeManualPriceOverrides(
        manualPriceOverrides,
        latestAccountPositions,
        filters,
      ),
    [filters, latestAccountPositions, manualPriceOverrides],
  )
  return {
    pipelineErrors,
    manualPriceOverrides,
    scopedPipelineErrors,
    scopedManualPriceOverrides,
    pipelineErrorsLoading,
  }
}
const EMPTY_ERRORS: PipelineError[] = []
const EMPTY_OVERRIDES: ManualPriceOverride[] = []
