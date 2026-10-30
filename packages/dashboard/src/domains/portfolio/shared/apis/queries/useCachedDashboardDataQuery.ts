import { portfolioQueryKeys } from '@/domains/portfolio/shared/apis/queryKeys'
import type { DashboardData } from '@/domains/portfolio/shared/types/dashboardData.type'

import { useCachedPortfolioSourceQuery } from './useCachedPortfolioSourceQuery'

export function useCachedDashboardDataQuery() {
  return useCachedPortfolioSourceQuery<DashboardData>(
    portfolioQueryKeys.data('dashboard'),
  )
}
