import { useMemo } from 'react'
import { skipToken, useQuery } from '@tanstack/react-query'
import type { DashboardData } from '@/domains/portfolio/shared/types/dashboardData.type'
import { portfolioQueryKeys } from '@/domains/portfolio/shared/apis/queryKeys'
import { buildAccountFilterLabels } from '@/domains/portfolio/shared/components/filters/helpers/filters/portfolioFilters'

export function useAccountFilterLabels() {
  const dashboardQuery = useQuery<DashboardData>({
    queryKey: portfolioQueryKeys.data('dashboard'),
    queryFn: skipToken,
  })

  return useMemo(
    () => buildAccountFilterLabels(
      dashboardQuery.data?.positions ?? [],
      dashboardQuery.data?.accountLabels ?? {},
    ),
    [dashboardQuery.data?.accountLabels, dashboardQuery.data?.positions],
  )
}
