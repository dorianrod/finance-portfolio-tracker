import { useQuery } from '@tanstack/react-query'

import { PORTFOLIO_POSITIONS_QUERY_OPTIONS } from './portfolioSourceQueries'

export function usePositionsQuery() {
  return useQuery(PORTFOLIO_POSITIONS_QUERY_OPTIONS)
}
