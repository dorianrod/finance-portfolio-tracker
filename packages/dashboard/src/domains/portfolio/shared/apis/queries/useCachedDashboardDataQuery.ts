import { skipToken, useQuery } from '@tanstack/react-query'

import { portfolioQueryKeys } from '@/domains/portfolio/shared/apis/queryKeys'
import type { DashboardData } from '@/domains/portfolio/shared/types/dashboardData.type'

export function useCachedDashboardDataQuery() {
  return useQuery<DashboardData>({
    queryKey: portfolioQueryKeys.data('dashboard'),
    queryFn: skipToken,
  })
}
