import { skipToken, useQuery, useQueryClient } from '@tanstack/react-query'

import { getPortfolioDashboardQueryOptions } from '@/domains/portfolio/shared/apis/queries/portfolioSourceQueries/portfolioDashboardQueryOptions'

/* Passive subscriptions preserve the editable shell while sibling Suspense consumers load these sources. */
export function useCachedDashboardDataQuery() {
  const queryClient = useQueryClient()
  return useQuery({
    ...getPortfolioDashboardQueryOptions(queryClient),
    queryFn: skipToken,
    placeholderData: undefined,
  })
}
