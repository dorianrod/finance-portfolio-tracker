import { useAtomValue } from 'jotai'
import { useMemo } from 'react'

import { useBuildDashboardLoadState } from '@/app/helpers/presenters/useBuildDashboardLoadState'
import { useCachedDashboardSources } from '@/app/services/useCachedDashboardSources'
import { useGetPassiveIncomeQuery } from '@/domains/portfolio/features/performance/apis/queries/useGetPassiveIncomeQuery'
import { useGetSavingCapacityQuery } from '@/domains/portfolio/shared/apis/queries/useGetSavingCapacityQuery'
import { dashboardFiltersAtom } from '@/domains/portfolio/shared/stores/dashboardFilters/dashboardFilters.atoms'

/*
 * @architecture-decision dashboard-models-at-consumers
 * @rules arch-no-prop-drilling, arch-shared-no-domain-knowledge, state-server-state-in-react-query
 * @choice The shell observes source status; capabilities read the same caches and own their calculations.
 * @reason Consumers need scoped inputs directly, and server data must stay in React Query during filter changes.
 * @alternative A shell-wide dashboard object adds forwarding layers; placing its server data in atoms duplicates cache ownership.
 * @revisit Required source lifecycles become independent of the persistent dashboard shell.
 */
export function useDashboardViewModel() {
  const sources = useCachedDashboardSources()
  const filters = useAtomValue(dashboardFiltersAtom)
  const savings = useGetSavingCapacityQuery(filters.accounts)
  const income = useGetPassiveIncomeQuery(
    filters.accounts,
    filters.dateFrom,
    filters.dateTo,
  )
  const buildLoadState = useBuildDashboardLoadState()
  const loadState = buildLoadState(
    [...sources, savings, income].map((source) => ({
      error: source.error,
      isPending: source.isPending,
    })),
  )
  const updating = savings.isPlaceholderData || income.isPlaceholderData
  return useMemo(
    () => ({
      loadState,
      updating,
      loading: loadState.status === 'loading',
      error: loadState.status === 'error' ? loadState.message : null,
    }),
    [loadState, updating],
  )
}
