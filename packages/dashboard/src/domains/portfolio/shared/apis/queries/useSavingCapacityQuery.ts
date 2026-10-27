// eslint-disable-next-line local/review-shared-feature-sharing -- reviewed: 2026-10-27; The shell supplies this savings source to wealth analysis and overview comparisons. See SHARED_OWNERSHIP_AUDIT.md.
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo } from 'react'

import { PORTFOLIO_ACCOUNT_SAVINGS_QUERY_OPTIONS } from '@/domains/portfolio/shared/apis/queries/portfolioSourceQueries/portfolioAccountSavingsQueryOptions'
import { PORTFOLIO_SAVING_CAPACITY_QUERY_OPTIONS } from '@/domains/portfolio/shared/apis/queries/portfolioSourceQueries/portfolioSavingCapacityQueryOptions'
import { portfolioQueryKeys } from '@/domains/portfolio/shared/apis/queryKeys'
import { aggregateSavingCapacityByAccount } from '@/domains/portfolio/shared/helpers/aggregators/aggregateSavingCapacity/aggregateSavingCapacityByAccount'
import { mapSavingCapacity } from '@/domains/portfolio/shared/helpers/aggregators/aggregateSavingCapacity/mapSavingCapacity'
import { rawAccountSet } from '@/domains/portfolio/shared/helpers/filters/accountFilter/rawAccountSet'
import type { SavingCapacityPoint } from '@/domains/portfolio/shared/types/savingCapacityPoint.type'

export function useSavingCapacityQuery(accounts?: Set<string>) {
  const queryClient = useQueryClient()
  const selectedAccounts = useMemo(
    () => (accounts ? [...accounts].toSorted() : []),
    [accounts],
  )

  return useQuery<SavingCapacityPoint[]>({
    queryKey: portfolioQueryKeys.data('saving-capacity', selectedAccounts),
    queryFn: async () => {
      if (selectedAccounts.length === 0) {
        return mapSavingCapacity(
          await queryClient.query({
            ...PORTFOLIO_SAVING_CAPACITY_QUERY_OPTIONS,
            staleTime: 'static',
          }),
        )
      }

      const accountSet = rawAccountSet(new Set(selectedAccounts)) ?? new Set()
      return aggregateSavingCapacityByAccount(
        await queryClient.query({
          ...PORTFOLIO_ACCOUNT_SAVINGS_QUERY_OPTIONS,
          staleTime: 'static',
        }),
        accountSet,
      )
    },
  })
}
