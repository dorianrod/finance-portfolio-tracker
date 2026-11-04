import { useSuspenseQuery } from '@tanstack/react-query'

import { PORTFOLIO_FUND_HOLDINGS_QUERY_OPTIONS } from '@/domains/portfolio/shared/apis/queries/portfolioSourceQueries/portfolioFundHoldingsQueryOptions'

export function useGetFundHoldingsQuery() {
  return useSuspenseQuery(PORTFOLIO_FUND_HOLDINGS_QUERY_OPTIONS)
}
