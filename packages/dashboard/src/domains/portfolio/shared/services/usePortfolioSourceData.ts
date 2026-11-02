import { PORTFOLIO_FUND_HOLDINGS_QUERY_OPTIONS } from '@/domains/portfolio/shared/apis/queries/portfolioSourceQueries/portfolioFundHoldingsQueryOptions'
import { useCachedDashboardDataQuery } from '@/domains/portfolio/shared/apis/queries/useCachedDashboardDataQuery'
import { useCachedPortfolioSourceQuery } from '@/domains/portfolio/shared/apis/queries/useCachedPortfolioSourceQuery'
import type { DashboardData } from '@/domains/portfolio/shared/types/dashboardData.type'
import type { FundHoldingsData } from '@/domains/portfolio/shared/types/fundHoldingsData.type'

export function usePortfolioSourceData() {
  const { data: dashboardData = EMPTY_DASHBOARD_DATA } =
    useCachedDashboardDataQuery()
  const { data: fundHoldings = EMPTY_FUND_HOLDINGS } =
    useCachedPortfolioSourceQuery<FundHoldingsData>(
      PORTFOLIO_FUND_HOLDINGS_QUERY_OPTIONS.queryKey,
    )
  return { ...dashboardData, fundHoldings }
}
const EMPTY_DASHBOARD_DATA: DashboardData = {
  positions: [],
  rawPositions: [],
  rawOperations: [],
  accountLabels: {},
}
const EMPTY_FUND_HOLDINGS: FundHoldingsData = {
  holdings: [],
  history: [],
  statuses: [],
}
