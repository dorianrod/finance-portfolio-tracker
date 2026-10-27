import { useMemo } from 'react'

import { useCachedDashboardDataQuery } from '@/domains/portfolio/shared/apis/queries/useCachedDashboardDataQuery'
import { buildPortfolioFilterOptions } from '@/domains/portfolio/shared/helpers/filters/portfolioFilters/buildPortfolioFilterOptions'

export function usePortfolioFilterOptions() {
  const { data: dashboard } = useCachedDashboardDataQuery()

  return useMemo(
    () =>
      buildPortfolioFilterOptions(
        dashboard?.positions ?? [],
        dashboard?.accountLabels ?? {},
      ),
    [dashboard?.accountLabels, dashboard?.positions],
  )
}
