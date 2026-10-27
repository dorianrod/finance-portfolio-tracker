import { useMemo } from 'react'

import { useCachedDashboardDataQuery } from '@/domains/portfolio/shared/apis/queries/useCachedDashboardDataQuery'
import { buildAccountFilterLabels } from '@/domains/portfolio/shared/helpers/filters/portfolioFilters/buildAccountFilterLabels'

export function useAccountFilterLabels() {
  const { data: dashboard } = useCachedDashboardDataQuery()

  return useMemo(
    () =>
      buildAccountFilterLabels(
        dashboard?.positions ?? [],
        dashboard?.accountLabels ?? {},
      ),
    [dashboard?.accountLabels, dashboard?.positions],
  )
}
