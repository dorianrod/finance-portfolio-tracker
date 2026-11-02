import { useAtomValue } from 'jotai'
import { useMemo } from 'react'

import { ConcentrationSection } from '@/domains/portfolio/features/diversification/features/concentration/components/ConcentrationSection.feature'
import { dashboardDiversificationViewAtom } from '@/domains/portfolio/features/diversification/shared/stores/dashboardDiversification.atoms'
import { useGetPortfolioSourcesQuery } from '@/domains/portfolio/shared/apis/queries/useGetPortfolioSourcesQuery'
import { isAssetAnalysisApplicablePosition } from '@/domains/portfolio/shared/helpers/transformers/isAssetAnalysisApplicablePosition'
import { usePortfolioPositionScope } from '@/domains/portfolio/shared/services/usePortfolioPositionScope'
import { usePortfolioSourceData } from '@/domains/portfolio/shared/services/usePortfolioSourceData'
import { dashboardFiltersAtom } from '@/domains/portfolio/shared/stores/dashboardFilters/dashboardFilters.atoms'
export function ConcentrationPage() {
  useGetPortfolioSourcesQuery()
  const { rawPositions, fundHoldings } = usePortfolioSourceData()
  const { currentPositions, periodEndFundHoldings } =
    usePortfolioPositionScope()
  const applicablePositions = useMemo(
    () => currentPositions.filter(isAssetAnalysisApplicablePosition),
    [currentPositions],
  )
  const filters = useAtomValue(dashboardFiltersAtom)
  const view = useAtomValue(dashboardDiversificationViewAtom)
  return (
    <ConcentrationSection
      view={view}
      positions={applicablePositions}
      fundHoldings={periodEndFundHoldings}
      dateTo={filters.dateTo}
      rawPositions={rawPositions}
      fundHoldingsHistory={fundHoldings.history}
      accountFilters={filters.accounts}
      accountTypeFilters={filters.accountTypes}
      dateFrom={filters.dateFrom}
    />
  )
}
