import { useMemo } from 'react'

import { useCachedDashboardDataQuery } from '@/domains/portfolio/shared/apis/queries/useCachedDashboardDataQuery'
import { useBuildPortfolioFilterOptions } from '@/domains/portfolio/shared/helpers/transformers/portfolioFilters/useBuildPortfolioFilterOptions'

export function usePortfolioFilterOptions() {
  const buildPortfolioFilterOptions = useBuildPortfolioFilterOptions()
  const { data: dashboard } = useCachedDashboardDataQuery()

  return useMemo(
    () =>
      buildPortfolioFilterOptions(
        dashboard?.positions ?? [],
        dashboard?.accountLabels ?? {},
      ),
    [
      buildPortfolioFilterOptions,
      dashboard?.accountLabels,
      dashboard?.positions,
    ],
  )
}
