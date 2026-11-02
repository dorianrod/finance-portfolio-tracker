import { useAtomValue } from 'jotai'
import { useMemo } from 'react'

import { useGetDemoFilteredHistoryAccountsQuery } from '@/domains/portfolio/features/scope-selection/apis/queries/useGetDemoFilteredHistoryAccountsQuery'
import { buildDemoPresetSelection } from '@/domains/portfolio/features/scope-selection/helpers/transformers/buildDemoPresetSelection'
import { isDemoPresetActive } from '@/domains/portfolio/features/scope-selection/helpers/transformers/isDemoPresetActive'
import { usePortfolioFilterOptions } from '@/domains/portfolio/shared/services/usePortfolioFilterOptions'
import { dashboardFiltersAtom } from '@/domains/portfolio/shared/stores/dashboardFilters/dashboardFilters.atoms'

export function useDemoPresetScope() {
  const { accounts } = useAtomValue(dashboardFiltersAtom)
  const { allAccounts } = usePortfolioFilterOptions()
  const { data: demoPresetAccounts = null } =
    useGetDemoFilteredHistoryAccountsQuery()
  return useMemo(
    () => ({
      demoPresetSelection: buildDemoPresetSelection(
        allAccounts,
        demoPresetAccounts,
      ),
      demoPresetActive: isDemoPresetActive(accounts, demoPresetAccounts),
    }),
    [accounts, allAccounts, demoPresetAccounts],
  )
}
