// eslint-disable-next-line local/shared-feature-usage -- The shell supplies this allocation source to diversification charts and quality assessment coverage. See SHARED_OWNERSHIP_AUDIT.md.
import { useQuery } from '@tanstack/react-query'

import { PORTFOLIO_ALLOCATION_QUERY_OPTIONS } from '@/domains/portfolio/shared/apis/queries/portfolioSourceQueries/portfolioAllocationQueryOptions'

export function useAllocationRowsQuery() {
  return useQuery(PORTFOLIO_ALLOCATION_QUERY_OPTIONS)
}
