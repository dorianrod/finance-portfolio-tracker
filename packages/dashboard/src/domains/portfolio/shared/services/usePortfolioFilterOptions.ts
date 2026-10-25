import { skipToken, useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'

import { portfolioQueryKeys } from '@/domains/portfolio/shared/apis/queryKeys'
import { buildPortfolioFilterOptions } from '@/domains/portfolio/shared/helpers/filters/portfolioFilters'
import type { DashboardData } from '@/domains/portfolio/shared/types/dashboardData.type'

export function usePortfolioFilterOptions() {
  const dashboardQuery = useQuery<DashboardData>({
    queryKey: portfolioQueryKeys.data('dashboard'),
    queryFn: skipToken,
  })

  return useMemo(
    () =>
      buildPortfolioFilterOptions(
        dashboardQuery.data?.positions ?? [],
        dashboardQuery.data?.accountLabels ?? {},
      ),
    [dashboardQuery.data?.accountLabels, dashboardQuery.data?.positions],
  )
}
