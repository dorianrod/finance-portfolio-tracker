import { useAtomValue } from 'jotai'
import { useMemo } from 'react'

import { useDashboardQuality } from '@/domains/portfolio/features/data-quality/features/assessment/helpers/transformers/useDashboardQuality'
import type { FundDiagnostics } from '@/domains/portfolio/features/data-quality/features/assessment/types/fundDiagnostics.type'
import { useQualityIssueScope } from '@/domains/portfolio/features/data-quality/shared/services/useQualityIssueScope'
import { useCachedPortfolioSourceQuery } from '@/domains/portfolio/shared/apis/queries/useCachedPortfolioSourceQuery'
import { portfolioQueryKeys } from '@/domains/portfolio/shared/apis/queryKeys'
import { usePortfolioAllocationData } from '@/domains/portfolio/shared/services/usePortfolioAllocationData'
import { usePortfolioPositionScope } from '@/domains/portfolio/shared/services/usePortfolioPositionScope'
import { usePortfolioSourceData } from '@/domains/portfolio/shared/services/usePortfolioSourceData'
import { dashboardFiltersAtom } from '@/domains/portfolio/shared/stores/dashboardFilters/dashboardFilters.atoms'
import { dashboardActiveTabAtom } from '@/domains/portfolio/shared/stores/dashboardNavigation/dashboardActiveTab.atoms'
import { dashboardHoldingsViewAtom } from '@/domains/portfolio/shared/stores/dashboardNavigation/dashboardHoldingsView.atoms'

export function useQualityAssessmentModel() {
  const activeTab = useAtomValue(dashboardActiveTabAtom)
  const holdingsView = useAtomValue(dashboardHoldingsViewAtom)
  const filters = useAtomValue(dashboardFiltersAtom)
  const { latestAccountPositions, tableFiltered } = usePortfolioPositionScope()
  const { fundHoldings } = usePortfolioSourceData()
  const { data: diagnostics = EMPTY_DIAGNOSTICS } =
    useCachedPortfolioSourceQuery<FundDiagnostics>(
      portfolioQueryKeys.data('fund-diagnostics'),
    )
  const fundData = useMemo(
    () => ({ ...fundHoldings, ...diagnostics }),
    [fundHoldings, diagnostics],
  )
  const rawAllocationData = usePortfolioAllocationData()
  const { pipelineErrors, manualPriceOverrides, pipelineErrorsLoading } =
    useQualityIssueScope()
  const quality = useDashboardQuality({
    activeTab,
    holdingsView,
    filters,
    latestAccountPositions,
    tableFiltered,
    fundData,
    rawAllocationData,
    pipelineErrors,
    manualPriceOverrides,
    pipelineErrorsLoading,
  })
  return {
    ...quality,
    fundData,
    rawAllocationData,
    latestAccountPositions,
    pipelineErrorsLoading,
  }
}
const EMPTY_DIAGNOSTICS: FundDiagnostics = {
  report: null,
  snapshots: [],
  unresolved: [],
}
