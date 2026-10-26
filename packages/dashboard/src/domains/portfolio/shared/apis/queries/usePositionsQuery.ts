import { useQuery } from '@tanstack/react-query'

import { PORTFOLIO_POSITIONS_QUERY_OPTIONS } from '@/domains/portfolio/shared/apis/queries/portfolioSourceQueries/portfolioPositionsQueryOptions'

export function usePositionsQuery() {
  return useQuery(PORTFOLIO_POSITIONS_QUERY_OPTIONS)
}
