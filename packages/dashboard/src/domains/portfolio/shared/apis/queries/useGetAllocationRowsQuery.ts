// eslint-disable-next-line local/review-shared-feature-sharing -- reviewed: 2026-10-27; The shell supplies this allocation source to diversification charts and quality assessment coverage. See SHARED_OWNERSHIP_AUDIT.md.
import { useSuspenseQuery } from '@tanstack/react-query'

import { PORTFOLIO_ALLOCATION_QUERY_OPTIONS } from '@/domains/portfolio/shared/apis/queries/portfolioSourceQueries/portfolioAllocationQueryOptions'

export function useGetAllocationRowsQuery() {
  return useSuspenseQuery(PORTFOLIO_ALLOCATION_QUERY_OPTIONS)
}
