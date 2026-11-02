import { FundLookThroughTab } from '@/domains/portfolio/features/holdings/features/fund-look-through/components/FundLookThroughTab.feature'
import { useGetPortfolioSourcesQuery } from '@/domains/portfolio/shared/apis/queries/useGetPortfolioSourcesQuery'
import { usePortfolioPositionScope } from '@/domains/portfolio/shared/services/usePortfolioPositionScope'
export function FundLookThroughPage() {
  useGetPortfolioSourcesQuery()
  const { currentPositions, periodEndFundHoldings } =
    usePortfolioPositionScope()
  return (
    <FundLookThroughTab
      positions={currentPositions}
      holdings={periodEndFundHoldings}
    />
  )
}
