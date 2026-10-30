// eslint-disable-next-line local/review-shared-feature-sharing -- reviewed: 2026-10-27; The shell supplies this savings source to wealth analysis and overview comparisons. See SHARED_OWNERSHIP_AUDIT.md.
import {
  keepPreviousData,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { useMemo } from 'react'

import { PORTFOLIO_ACCOUNT_SAVINGS_QUERY_OPTIONS } from '@/domains/portfolio/shared/apis/queries/portfolioSourceQueries/portfolioAccountSavingsQueryOptions'
import { PORTFOLIO_SAVING_CAPACITY_QUERY_OPTIONS } from '@/domains/portfolio/shared/apis/queries/portfolioSourceQueries/portfolioSavingCapacityQueryOptions'
import { portfolioQueryKeys } from '@/domains/portfolio/shared/apis/queryKeys'
import { rawAccountSet } from '@/domains/portfolio/shared/helpers/transformers/accountFilter/rawAccountSet'
import { aggregateSavingCapacityByAccount } from '@/domains/portfolio/shared/helpers/transformers/aggregateSavingCapacity/aggregateSavingCapacityByAccount'
import type { SavingCapacityPoint } from '@/domains/portfolio/shared/types/savingCapacityPoint.type'

export function useGetSavingCapacityQuery(accounts?: Set<string>) {
  const queryClient = useQueryClient()
  const selectedAccounts = useMemo(
    () => (accounts ? [...accounts].toSorted() : []),
    [accounts],
  )

  return useQuery<SavingCapacityPoint[]>({
    queryKey: portfolioQueryKeys.data('saving-capacity', selectedAccounts),
    placeholderData: keepPreviousData,
    queryFn: async () => {
      if (selectedAccounts.length === 0) {
        return queryClient.query({
          ...PORTFOLIO_SAVING_CAPACITY_QUERY_OPTIONS,
          staleTime: 'static',
        })
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
