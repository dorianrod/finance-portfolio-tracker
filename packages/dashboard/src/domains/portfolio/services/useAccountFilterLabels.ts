import { useMemo } from 'react'
import { skipToken, useQuery } from '@tanstack/react-query'
import type { DashboardData } from '@/domains/portfolio/apis/queries/useData'
import { portfolioQueryKeys } from '@/domains/portfolio/apis/queryKeys'
import { buildAccountFilterLabels } from '@/domains/portfolio/components/filters/helpers/filters/portfolioFilters'

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
