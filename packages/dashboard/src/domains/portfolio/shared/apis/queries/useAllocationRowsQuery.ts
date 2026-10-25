import { useQuery } from '@tanstack/react-query'

import { PORTFOLIO_ALLOCATION_QUERY_OPTIONS } from './portfolioSourceQueries'

export function useAllocationRowsQuery() {
  return useQuery(PORTFOLIO_ALLOCATION_QUERY_OPTIONS)
}
