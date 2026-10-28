import { useMemo } from 'react'

import { useCachedDashboardDataQuery } from '@/domains/portfolio/shared/apis/queries/useCachedDashboardDataQuery'
import { useBuildAccountFilterLabels } from '@/domains/portfolio/shared/helpers/filters/portfolioFilters/useBuildAccountFilterLabels'

export function useAccountFilterLabels() {
  const buildAccountFilterLabels = useBuildAccountFilterLabels()
  const { data: dashboard } = useCachedDashboardDataQuery()

  return useMemo(
    () =>
      buildAccountFilterLabels(
        dashboard?.positions ?? [],
        dashboard?.accountLabels ?? {},
      ),
    [buildAccountFilterLabels, dashboard?.accountLabels, dashboard?.positions],
  )
}
