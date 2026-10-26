import { useQuery } from '@tanstack/react-query'

import { PORTFOLIO_ALLOCATION_QUERY_OPTIONS } from '@/domains/portfolio/shared/apis/queries/portfolioSourceQueries/portfolioAllocationQueryOptions'

export function useAllocationRowsQuery() {
  return useQuery(PORTFOLIO_ALLOCATION_QUERY_OPTIONS)
}
