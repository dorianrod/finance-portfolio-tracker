// eslint-disable-next-line local/review-shared-feature-sharing -- reviewed: 2026-10-27; Snapshot history feeds wealth account-type history directly and overview and performance through useDashboardHistory. See SHARED_OWNERSHIP_AUDIT.md.
import { useQuery } from '@tanstack/react-query'

import { PORTFOLIO_POSITIONS_QUERY_OPTIONS } from '@/domains/portfolio/shared/apis/queries/portfolioSourceQueries/portfolioPositionsQueryOptions'

export function usePositionsQuery() {
  return useQuery(PORTFOLIO_POSITIONS_QUERY_OPTIONS)
}
